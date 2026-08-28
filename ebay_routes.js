const express = require('express');
const axios = require('axios');

module.exports = function registerEbayRoutes(app, db) {
  const promiseDb = db.promise ? db.promise() : db;
  // ─── 1. DATABASE SCHEMA INITIALIZATION ───────────────────────
  // Schema is already created in database

  async function getEbayConfig() {
    const [[settings]] = await promiseDb.query("SELECT * FROM ebay_settings WHERE id = 1");
    const isProd = settings && settings.mode === 'production';
    return {
      settings: settings || {},
      apiBase: isProd ? 'https://api.ebay.com' : 'https://api.sandbox.ebay.com',
      authBase: isProd ? 'https://auth.ebay.com' : 'https://auth.sandbox.ebay.com',
      identityBase: isProd ? 'https://api.ebay.com/identity/v1/oauth2/token' : 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
    };
  }

  // ─── HELPER: REFRESH ACCESS TOKEN IF EXPIRED ─────────────────
  async function getValidAccessToken() {
    const { settings, identityBase } = await getEbayConfig();
    if (!settings.refresh_token || !settings.app_id || !settings.cert_id) {
      return null;
    }

    // Check if current access token is still valid (with 5-minute buffer)
    if (settings.access_token && settings.token_expires_at) {
      const expiresAt = new Date(settings.token_expires_at).getTime();
      if (Date.now() < expiresAt - 300000) {
        return settings.access_token;
      }
    }

    // Need refresh
    try {
      const authHeader = 'Basic ' + Buffer.from(`${settings.app_id}:${settings.cert_id}`).toString('base64');
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', settings.refresh_token);
      params.append('scope', 'https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.account');

      const response = await axios.post(identityBase, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': authHeader
        }
      });

      const { access_token, expires_in } = response.data;
      const newExpiresAt = new Date(Date.now() + (expires_in * 1000));

      await promiseDb.query(
        "UPDATE ebay_settings SET access_token = ?, token_expires_at = ? WHERE id = 1",
        [access_token, newExpiresAt]
      );

      console.log('[eBay Auth] Access token successfully refreshed.');
      return access_token;
    } catch (err) {
      console.error('[eBay Token Refresh Error]:', err.response?.data || err.message);
      return null;
    }
  }

  // ─── 2. SETTINGS & CONNECTION STATUS ENDPOINTS ───────────────
  app.get('/api/admin/ebay/settings', async (req, res) => {
    try {
      const [[settings]] = await promiseDb.query("SELECT * FROM ebay_settings WHERE id = 1");
      const isConnected = !!(settings?.refresh_token);
      const isTokenValid = isConnected && settings?.token_expires_at && (new Date(settings.token_expires_at).getTime() > Date.now());

      const [[listingsCount]] = await promiseDb.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN ebay_status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN ebay_status = 'draft' THEN 1 ELSE 0 END) as draft,
          SUM(CASE WHEN ebay_status = 'error' THEN 1 ELSE 0 END) as error
        FROM ebay_listings
      `);

      res.json({
        settings: {
          mode: settings?.mode || 'sandbox',
          app_id: settings?.app_id || '',
          cert_id: settings?.cert_id ? '••••••••' + settings.cert_id.slice(-4) : '',
          dev_id: settings?.dev_id || '',
          ru_name: settings?.ru_name || '',
          marketplace_id: settings?.marketplace_id || 'EBAY_US',
          fulfillment_policy_id: settings?.fulfillment_policy_id || '',
          payment_policy_id: settings?.payment_policy_id || '',
          return_policy_id: settings?.return_policy_id || '',
          auto_sync_stock: !!settings?.auto_sync_stock,
          currency: settings?.currency || 'USD'
        },
        isConnected,
        isTokenValid,
        tokenExpiresAt: settings?.token_expires_at,
        stats: listingsCount || { total: 0, active: 0, draft: 0, error: 0 }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/ebay/settings', async (req, res) => {
    try {
      const {
        mode, app_id, cert_id, dev_id, ru_name,
        marketplace_id, fulfillment_policy_id, payment_policy_id,
        return_policy_id, auto_sync_stock, currency
      } = req.body;

      let updateSql = `
        UPDATE ebay_settings SET
          mode = ?,
          app_id = ?,
          dev_id = ?,
          ru_name = ?,
          marketplace_id = ?,
          fulfillment_policy_id = ?,
          payment_policy_id = ?,
          return_policy_id = ?,
          auto_sync_stock = ?,
          currency = ?
      `;
      let params = [
        mode || 'sandbox', app_id || '', dev_id || '', ru_name || '',
        marketplace_id || 'EBAY_US', fulfillment_policy_id || '',
        payment_policy_id || '', return_policy_id || '',
        auto_sync_stock ? 1 : 0, currency || 'USD'
      ];

      // Only update cert_id if provided and not masked
      if (cert_id && !cert_id.includes('••••')) {
        updateSql += `, cert_id = ?`;
        params.push(cert_id);
      }

      updateSql += ` WHERE id = 1`;

      await promiseDb.query(updateSql, params);
      res.json({ success: true, message: 'eBay settings updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── 3. OAUTH 2.0 CONSENT & CALLBACK ─────────────────────────
  app.get('/api/admin/ebay/auth-url', async (req, res) => {
    try {
      const { settings, authBase } = await getEbayConfig();
      if (!settings.app_id || !settings.ru_name) {
        return res.status(400).json({ error: 'Please configure eBay App ID (Client ID) and RuName first in settings.' });
      }

      const scopes = [
        'https://api.ebay.com/oauth/api_scope/sell.inventory',
        'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
        'https://api.ebay.com/oauth/api_scope/sell.account',
        'https://api.ebay.com/oauth/api_scope/sell.marketing'
      ].join(' ');

      const authUrl = `${authBase}/oauth2/authorize?client_id=${encodeURIComponent(settings.app_id)}&response_type=code&redirect_uri=${encodeURIComponent(settings.ru_name)}&scope=${encodeURIComponent(scopes)}&prompt=login`;

      res.json({ authUrl });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/ebay/callback', async (req, res) => {
    try {
      const { code } = req.query;
      if (!code) {
        return res.status(400).send('Authorization code missing from eBay callback.');
      }

      const { settings, identityBase } = await getEbayConfig();
      const authHeader = 'Basic ' + Buffer.from(`${settings.app_id}:${settings.cert_id}`).toString('base64');

      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', settings.ru_name);

      const response = await axios.post(identityBase, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': authHeader
        }
      });

      const { access_token, expires_in, refresh_token, refresh_token_expires_in } = response.data;
      const tokenExpiresAt = new Date(Date.now() + (expires_in * 1000));
      const refreshTokenExpiresAt = new Date(Date.now() + (refresh_token_expires_in * 1000));

      await promiseDb.query(`
        UPDATE ebay_settings SET
          access_token = ?,
          refresh_token = ?,
          token_expires_at = ?,
          refresh_token_expires_at = ?
        WHERE id = 1
      `, [access_token, refresh_token, tokenExpiresAt, refreshTokenExpiresAt]);

      console.log('[eBay OAuth] Successfully authorized and stored tokens!');
      res.redirect('/admin/ebay?auth=success');
    } catch (err) {
      console.error('[eBay OAuth Callback Error]:', err.response?.data || err.message);
      res.redirect(`/admin/ebay?auth=error&msg=${encodeURIComponent(err.response?.data?.error_description || err.message)}`);
    }
  });

  // ─── 4. PRODUCTS & LISTINGS CATALOG ──────────────────────────
  app.get('/api/admin/ebay/products', async (req, res) => {
    try {
      const [rows] = await promiseDb.query(`
        SELECT 
          p.id as product_id,
          p.name as product_name,
          p.badge as category,
          p.price_num as price_jod,
          COALESCE(p.images, JSON_ARRAY(p.image_url)) as images,
          p.description,
          p.stock_quantity as stock,
          l.id as listing_table_id,
          l.sku,
          l.offer_id,
          l.listing_id,
          l.ebay_price_usd,
          COALESCE(l.ebay_status, 'draft') as ebay_status,
          l.last_sync_at,
          l.error_message
        FROM menu_items p
        LEFT JOIN ebay_listings l ON p.id = l.product_id
        WHERE p.available = 1
        ORDER BY p.id DESC
      `);

      // Compute estimated USD price (1 JOD ≈ 1.41 USD)
      const products = rows.map(r => {
        let parsedImages = [];
        try {
          parsedImages = typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || []);
        } catch (e) {
          parsedImages = r.images ? [r.images] : [];
        }

        const defaultSku = r.sku || `ZB-PROD-${r.product_id}`;
        const defaultUsdPrice = r.ebay_price_usd > 0 ? r.ebay_price_usd : (Number(r.price_jod || 50) * 1.41).toFixed(2);

        return {
          ...r,
          sku: defaultSku,
          ebay_price_usd: Number(defaultUsdPrice),
          images_list: parsedImages
        };
      });

      res.json(products);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── 5. THREE-STEP PUBLISHING PIPELINE TO EBAY ───────────────
  // [1. Create / Update Inventory Item] --> [2. Create Offer] --> [3. Publish Offer]
  app.post('/api/admin/ebay/publish/:productId', async (req, res) => {
    const { productId } = req.params;
    const { customSku, customPriceUsd, customTitle, customDescription } = req.body;

    try {
      const token = await getValidAccessToken();
      const { settings, apiBase } = await getEbayConfig();

      if (!token) {
        return res.status(401).json({ error: 'eBay account is not connected. Please connect via OAuth in settings.' });
      }

      // Fetch product details from DB
      const [[product]] = await promiseDb.query("SELECT * FROM menu_items WHERE id = ?", [productId]);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      let parsedImages = [];
      try {
        parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []);
      } catch (e) {
        parsedImages = product.image_url ? [product.image_url] : [];
      }
      if (parsedImages.length === 0 && product.image_url) {
        parsedImages = [product.image_url];
      }

      // Ensure full absolute URLs for images (eBay requires https://)
      const formattedImages = parsedImages.map(img => {
        if (img.startsWith('http')) return img;
        return `https://zahratbeesan.com${img.startsWith('/') ? '' : '/'}${img}`;
      });

      const sku = (customSku || `ZB-ABAYA-${product.id}`).toUpperCase().trim();
      const priceUsd = Number(customPriceUsd) || Number(((product.price_num || 50) * 1.41).toFixed(2));
      const title = (customTitle || product.name || 'Luxury Fashion Item').slice(0, 80); // eBay max title 80 chars
      const desc = customDescription || product.description || `Luxury Handcrafted Abaya & Modest Islamic Couture by Zahrat Beesan. Premium fabric, handcrafted embroidery, made in Jordan.`;
      const quantity = Math.max(1, Number(product.stock_quantity) || 5);

      console.log(`[eBay Publisher] Step 1: Creating/Updating Inventory Item SKU: ${sku}...`);

      // ── STEP 1: PUT /sell/inventory/v1/inventory_item/{sku}
      const inventoryPayload = {
        availability: {
          shipToLocationAvailability: {
            quantity: quantity
          }
        },
        condition: "NEW",
        product: {
          title: title,
          description: desc,
          imageUrls: formattedImages.length > 0 ? formattedImages : ["https://zahratbeesan.com/logo.png"],
          aspects: {
            "Brand": ["Zahrat Beesan Couture"],
            "Type": ["Abaya", "Islamic Modest Dress"],
            "Style": ["Luxury Modern Abaya", "Maxi Dress", "Kaftan"],
            "Dress Length": ["Long", "Floor Length"],
            "Sleeve Length": ["Long Sleeve"],
            "Occasion": ["Formal", "Party/Cocktail", "Wedding", "Eid", "Ramadan", "Casual"],
            "Material": ["Premium Georgette", "Silk Crepe", "Linen Blend"],
            "Department": ["Women"],
            "Country/Region of Manufacture": ["Jordan"],
            "Size Type": ["Regular"],
            "Handmade": ["Yes"]
          }
        }
      };

      await axios.put(
        `${apiBase}/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`,
        inventoryPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Content-Language': 'en-US'
          }
        }
      );

      console.log(`[eBay Publisher] Step 1 Success! Step 2: Creating Offer for Abaya...`);

      // ── STEP 2: POST /sell/inventory/v1/offer
      const offerPayload = {
        sku: sku,
        marketplaceId: settings.marketplace_id || "EBAY_US",
        format: "FIXED_PRICE",
        availableQuantity: quantity,
        pricingSummary: {
          price: {
            value: priceUsd.toString(),
            currency: settings.currency || "USD"
          }
        },
        listingPolicies: {
          fulfillmentPolicyId: settings.fulfillment_policy_id || "DEFAULT_FULFILLMENT",
          paymentPolicyId: settings.payment_policy_id || "DEFAULT_PAYMENT",
          returnPolicyId: settings.return_policy_id || "DEFAULT_RETURN"
        },
        categoryId: "175759", // Traditional & World Clothing - Women's Abayas & Modest Dresses
        merchantLocationKey: "AMMAN_MAIN_STORE"
      };

      let offerId = '';
      try {
        const offerRes = await axios.post(
          `${apiBase}/sell/inventory/v1/offer`,
          offerPayload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Content-Language': 'en-US'
            }
          }
        );
        offerId = offerRes.data.offerId;
      } catch (offerErr) {
        // If offer already exists for this SKU, retrieve it
        if (offerErr.response?.status === 400 || offerErr.response?.data?.errors?.[0]?.errorId === 25002) {
          const existingOffersRes = await axios.get(
            `${apiBase}/sell/inventory/v1/offer?sku=${encodeURIComponent(sku)}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (existingOffersRes.data.offers?.[0]?.offerId) {
            offerId = existingOffersRes.data.offers[0].offerId;
          } else {
            throw offerErr;
          }
        } else {
          throw offerErr;
        }
      }

      console.log(`[eBay Publisher] Step 2 Success! OfferId: ${offerId}. Step 3: Publishing Offer...`);

      // ── STEP 3: POST /sell/inventory/v1/offer/{offerId}/publish
      let listingId = '';
      const publishRes = await axios.post(
        `${apiBase}/sell/inventory/v1/offer/${encodeURIComponent(offerId)}/publish`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      listingId = publishRes.data.listingId;

      console.log(`[eBay Publisher] Step 3 Success! Product Published LIVE with ListingId: ${listingId}`);

      // Upsert into local ebay_listings table
      await promiseDb.query(`
        INSERT INTO ebay_listings (product_id, sku, offer_id, listing_id, ebay_price_usd, ebay_status, last_sync_at, error_message)
        VALUES (?, ?, ?, ?, ?, 'active', NOW(), NULL)
        ON DUPLICATE KEY UPDATE
          offer_id = VALUES(offer_id),
          listing_id = VALUES(listing_id),
          ebay_price_usd = VALUES(ebay_price_usd),
          ebay_status = 'active',
          last_sync_at = NOW(),
          error_message = NULL
      `, [productId, sku, offerId, listingId, priceUsd]);

      res.json({
        success: true,
        sku,
        offerId,
        listingId,
        liveUrl: `https://www.ebay.com/itm/${listingId}`,
        message: 'Product successfully published to eBay!'
      });

    } catch (err) {
      const errMsg = err.response?.data?.errors ? err.response.data.errors.map(e => e.message).join(' | ') : (err.response?.data?.error_description || err.message);
      console.error('[eBay Publish Error]:', errMsg);

      // Record error in database
      const sku = (customSku || `ZB-PROD-${productId}`).toUpperCase().trim();
      await promiseDb.query(`
        INSERT INTO ebay_listings (product_id, sku, ebay_status, last_sync_at, error_message)
        VALUES (?, ?, 'error', NOW(), ?)
        ON DUPLICATE KEY UPDATE
          ebay_status = 'error',
          last_sync_at = NOW(),
          error_message = VALUES(error_message)
      `, [productId, sku, errMsg]).catch(() => {});

      res.status(500).json({ error: errMsg });
    }
  });

  // ─── 6. REAL-TIME STOCK SYNCING ──────────────────────────────
  app.post('/api/admin/ebay/sync-stock/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
      const token = await getValidAccessToken();
      const { apiBase } = await getEbayConfig();
      if (!token) return res.status(401).json({ error: 'eBay not connected' });

      const [[listing]] = await promiseDb.query("SELECT * FROM ebay_listings WHERE product_id = ?", [productId]);
      const [[product]] = await promiseDb.query("SELECT stock FROM products WHERE id = ?", [productId]);

      if (!listing || !listing.sku) {
        return res.status(404).json({ error: 'Product is not listed on eBay yet.' });
      }

      const qty = Math.max(0, Number(product?.stock) || 0);

      // Update quantity on eBay
      await axios.put(
        `${apiBase}/sell/inventory/v1/inventory_item/${encodeURIComponent(listing.sku)}`,
        {
          availability: {
            shipToLocationAvailability: {
              quantity: qty
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await promiseDb.query("UPDATE ebay_listings SET last_sync_at = NOW(), ebay_status = ? WHERE product_id = ?", [qty > 0 ? 'active' : 'out_of_stock', productId]);

      res.json({ success: true, sku: listing.sku, stock: qty, message: 'Stock updated on eBay' });
    } catch (err) {
      res.status(500).json({ error: err.response?.data || err.message });
    }
  });

  // ─── 7. EBAY WEBHOOK LISTENER FOR ORDERS & EVENTS ────────────
  app.post('/api/ebay/webhook', async (req, res) => {
    try {
      const event = req.body;
      console.log('[eBay Webhook Event Received]:', JSON.stringify(event));

      // Handle Marketplace Order Event (MARKETPLACE_ORDER)
      if (event?.metadata?.topic === 'MARKETPLACE_ORDER' || event?.orderId) {
        const orderData = event.data || event;
        const buyerName = orderData.buyer?.username || orderData.buyer?.name || 'eBay Customer';
        const totalAmount = orderData.pricingSummary?.total?.value || 0;
        
        console.log(`[eBay Webhook] New eBay Order: #${orderData.orderId} from ${buyerName} ($${totalAmount})`);

        // Insert into local orders table
        await promiseDb.query(`
          INSERT INTO orders (
            customer_name, customer_email, customer_phone, total_price,
            status, payment_method, shipping_address, notes
          ) VALUES (?, ?, ?, ?, 'preparing', 'eBay Direct', ?, ?)
        `, [
          buyerName,
          orderData.buyer?.email || 'ebay-buyer@zahratbeesan.com',
          '0790000000',
          (totalAmount * 0.71).toFixed(2), // Convert USD to JOD approx
          JSON.stringify(orderData.shippingStep || orderData.shippingAddress || {}),
          `طلب مستورد آلياً من متجر eBay | Order ID: ${orderData.orderId}`
        ]);
      }

      // Return challenge response for verification if needed
      if (req.query?.challenge_code) {
        const challengeCode = req.query.challenge_code;
        return res.status(200).send(challengeCode);
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.error('[eBay Webhook Error]:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  console.log('[eBay Integration Backend] All eBay REST API routes & Webhooks ready.');
};

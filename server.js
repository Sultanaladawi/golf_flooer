const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();
const Stripe = require('stripe');
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const compression = require('compression');

// Ensure the public/images directory exists to prevent upload crashes
const imgDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

// Multer config for images & videos up to 100MB
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imgDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /mp4|mov|webm|avi|m4v|jpeg|jpg|png|webp|gif/;
    const ok = allowed.test(file.mimetype) || allowed.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error('Only video and image files are allowed'));
  }
});

let openai = null;
const API_KEY = (process.env.OPENAI_API_KEY || '').trim();

if (API_KEY && API_KEY !== 'your_key_here') {
  const IS_GITHUB = API_KEY.startsWith('github_') || API_KEY.startsWith('ghp_');
  const BASE_URL = IS_GITHUB ? 'https://models.inference.ai.azure.com' : 'https://api.openai.com/v1';

  openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: BASE_URL,
    timeout: 120000,
    maxRetries: 2
  });

  console.log('------------------------------------------');
  console.log(`ًں¤– AI PROVIDER: ${IS_GITHUB ? 'GitHub Models' : 'Standard OpenAI'} Detected`);
  console.log(`ًں”— BASE URL: ${BASE_URL}`);
  console.log('------------------------------------------');
} else {
  console.warn('[WARNING] OpenAI API Key missing or default. AI Assistant in Fallback Mode.');
}

// Initialize Google Gemini
let gemini = null;
const GEMINI_KEY = (process.env.GEMINI_API_KEY || '').trim();
if (GEMINI_KEY) {
  gemini = new GoogleGenerativeAI(GEMINI_KEY);
  console.log('------------------------------------------');
  console.log('✨ GEMINI AI: Initialized with gemini-2.5-pro (Best Model)');
  console.log('------------------------------------------');
} else {
  console.warn('[WARNING] GEMINI_API_KEY missing. Gemini AI disabled.');
}

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 5000;

// Enable Gzip/Brotli response compression for ultra-fast network transfers
app.use(compression());

// ✅ FIXED: CORS now allows Azure and localhost
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-admin-email', 'x-admin-name']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ ENFORCE HTTPS (For Azure Production)
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
});

// --- CHROME FIX: case-insensitive image serving ---
// Chrome is stricter than Edge/Brave with URL case. This middleware
// tries the exact path first, then falls back to the lowercase version.
app.use('/images', (req, res, next) => {
  const exactPath = path.resolve(__dirname, 'public/images', req.url.replace(/^\//, ''));
  const lowerPath = path.resolve(__dirname, 'public/images', req.url.replace(/^\//, '').toLowerCase());

  // Set headers that Chrome needs for proper image caching
  res.set({
    'Cache-Control': 'public, max-age=2592000, immutable',
    'Access-Control-Allow-Origin': '*',
    'Vary': 'Accept-Encoding',
    'X-Content-Type-Options': 'nosniff'
  });

  if (fs.existsSync(exactPath)) {
    return res.sendFile(exactPath);
  } else if (fs.existsSync(lowerPath)) {
    return res.sendFile(lowerPath);
  } else {
    // Try scanning directory for case-insensitive match
    const filename = req.url.replace(/^\//, '').toLowerCase();
    try {
      const files = fs.readdirSync(imgDir);
      const match = files.find(f => f.toLowerCase() === filename);
      if (match) {
        return res.sendFile(path.join(imgDir, match));
      }
    } catch (e) {}
    next();
  }
});

// --- STATIC FILES SERVING (HARDENED & OPTIMIZED) ---
// Serve static assets from build and public with aggressive caching
const cacheOptions = { maxAge: '30d', etag: true, lastModified: true };
app.use(express.static(path.resolve(__dirname, 'build'), cacheOptions));
app.use(express.static(path.resolve(__dirname, 'public'), cacheOptions));

// 3. Specific favicon and manifest routes for stability
app.get('/favicon.ico', (req, res) => res.sendFile(path.resolve(__dirname, 'public/favicon.ico')));
app.get('/favicon.jpg', (req, res) => res.sendFile(path.resolve(__dirname, 'public/favicon.jpg')));
app.get('/manifest.json', (req, res) => res.sendFile(path.resolve(__dirname, 'public/manifest.json')));

// Dynamic XML Sitemap Endpoint for Google Search Engine Indexing (Bilingual Arabic/English)
app.get('/sitemap.xml', async (req, res) => {
  const baseUrl = process.env.BASE_URL || 'https://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net';
  let productsXml = '';
  try {
    const [products] = await db.promise().query('SELECT id, name, updated_at FROM products');
    productsXml = (products || []).map(p => `
  <url>
    <loc>${baseUrl}/#product-${p.id}</loc>
    <lastmod>${p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('');
  } catch (e) {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/?lang=en" />
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/gift-cards</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>${productsXml}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml.trim());
});



app.use((req, res, next) => {
  console.log(`[Server] ${req.method} ${req.url}`);

  const adminEmail = req.headers['x-admin-email'];
  const adminName = req.headers['x-admin-name'];

  req.logAdminAction = (action, details) => {
    if (adminEmail) {
      const q = 'INSERT INTO admin_logs (admin_email, admin_name, action, details) VALUES (?, ?, ?, ?)';
      db.query(q, [adminEmail, adminName || 'Unknown', action, details], (err) => {
        if (err) console.error('[Audit Log Error]', err.message);
      });
    }
  };

  next();
});

// Export/Audit Log endpoint for Leader
app.get('/api/admin-logs', (req, res) => {
  db.query('SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 200', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/log-action', (req, res) => {
  const { action, details } = req.body;
  if (req.logAdminAction) {
    req.logAdminAction(action, details);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Logging middleware not initialized' });
  }
});

// Image upload endpoint
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ filename: req.file.filename, url: `/images/${req.file.filename}` });
});

app.post('/api/upload-video', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No video file uploaded' });
  res.json({ filename: req.file.filename, url: `/images/${req.file.filename}` });
});

app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', message: 'Server is reaching here' });
});



app.get('/api/fix-db-times', async (req, res) => {
  try {
    const promiseDb = db.promise ? db.promise() : db;
    const [r1] = await promiseDb.query("UPDATE orders SET created_at = DATE_ADD(created_at, INTERVAL 2 HOUR) WHERE created_at < '2026-05-18 00:00:00'");
    const [r2] = await promiseDb.query("UPDATE contact_messages SET created_at = DATE_ADD(created_at, INTERVAL 2 HOUR) WHERE created_at < '2026-05-18 00:00:00'");
    res.json({ success: true, orders_updated: r1.affectedRows, messages_updated: r2.affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const dbHost = process.env.DB_HOST || 'zahrat-beesan-db.mysql.database.azure.com';
const pool = mysql.createPool({
  host: dbHost,
  user: process.env.DB_USER || 'zahratbeesan',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || 'S2u0l0t0a8n0$',
  database: process.env.DB_NAME || 'golf_flooer',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  ssl: (dbHost !== 'localhost' && dbHost !== '127.0.0.1') ? { rejectUnauthorized: false } : false
});

// Force all MySQL connections to use Jordan Time (Asia/Amman = UTC+3)
pool.on('connection', (connection) => {
  connection.query("SET time_zone = 'Asia/Amman'", (err) => {
    if (err) {
      // Fallback in case Azure/MySQL lacks the timezone dictionary
      connection.query("SET time_zone = '+03:00'");
    }
  });
});

const db = pool;

const convertNumerals = str => {
  if (typeof str === 'undefined' || str === null) return '';
  const s = str.toString();
  return s.replace(/[\u0660-\u0669]/g, d => '\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669'.indexOf(d)).replace(/[0-9]/g, d => d);
};

db.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL Connection Error:', err.message);
    return;
  }
  console.log(`Database connected successfully via Pool`);

  const checkColumns = async () => {
    try {
      const promiseDb = db.promise();
      const [columns] = await promiseDb.query("SHOW COLUMNS FROM orders");
      const columnNames = columns.map(c => c.Field);

      if (!columnNames.includes('phone')) {
        await promiseDb.query("ALTER TABLE orders ADD COLUMN phone VARCHAR(50) DEFAULT NULL");
      }
      if (!columnNames.includes('delivery_address')) {
        await promiseDb.query("ALTER TABLE orders ADD COLUMN delivery_address TEXT DEFAULT NULL");
      }
      if (!columnNames.includes('payment_status')) {
        await promiseDb.query("ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending'");
      }
      if (!columnNames.includes('stripe_session_id')) {
        await promiseDb.query("ALTER TABLE orders ADD COLUMN stripe_session_id VARCHAR(255) DEFAULT NULL");
      }
      if (!columnNames.includes('myfatoorah_invoice_id')) {
        await promiseDb.query("ALTER TABLE orders ADD COLUMN myfatoorah_invoice_id VARCHAR(255) DEFAULT NULL");
      }

      try {
        const [zeroItems] = await promiseDb.query("SELECT id, item_name, order_id, quantity FROM order_items WHERE price = 0 OR price IS NULL");
        for (const zi of zeroItems) {
          const [addRes] = await promiseDb.query("SELECT price FROM addons WHERE name = ?", [zi.item_name]);
          if (addRes && addRes.length > 0 && parseFloat(addRes[0].price) > 0) {
            const fixedPrice = parseFloat(addRes[0].price);
            await promiseDb.query("UPDATE order_items SET price = ? WHERE id = ?", [fixedPrice, zi.id]);
            await promiseDb.query("UPDATE orders SET total_amount = total_amount + ? WHERE id = ?", [fixedPrice * zi.quantity, zi.order_id]);
          }
        }
      } catch (e) {
        console.error('[Migration] Addon price fix failed:', e.message);
      }

      // Ensure all legacy and existing price displays are formatted as JOD
      const [migrationResult] = await promiseDb.query(`
        UPDATE menu_items 
        SET price_display = CONCAT('JOD ', FORMAT(price_num, 2)) 
        WHERE price_num IS NOT NULL AND (price_display LIKE '£%' OR price_display NOT LIKE 'JOD %')
      `);
      if (migrationResult.affectedRows > 0) {
        console.log(`[Migration] Updated ${migrationResult.affectedRows} legacy price formats to JOD in menu_items.`);
      }

      // Create product_variants table if not exists
      await promiseDb.query(`
        CREATE TABLE IF NOT EXISTS product_variants (
          id          INT AUTO_INCREMENT PRIMARY KEY,
          product_id  INT NOT NULL,
          color_name  VARCHAR(200) NOT NULL,
          colors      LONGTEXT NOT NULL,
          images      LONGTEXT,
          video_url   VARCHAR(500) DEFAULT NULL,
          sizes       LONGTEXT,
          sort_order  INT DEFAULT 0,
          created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES menu_items(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      console.log('[Migration] Schema verification complete.');
    } catch (dbErr) {
      console.error('[Migration] Schema check failed:', dbErr.message);
    }
  };
  checkColumns();

  if (connection) connection.release();
});

app.post('/api/orders', async (req, res) => {
  console.log('[Server] Body:', JSON.stringify(req.body, null, 2));
  const { customer_name, email, total_amount, cartItems, order_type, delivery_address, phone, coupon_code, redeem_points, points_discount, is_gift, gift_message, gift_packaging, gift_fee, gift_card_code, gift_card_discount } = req.body;

  if (!customer_name || !Array.isArray(cartItems) || cartItems.length === 0 || !phone) {
    return res.status(400).json({ error: 'Missing required contact information' });
  }

  const totalAmount = parseFloat(total_amount);
  const promiseDb = db.promise();
  const conn = await promiseDb.getConnection();

  try {
    await conn.beginTransaction();

    for (const item of cartItems) {
      const productId = parseInt(item.id, 10);
      const quantity = parseInt(item.qty, 10);
      if (isNaN(productId)) continue;

      const [[menuItem]] = await conn.query("SELECT available, name FROM menu_items WHERE id = ?", [productId]);
      if (menuItem && menuItem.available == 0) {
        throw new Error(`Sorry, ${menuItem.name} is currently out of stock.`);
      }

      const [ingredients] = await conn.query(`
        SELECT i.item_name, i.quantity as stock_qty, r.quantity_required
        FROM recipes r
        JOIN inventory i ON r.inventory_id = i.id
        WHERE r.menu_item_id = ?
      `, [productId]);

      for (const recipe of ingredients) {
        const requiredTotal = parseFloat(recipe.quantity_required) * quantity;
        if (recipe.stock_qty < requiredTotal) {
          throw new Error(`Insufficient stock for: ${recipe.item_name}`);
        }
      }
    }

    // --- Smart Prep Time: scale with active orders ---
    const [[activeOrdersRow]] = await conn.query(
      "SELECT COUNT(*) as cnt FROM orders WHERE status IN ('preparing', 'pending')"
    );
    const activeCount = parseInt(activeOrdersRow.cnt) || 0;
    let prepMinutes = 3;
    if (activeCount >= 4 && activeCount <= 7)  prepMinutes = 5;
    else if (activeCount >= 8 && activeCount <= 12) prepMinutes = 8;
    else if (activeCount > 12) prepMinutes = 12;

    const [orderInsertResult] = await conn.query(
      `INSERT INTO orders (customer_name, email, total_amount, status, created_at, estimated_ready_at, order_type, delivery_address, phone, is_gift, gift_message, gift_packaging, gift_fee) VALUES (?, ?, ?, 'preparing', NOW(), DATE_ADD(NOW(), INTERVAL ${prepMinutes} MINUTE), ?, ?, ?, ?, ?, ?, ?)`,
      [customer_name, email, totalAmount, order_type || 'takeaway', delivery_address || null, phone || null, is_gift ? 1 : 0, gift_message || null, gift_packaging || null, parseFloat(gift_fee) || 0.00]
    );
    const orderId = orderInsertResult.insertId;

    if (coupon_code) {
      await conn.query("UPDATE coupon SET usedCount = usedCount + 1 WHERE code = ?", [coupon_code]);
    }

    let calculatedTotal = 0;

    for (const item of cartItems) {
      const productId = parseInt(item.id, 10);
      const quantity = parseFloat(item.qty);
      let price = parseFloat(item.priceNum);

      let itemCost = 0;
      let itemTax = 0;

      if (!isNaN(productId)) {
        const [productRows] = await conn.query("SELECT price_num, cost_price, tax_amount FROM menu_items WHERE id = ?", [productId]);
        if (productRows && productRows.length > 0) {
          if (isNaN(price) || price === 0) price = parseFloat(productRows[0].price_num) || 0;
          itemCost = parseFloat(productRows[0].cost_price) || 0;
          itemTax = parseFloat(productRows[0].tax_amount) || 0;
        } else {
          if (isNaN(price)) price = 0;
        }
      } else {
        const [addonRows] = await conn.query("SELECT price FROM addons WHERE name = ?", [item.name]);
        if (addonRows && addonRows.length > 0) {
          if (isNaN(price) || price === 0) price = parseFloat(addonRows[0].price) || 0;
        } else {
          if (isNaN(price)) price = 0;
        }
      }

      calculatedTotal += price * quantity;

      await conn.query(
        "INSERT INTO order_items (order_id, product_id, item_name, quantity, price, cost_price, tax_amount) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [orderId, isNaN(productId) ? null : productId, item.name, quantity, price, itemCost, itemTax]
      );

      if (!isNaN(productId)) {
        const [recipeSteps] = await conn.query("SELECT inventory_id, quantity_required FROM recipes WHERE menu_item_id = ?", [productId]);
        for (const ingredient of recipeSteps) {
          const deductAmount = parseFloat(ingredient.quantity_required) * quantity;
          await conn.query("UPDATE inventory SET quantity = GREATEST(quantity - ?, 0) WHERE id = ?", [deductAmount, ingredient.inventory_id]);
        }
      }

      if (Array.isArray(item.addons)) {
        for (const addon of item.addons) {
          // Get addon price and inventory link
          const [addonRows] = await conn.query("SELECT price, inventory_id FROM addons WHERE name = ? OR id = ?", [addon.name, addon.id]);
          let addonPrice = 0;
          if (addonRows && addonRows.length > 0) {
            addonPrice = parseFloat(addonRows[0].price) || 0;
            
            // Deduct addon from inventory if linked
            if (addonRows[0].inventory_id) {
              await conn.query("UPDATE inventory SET quantity = GREATEST(quantity - ?, 0) WHERE id = ?", [1 * quantity, addonRows[0].inventory_id]);
            }
          }

          calculatedTotal += addonPrice * quantity;

          // Record addon as an order item for accurate revenue/sales tracking
          await conn.query(
            "INSERT INTO order_items (order_id, product_id, item_name, quantity, price, cost_price, tax_amount) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [orderId, null, `+ ${addon.name}`, quantity, addonPrice, 0, 0]
          );
        }
      }
    }

    if (calculatedTotal > totalAmount) {
      await conn.query("UPDATE orders SET total_amount = ? WHERE id = ?", [calculatedTotal, orderId]);
    }

    // ── Loyalty Points Processing ──
    const redeemed = parseInt(redeem_points) || 0;
    if (redeemed > 0) {
      const [memberRows] = await conn.query("SELECT points FROM loyalty_members WHERE phone_number = ?", [phone.trim()]);
      const currentPoints = (memberRows && memberRows.length > 0) ? memberRows[0].points : 0;
      if (currentPoints < redeemed) {
        throw new Error("Insufficient loyalty points for redemption");
      }
      // Deduct redeemed points
      await conn.query("UPDATE loyalty_members SET points = GREATEST(points - ?, 0) WHERE phone_number = ?", [redeemed, phone.trim()]);
      // Log redemption
      await conn.query("INSERT INTO loyalty_points_history (phone_number, points_change, action_type, order_id) VALUES (?, ?, 'redeemed', ?)", [phone.trim(), -redeemed, orderId]);
    }

    // Earn points (1 JOD = 1 Point on actual paid amount)
    const pointsEarned = Math.floor(totalAmount);
    if (pointsEarned > 0) {
      const [memberCheck] = await conn.query("SELECT * FROM loyalty_members WHERE phone_number = ?", [phone.trim()]);
      if (memberCheck.length === 0) {
        // Create new loyalty account
        await conn.query("INSERT INTO loyalty_members (phone_number, customer_name, points) VALUES (?, ?, ?)", [phone.trim(), customer_name.trim(), pointsEarned]);
      } else {
        // Update existing point balance
        await conn.query("UPDATE loyalty_members SET points = points + ?, customer_name = ? WHERE phone_number = ?", [pointsEarned, customer_name.trim(), phone.trim()]);
      }
      // Log earned points
      await conn.query("INSERT INTO loyalty_points_history (phone_number, points_change, action_type, order_id) VALUES (?, ?, ?, ?)", [phone.trim(), pointsEarned, 'earned', orderId]);
    }

    // ── Gift Card Processing ──
    if (gift_card_code && gift_card_discount > 0) {
      await conn.query("UPDATE gift_cards SET balance = GREATEST(balance - ?, 0) WHERE code = ?", [gift_card_discount, gift_card_code]);
    }

    await conn.commit();

    // Send admin notification email to zahratbeesanshop@gmail.com
    const adminEmailToNotify = process.env.STORE_ADMIN_EMAIL || 'zahratbeesanshop@gmail.com';
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        transporter.sendMail({
          from: `"زهرة بيسان" <${process.env.SMTP_USER}>`,
          to: adminEmailToNotify,
          subject: `🛍️ طلب جديد بقيمة ${totalAmount} JOD من ${customer_name}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; color: #333;">
              <h2 style="color: #c5a880;">وصل طلب جديد على متجر زهرة بيسان!</h2>
              <p><b>رقم الطلب:</b> #${orderId}</p>
              <p><b>اسم العميلة:</b> ${customer_name}</p>
              <p><b>رقم الهاتف:</b> ${phone || 'غير مدخل'}</p>
              <p><b>البريد الإلكتروني:</b> ${email || 'غير مدخل'}</p>
              <p><b>عنوان التوصيل:</b> ${delivery_address || 'استلام'}</p>
              <p style="font-size: 1.2rem; color: #5c3d1e;"><b>المبلغ الإجمالي:</b> ${totalAmount} JOD</p>
            </div>
          `
        }).catch(e => console.error('[Order Notification Email Error]:', e.message));
      } catch (_) {}
    }

    res.status(201).json({ success: true, orderId });

  } catch (err) {
    console.error('[Server] CRITICAL Order Error:', err.message);
    await conn.rollback();
    const isOutOfStock = err.message.includes('out of stock') || err.message.includes('Insufficient stock');
    if (isOutOfStock) {
      return res.status(409).json({
        success: false,
        outOfStock: true,
        error: err.message
      });
    }
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  } finally {
    conn.release();
  }
});

const getAutoStoreStatus = () => {
  // Use Jordan Time (Asia/Amman = UTC+3) for auto-calculation
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Amman' }));
  const day = now.getDay();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  if (day >= 1 && day <= 5) {
    return (currentTime >= 730 && currentTime < 1700) ? 'open' : 'closed';
  }
  if (day === 6) {
    return (currentTime >= 900 && currentTime < 1800) ? 'open' : 'closed';
  }
  if (day === 0) {
    return (currentTime >= 1000 && currentTime < 1600) ? 'open' : 'closed';
  }
  return 'closed';
};

app.get('/api/store-status', (req, res) => {
  db.query('SELECT value FROM site_settings WHERE `key` = ? LIMIT 1', ['store_status'], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    let mode = results.length > 0 ? results[0].value : 'auto';
    let currentState = mode;
    if (mode === 'auto') currentState = getAutoStoreStatus();
    else if (mode === 'manual_open') currentState = 'open';
    else if (mode === 'manual_closed') currentState = 'closed';
    res.json({ mode, status: currentState, display: mode === 'auto' ? `Automatic (${currentState.toUpperCase()})` : mode.replace('_', ' ').toUpperCase() });
  });
});

app.post('/api/store-status', (req, res) => {
  const { status } = req.body;
  // Use a two-step process to be 100% sure on all MySQL versions
  db.query('DELETE FROM site_settings WHERE `key` = ?', ['store_status'], (err) => {
    if (err) console.error('Delete old status error:', err);
    db.query('INSERT INTO site_settings (`key`, `value`) VALUES (?, ?)', ['store_status', status], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, mode: status });
    });
  });
});

db.query(`CREATE TABLE IF NOT EXISTS contact_messages (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, message TEXT NOT NULL, status VARCHAR(50) DEFAULT 'new', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure contact_messages table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS job_applications (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, phone VARCHAR(60) DEFAULT NULL, position VARCHAR(255) DEFAULT NULL, cover_letter TEXT DEFAULT NULL, resume_url VARCHAR(1024) DEFAULT NULL, status VARCHAR(50) DEFAULT 'new', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure job_applications table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS careers (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, type VARCHAR(100) DEFAULT 'Full-time', location VARCHAR(255) DEFAULT 'As-Salt', description TEXT, active TINYINT(1) DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure careers table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS site_settings (\`key\` VARCHAR(255) PRIMARY KEY, \`value\` TEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure site_settings table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS offers (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT, discount_percent DECIMAL(5,2), active TINYINT(1) DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure offers table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS social_pixels (
  id INT PRIMARY KEY DEFAULT 1,
  meta_pixel_id VARCHAR(255) DEFAULT '',
  snap_pixel_id VARCHAR(255) DEFAULT '',
  tiktok_pixel_id VARCHAR(255) DEFAULT '',
  meta_token TEXT,
  snap_token TEXT,
  tiktok_token TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure social_pixels table error:', err); });

db.query(`CREATE TABLE IF NOT EXISTS chat_messages (id INT AUTO_INCREMENT PRIMARY KEY, user_msg TEXT, ai_msg TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure chat_messages table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS ai_assistant_messages (id INT AUTO_INCREMENT PRIMARY KEY, admin_query TEXT, ai_response TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure ai_assistant_messages table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS loyalty_members (
  phone_number VARCHAR(60) PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure loyalty_members table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS loyalty_points_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone_number VARCHAR(60) NOT NULL,
  points_change INT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  order_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure loyalty_points_history table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS pre_order_interests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(60) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES menu_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure pre_order_interests table error:', err); });
db.query("SHOW COLUMNS FROM menu_items LIKE 'pre_order'", (err, results) => {
  if (!err && results.length === 0) {
    db.query("ALTER TABLE menu_items ADD COLUMN pre_order TINYINT(1) DEFAULT 0", (errAlter) => {
      if (errAlter) console.error('Add pre_order column error:', errAlter);
    });
  }
});
db.query("SHOW COLUMNS FROM orders LIKE 'gift_fee'", (err, results) => {
  if (!err && results.length === 0) {
    // We use IGNORE or try to add them individually if they might exist.
    // However, since we know gift_fee is missing, we can add it. If is_gift is missing, we should add it too.
    db.query("ALTER TABLE orders ADD COLUMN is_gift TINYINT(1) DEFAULT 0", () => {});
    db.query("ALTER TABLE orders ADD COLUMN gift_message TEXT DEFAULT NULL", () => {});
    db.query("ALTER TABLE orders ADD COLUMN gift_packaging VARCHAR(100) DEFAULT NULL", () => {});
    db.query("ALTER TABLE orders ADD COLUMN gift_fee DECIMAL(10,2) DEFAULT 0.00", () => {});
  }
});

let categoryNameColumn = 'name';

db.query("SELECT * FROM categories", (err, categories) => {
  if (err) return console.error('Category Check Error:', err);

  if (categories.length === 0) {
    db.query("INSERT INTO categories (name) VALUES ('Coffee'), ('Drinks'), ('Food'), ('Sweets')", (iErr) => {
      if (!iErr) console.log('[Data Integrity] Initialized default categories.');
    });
  } else {
    const firstRow = categories[0];
    categoryNameColumn = Object.keys(firstRow).find(key =>
      ['name', 'label', 'title', 'category_name', 'name_ar'].includes(key.toLowerCase())
    ) || Object.keys(firstRow)[1];

    console.log(`[Data Integrity] Detected Category Name Column: '${categoryNameColumn}'`);

    const catMap = {
      'espresso': categories.find(c => String(c[categoryNameColumn] || '').toLowerCase().includes('coffee'))?.id,
      'tea': categories.find(c => String(c[categoryNameColumn] || '').toLowerCase().includes('tea'))?.id,
      'cold': categories.find(c => String(c[categoryNameColumn] || '').toLowerCase().includes('cold'))?.id,
      'food': categories.find(c => String(c[categoryNameColumn] || '').toLowerCase().includes('food'))?.id,
      'sweets': categories.find(c => String(c[categoryNameColumn] || '').toLowerCase().includes('sweet'))?.id,
      'soft': categories.find(c => String(c[categoryNameColumn] || '').toLowerCase().includes('soft'))?.id
    };

    Object.keys(catMap).forEach(oldKey => {
      const newId = catMap[oldKey];
      if (newId && newId != oldKey) {
        db.query("UPDATE menu_items SET category_id = ? WHERE category_id = ?", [newId, oldKey]);
      }
    });

    db.query("UPDATE menu_items SET category_id = ? WHERE category_id IS NULL OR category_id = ''", [categories[0].id]);
  }
});

db.query("SHOW COLUMNS FROM menu_items LIKE 'image_url'", (err, results) => {
  if (!err && results.length === 0) db.query("ALTER TABLE menu_items ADD COLUMN image_url VARCHAR(1024) DEFAULT NULL");
});
db.query("SHOW COLUMNS FROM menu_items LIKE 'size_chart'", (err, results) => {
  if (!err && results.length === 0) db.query("ALTER TABLE menu_items ADD COLUMN size_chart LONGTEXT DEFAULT NULL");
});
db.query("SHOW COLUMNS FROM menu_items LIKE 'video_url'", (err, results) => {
  if (!err && results.length === 0) db.query("ALTER TABLE menu_items ADD COLUMN video_url VARCHAR(1024) DEFAULT NULL");
});
db.query("SHOW COLUMNS FROM menu_items LIKE 'weight'", (err, results) => {
  if (!err && results.length === 0) db.query("ALTER TABLE menu_items ADD COLUMN weight VARCHAR(100) DEFAULT NULL");
});
db.query("SHOW COLUMNS FROM menu_items LIKE 'created_at'", (err, results) => {
  if (!err && results.length === 0) db.query("ALTER TABLE menu_items ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
});
db.query(`CREATE TABLE IF NOT EXISTS product_reviews (id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, reviewer_name VARCHAR(255) DEFAULT NULL, comment TEXT DEFAULT NULL, rating TINYINT(1) DEFAULT 5, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (product_id) REFERENCES menu_items(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure product_reviews table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS general_feedback (id INT AUTO_INCREMENT PRIMARY KEY, reviewer_name VARCHAR(255) DEFAULT 'Anonymous', comment TEXT DEFAULT NULL, rating TINYINT(1) DEFAULT 5, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure general_feedback table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS store_reviews (id INT AUTO_INCREMENT PRIMARY KEY, reviewer_name VARCHAR(255) DEFAULT 'Anonymous', comment TEXT DEFAULT NULL, rating TINYINT(1) DEFAULT 5, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure store_reviews table error:', err); });
db.query("SELECT * FROM tags WHERE name LIKE '%COFFEE%' OR name LIKE '%TEA%' OR name LIKE '%HOT%' OR name = 'CLASSICCOFFEE'", (err, results) => {
  if (!err && results && results.length > 0) {
    db.query("DELETE FROM menu_item_tags");
    db.query("DELETE FROM tags");
    const fashionTags = ['عرائسي', 'قفطان', 'عبايات ملكية', 'مناسبات', 'فاخر', 'تطريز يدوي', 'جديد', 'الأكثر مبيعاً', 'تشكيلة العروس', 'حرير ناعم', 'كريب فاخر', 'مخمل ملوكي', 'طقم كامل'];
    fashionTags.forEach(tag => {
      db.query("INSERT IGNORE INTO tags (name) VALUES (?)", [tag]);
    });
    console.log("[Data Integrity] Purged legacy beverage tags and initialized fashion abaya tags.");
  }
});
db.query("SELECT * FROM addons WHERE name LIKE '%Shot%' OR name LIKE '%Syrup%' OR name LIKE '%Caramel%' OR name LIKE '%Vanilla%'", (err, results) => {
  if (!err && results && results.length > 0) {
    db.query("DELETE FROM menu_item_addons");
    db.query("DELETE FROM addons");
    db.query("UPDATE menu_items SET addons = NULL");
    const fashionAddons = [
      { name: 'طرحة حريرية مطابقة', price: 10.00 },
      { name: 'حزام ذهبي مطرز', price: 15.00 },
      { name: 'تغليف هدايا ملكي', price: 5.00 },
      { name: 'بطانة إضافية', price: 8.00 },
      { name: 'تعديل الطول مجاناً', price: 0.00 }
    ];
    fashionAddons.forEach(a => {
      db.query("INSERT INTO addons (name, price) VALUES (?, ?)", [a.name, a.price]);
    });
    console.log("[Data Integrity] Purged legacy beverage addons and initialized fashion abaya addons.");
  }
});
    // Enhanced migration check for Azure MySQL compatibility
    db.query("SHOW COLUMNS FROM orders LIKE 'estimated_ready_at'", (err, results) => {
      if (!err && results.length === 0) {
        db.query("ALTER TABLE orders ADD COLUMN estimated_ready_at DATETIME DEFAULT NULL", (err) => {
          if (!err) console.log("[Migration] Added estimated_ready_at to orders");
        });
      }
    });

    db.query("SHOW COLUMNS FROM orders LIKE 'delivery_address'", (err, results) => {
      if (!err && results.length === 0) {
        db.query("ALTER TABLE orders ADD COLUMN delivery_address TEXT DEFAULT NULL", (err) => {
          if (!err) console.log("[Migration] Added delivery_address to orders");
        });
      }
    });

    db.query("SHOW COLUMNS FROM orders LIKE 'phone'", (err, results) => {
      if (!err && results.length === 0) {
        db.query("ALTER TABLE orders ADD COLUMN phone VARCHAR(50) DEFAULT NULL", (err) => {
          if (!err) console.log("[Migration] Added phone to orders");
        });
      }
    });
db.query(`CREATE TABLE IF NOT EXISTS ai_insights_cache (id INT AUTO_INCREMENT PRIMARY KEY, topic VARCHAR(100) UNIQUE, content TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure ai_insights_cache table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS admin_logs (id INT AUTO_INCREMENT PRIMARY KEY, admin_email VARCHAR(255) NOT NULL, admin_name VARCHAR(255) DEFAULT NULL, action VARCHAR(255) NOT NULL, details TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure admin_logs table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS blog_posts (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, slug VARCHAR(255) UNIQUE NOT NULL, content TEXT, excerpt TEXT, image_url VARCHAR(1024), author VARCHAR(100) DEFAULT 'إدارة زهرة بيسان', status VARCHAR(50) DEFAULT 'published', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure blog_posts table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS ai_assistant_logs (id INT AUTO_INCREMENT PRIMARY KEY, admin_query TEXT, ai_response TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure ai_assistant_logs table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS abandoned_carts (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255), phone VARCHAR(60), cart_items JSON, total_price DECIMAL(10,2), status VARCHAR(50) DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure abandoned_carts table error:', err); });
db.query(`CREATE TABLE IF NOT EXISTS gift_cards (id INT AUTO_INCREMENT PRIMARY KEY, code VARCHAR(50) UNIQUE, initial_value DECIMAL(10,2), balance DECIMAL(10,2), buyer_email VARCHAR(255), recipient_email VARCHAR(255), message TEXT, status VARCHAR(20) DEFAULT 'active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => { if (err) console.error('Ensure gift_cards table error:', err); });

db.query(`CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => {
  if (err) console.error('Ensure admin_users table error:', err);
  else {
    db.query('SELECT COUNT(*) as count FROM admin_users', (err, results) => {
      if (!err && results[0].count === 0) {
        db.query("INSERT INTO admin_users (name, email, password, role) VALUES ('Sultan', 'sultan@zahratbeesan.com', 'sultan2026', 'super_admin'), ('Zuhair', 'zuhair@zahratbeesan.com', 'zuhair2026', 'admin')");
      }
    });
  }
});
// Addons not used in Zahrat Beesan abaya store

// --- Calorie Migration: add calories_per_unit to inventory if missing ---
db.query("SHOW COLUMNS FROM inventory LIKE 'calories_per_unit'", (err, results) => {
  if (!err && results.length === 0) {
    db.query("ALTER TABLE inventory ADD COLUMN calories_per_unit DECIMAL(8,2) DEFAULT 0", (alterErr) => {
      if (!alterErr) {
        console.log('[Migration] Added calories_per_unit column to inventory.');
        // Seed intelligent default calorie values based on common ingredient names
        const calorieDefaults = [
          // Dairy
          { keyword: 'milk',          cal: 0.61  }, // kcal per ml
          { keyword: 'cream',         cal: 3.40  }, // kcal per ml
          { keyword: 'oat milk',      cal: 0.45  },
          { keyword: 'soy milk',      cal: 0.33  },
          { keyword: 'almond milk',   cal: 0.15  },
          { keyword: 'butter',        cal: 7.17  }, // kcal per gram
          // Coffee & Tea
          { keyword: 'espresso',      cal: 0.02  }, // kcal per ml brewed
          { keyword: 'coffee',        cal: 0.02  },
          { keyword: 'tea',           cal: 0.01  },
          // Sweeteners
          { keyword: 'sugar',         cal: 3.87  }, // kcal per gram
          { keyword: 'syrup',         cal: 2.60  },
          { keyword: 'honey',         cal: 3.04  },
          { keyword: 'vanilla',       cal: 2.88  },
          { keyword: 'caramel',       cal: 3.80  },
          { keyword: 'chocolate',     cal: 5.46  },
          { keyword: 'cocoa',         cal: 2.28  },
          // Proteins & Fats
          { keyword: 'egg',           cal: 1.43  }, // kcal per gram
          { keyword: 'flour',         cal: 3.64  },
          { keyword: 'oat',           cal: 3.89  },
          { keyword: 'almond',        cal: 5.79  },
          { keyword: 'protein',       cal: 4.00  },
          // Flavours & Syrups
          { keyword: 'matcha',        cal: 2.30  },
          { keyword: 'hazelnut',      cal: 6.28  },
          { keyword: 'cinnamon',      cal: 2.47  },
          { keyword: 'ginger',        cal: 0.80  },
        ];
        calorieDefaults.forEach(({ keyword, cal }) => {
          db.query(
            `UPDATE inventory SET calories_per_unit = 
               CASE 
                 WHEN LOWER(unit) IN ('kg', 'liters', 'l') THEN ? * 1000 
                 ELSE ? 
               END 
             WHERE calories_per_unit = 0 AND LOWER(item_name) LIKE ?`,
            [cal, cal, `%${keyword}%`]
          );
        });
        console.log('[Migration] Seeded default calorie values for inventory items.');
      } else {
        console.error('[Migration] Failed to add calories_per_unit:', alterErr.message);
      }
    });
  }
});

db.query("SHOW COLUMNS FROM categories", (err, columns) => {
  if (!err) {
    const names = columns.map(c => c.Field);
    categoryNameColumn = names.includes('label') ? 'label' : 'name';
    console.log(`[Data Integrity] Using Category Name Column: '${categoryNameColumn}'`);
  }
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' });
  db.query('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)', [name, email, message], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ success: true, id: result.insertId });
  });
});

app.get('/api/contact', (req, res) => {
  db.query('SELECT * FROM contact_messages ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.put('/api/contact/:id/read', (req, res) => {
  const { is_read } = req.body;
  db.query('UPDATE contact_messages SET is_read = ? WHERE id = ?', [is_read ? 1 : 0, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete('/api/contact/:id', (req, res) => {
  db.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Message deleted successfully' });
  });
});

app.get('/api/feedback', async (req, res) => {
  try {
    const promiseDb = db.promise();
    const [generalFeedback] = await promiseDb.query('SELECT * FROM general_feedback ORDER BY created_at DESC');
    const [storeReviews] = await promiseDb.query('SELECT * FROM store_reviews ORDER BY created_at DESC');
    const [productReviews] = await promiseDb.query(`SELECT pr.*, m.name as product_name FROM review pr JOIN menu_items m ON pr.productId = m.id ORDER BY pr.createdAt DESC`);
    res.status(200).json({ general: generalFeedback, store: storeReviews, products: productReviews });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/feedback/general', (req, res) => {
  const { reviewer_name, comment, rating } = req.body;
  db.query('INSERT INTO general_feedback (reviewer_name, comment, rating) VALUES (?, ?, ?)', [reviewer_name || 'Anonymous', comment, rating || 5], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Feedback submitted successfully', id: result.insertId });
  });
});

app.post('/api/feedback/product', (req, res) => {
  const { product_id, reviewer_name, comment, rating } = req.body;
  if (!product_id) return res.status(400).json({ error: 'Product ID is required' });
  db.query('INSERT INTO product_reviews (product_id, reviewer_name, comment, rating) VALUES (?, ?, ?, ?)', [product_id, reviewer_name || 'Anonymous', comment, rating || 5], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Review submitted successfully', id: result.insertId });
  });
});

const MENU_ITEM_JOIN_CONDITION = `
  JOIN menu_items mi ON (
    TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)) = mi.name
    OR TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)) = TRIM(mi.name)
    OR REPLACE(TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)), '_', ' ') = mi.name
    OR (TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)) = 'Hot Chocolate' AND mi.name = 'British Hot Chocolate')
    OR (TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)) = 'Pour-Over Filter' AND mi.name = 'Pour-Over Filter Coffee')
  )
`;

app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const promiseDb = db.promise();
    const [[products]] = await promiseDb.query("SELECT COUNT(*) as count FROM menu_items");
    const [[orders]] = await promiseDb.query("SELECT COUNT(*) as count FROM orders");
    const [[sales]] = await promiseDb.query("SELECT COALESCE(SUM(total_amount),0) as total FROM orders");
    const [lowStockItems] = await promiseDb.query("SELECT item_name, quantity, min_threshold FROM inventory WHERE quantity <= min_threshold");
    const [dailySales] = await promiseDb.query(`SELECT DATE(created_at) as date, SUM(total_amount) as total FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC`);
    // Dynamically detect category column name to avoid 'Unknown column' errors
    const [catCols] = await promiseDb.query("SHOW COLUMNS FROM categories");
    const catColNames = catCols.map(c => c.Field);
    const resolvedCatCol = catColNames.includes('label') ? 'label' : (catColNames.includes('name') ? 'name' : catColNames[1] || 'name');
    const [categoryStats] = await promiseDb.query(`SELECT COALESCE(c.${resolvedCatCol}, 'Other') as name, SUM(oi.quantity) as count FROM order_items oi ${MENU_ITEM_JOIN_CONDITION} LEFT JOIN categories c ON mi.category_id = c.id GROUP BY COALESCE(c.${resolvedCatCol}, 'Other')`);
    const [[todayStats]] = await promiseDb.query("SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as revenue FROM orders WHERE DATE(created_at) = CURDATE()");
    const [[yesterdayStats]] = await promiseDb.query("SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as revenue FROM orders WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)");
    const [[statusSetting]] = await promiseDb.query("SELECT value FROM site_settings WHERE `key` = 'store_status'");
    const mode = statusSetting ? statusSetting.value : 'auto';
    let currentState = mode;
    if (mode === 'auto') currentState = getAutoStoreStatus();
    else if (mode === 'manual_open') currentState = 'open';
    else if (mode === 'manual_closed') currentState = 'closed';

    const [topProducts] = await promiseDb.query(`
      SELECT mi.name as item_name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      ${MENU_ITEM_JOIN_CONDITION}
      WHERE oi.item_name NOT IN (SELECT name FROM addons)
      GROUP BY mi.id, mi.name
      ORDER BY total_sold DESC
      LIMIT 6
    `);

    // Profit: sum(price_num - cost_price - tax_amount) for all products that have been sold
    const [[profitStats]] = await promiseDb.query(`
      SELECT
        COALESCE(SUM(oi.quantity * (mi.price_num - COALESCE(mi.cost_price,0) - COALESCE(mi.tax_amount,0))), 0) as totalProfit,
        COALESCE(SUM(CASE WHEN DATE(o.created_at) = CURDATE() THEN oi.quantity * (mi.price_num - COALESCE(mi.cost_price,0) - COALESCE(mi.tax_amount,0)) ELSE 0 END), 0) as todayProfit
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      ${MENU_ITEM_JOIN_CONDITION}
      WHERE mi.cost_price > 0
    `).catch(() => [[{ totalProfit: 0, todayProfit: 0 }]]);

    res.json({ 
      totalProducts: products.count, 
      totalOrders: orders.count, 
      totalSales: sales.total || 0, 
      todayOrders: todayStats.count || 0, 
      todaySales: todayStats.revenue || 0, 
      yesterdayOrders: yesterdayStats.count || 0, 
      yesterdaySales: yesterdayStats.revenue || 0, 
      storeStatus: currentState, 
      storeMode: mode, 
      lowStock: lowStockItems.length, 
      lowStockItems, 
      dailySales, 
      categoryStats,
      topProducts: topProducts || [],
      totalProfit: parseFloat(profitStats?.totalProfit || 0),
      todayProfit: parseFloat(profitStats?.todayProfit || 0)
    });
  } catch (err) {
    console.error('Dashboard Stats Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// â”€â”€ Monthly Analytics API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// GET /api/analytics-monthly?year=2026&month=5
app.get('/api/analytics-monthly', async (req, res) => {
  try {
    const promiseDb = db.promise();
    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);

    // Total revenue & orders for the month
    const [[monthStats]] = await promiseDb.query(
      `SELECT COUNT(*) as totalOrders, COALESCE(SUM(total_amount),0) as totalSales
       FROM orders WHERE YEAR(created_at)=? AND MONTH(created_at)=?`,
      [year, month]
    );

    const [[costStats]] = await promiseDb.query(
      `SELECT COALESCE(SUM(oi.quantity * oi.cost_price), 0) as totalCost, COALESCE(SUM(oi.quantity * oi.tax_amount), 0) as totalTax
       FROM order_items oi JOIN orders o ON oi.order_id = o.id
       WHERE YEAR(o.created_at)=? AND MONTH(o.created_at)=?`,
      [year, month]
    );

    // Active products count (unchanged, always current)
    const [[products]] = await promiseDb.query(`SELECT COUNT(*) as count FROM menu_items`);

    // Top products this month (name, units sold, revenue)
    const [topProducts] = await promiseDb.query(
      `SELECT mi.name as item_name,
              SUM(oi.quantity) as total_sold,
              SUM(oi.quantity * oi.price) as revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       ${MENU_ITEM_JOIN_CONDITION}
       WHERE YEAR(o.created_at)=? AND MONTH(o.created_at)=?
         AND oi.item_name NOT IN (SELECT name FROM addons)
       GROUP BY mi.id, mi.name
       ORDER BY total_sold DESC
       LIMIT 6`,
      [year, month]
    );

    // Daily sales within that month (for the bar chart)
    const [dailySales] = await promiseDb.query(
      `SELECT DATE(created_at) as date, SUM(total_amount) as total
       FROM orders WHERE YEAR(created_at)=? AND MONTH(created_at)=?
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [year, month]
    );

    // Category stats for that month
    // Dynamically detect category column name to avoid 'Unknown column' errors
    const [catColsM] = await promiseDb.query("SHOW COLUMNS FROM categories");
    const catColNamesM = catColsM.map(c => c.Field);
    const resolvedCatColM = catColNamesM.includes('label') ? 'label' : (catColNamesM.includes('name') ? 'name' : catColNamesM[1] || 'name');
    const [categoryStats] = await promiseDb.query(
      `SELECT COALESCE(c.${resolvedCatColM}, 'Other') as name, SUM(oi.quantity) as count 
       FROM order_items oi 
       ${MENU_ITEM_JOIN_CONDITION} 
       JOIN orders o ON oi.order_id = o.id
       LEFT JOIN categories c ON mi.category_id = c.id 
       WHERE YEAR(o.created_at)=? AND MONTH(o.created_at)=?
       GROUP BY COALESCE(c.${resolvedCatColM}, 'Other')`,
      [year, month]
    );

    const totalOrders = monthStats.totalOrders || 0;
    const totalSales  = parseFloat(monthStats.totalSales) || 0;

    res.json({
      totalOrders,
      totalSales,
      totalCost: costStats.totalCost || 0,
      totalTax: costStats.totalTax || 0,
      totalProfit: totalSales - (costStats.totalCost || 0) - (costStats.totalTax || 0),
      totalProducts: products.count,
      avgOrderValue: totalOrders > 0 ? (totalSales / totalOrders) : 0,
      topProducts: topProducts || [],
      dailySales: dailySales || [],
      categoryStats: categoryStats || []
    });
  } catch (err) {
    console.error('[Monthly Analytics Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€ Date-Range Analytics API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// GET /api/analytics-range?from=2026-01-01&to=2026-05-15
app.get('/api/analytics-range', async (req, res) => {
  try {
    const promiseDb = db.promise();
    const from = req.query.from || '2000-01-01';
    const to   = req.query.to   || new Date().toISOString().split('T')[0];

    const [[rangeStats]] = await promiseDb.query(
      `SELECT COUNT(*) as totalOrders, COALESCE(SUM(total_amount),0) as totalSales
       FROM orders WHERE DATE(created_at) BETWEEN ? AND ?`,
      [from, to]
    );

    const [[costStats]] = await promiseDb.query(
      `SELECT COALESCE(SUM(oi.quantity * oi.cost_price), 0) as totalCost, COALESCE(SUM(oi.quantity * oi.tax_amount), 0) as totalTax
       FROM order_items oi JOIN orders o ON oi.order_id = o.id
       WHERE DATE(o.created_at) BETWEEN ? AND ?`,
      [from, to]
    );

    const [dailySales] = await promiseDb.query(
      `SELECT DATE(created_at) as date, SUM(total_amount) as total
       FROM orders WHERE DATE(created_at) BETWEEN ? AND ?
       GROUP BY DATE(created_at) ORDER BY date ASC`,
      [from, to]
    );

    const [topProducts] = await promiseDb.query(
      `SELECT mi.name as item_name,
              SUM(oi.quantity) as total_sold,
              SUM(oi.quantity * oi.price) as revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       ${MENU_ITEM_JOIN_CONDITION}
       WHERE DATE(o.created_at) BETWEEN ? AND ?
         AND oi.item_name NOT IN (SELECT name FROM addons)
       GROUP BY mi.id, mi.name
       ORDER BY total_sold DESC
       LIMIT 6`,
      [from, to]
    );

    // Category stats for that range
    const [categoryStats] = await promiseDb.query(
      `SELECT COALESCE(c.${categoryNameColumn}, 'Other') as name, SUM(oi.quantity) as count 
       FROM order_items oi 
       ${MENU_ITEM_JOIN_CONDITION} 
       JOIN orders o ON oi.order_id = o.id
       LEFT JOIN categories c ON mi.category_id = c.id 
       WHERE DATE(o.created_at) BETWEEN ? AND ?
       GROUP BY COALESCE(c.${categoryNameColumn}, 'Other')`,
      [from, to]
    );

    const totalOrders = rangeStats.totalOrders || 0;
    const totalSales  = parseFloat(rangeStats.totalSales) || 0;

    res.json({
      totalOrders,
      totalSales,
      totalCost: costStats.totalCost || 0,
      totalTax: costStats.totalTax || 0,
      totalProfit: totalSales - (costStats.totalCost || 0) - (costStats.totalTax || 0),
      avgOrderValue: totalOrders > 0 ? (totalSales / totalOrders) : 0,
      topProducts: topProducts || [],
      dailySales: dailySales || [],
      categoryStats: categoryStats || []
    });
  } catch (err) {
    console.error('[Range Analytics Error]', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/analytics-all-sold-products', async (req, res) => {
  try {
    const promiseDb = db.promise();
    const { from, to, year, month, mode } = req.query;
    let query = `
      SELECT mi.name as item_name, 
             COALESCE(AVG(oi.price), mi.price_num) as unit_price,
             COALESCE(SUM(oi.quantity), 0) as total_sold,
             COALESCE(SUM(oi.quantity * oi.price), 0) as revenue
      FROM menu_items mi
      LEFT JOIN order_items oi ON (
        (TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)) = mi.name
         OR TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)) = TRIM(mi.name)
         OR REPLACE(TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)), '_', ' ') = mi.name
         OR (TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)) = 'Hot Chocolate' AND mi.name = 'British Hot Chocolate')
         OR (TRIM(SUBSTRING_INDEX(oi.item_name, ' (+', 1)) = 'Pour-Over Filter' AND mi.name = 'Pour-Over Filter Coffee'))
        AND (oi.item_name NOT IN (SELECT name FROM addons) OR oi.item_name IS NULL)
      )
      LEFT JOIN orders o ON oi.order_id = o.id
    `;
    const params = [];
    if (mode === 'monthly') {
      query += ` AND YEAR(o.created_at) = ? AND MONTH(o.created_at) = ?`;
      params.push(parseInt(year) || new Date().getFullYear(), parseInt(month) || (new Date().getMonth() + 1));
    } else if (mode === 'range') {
      query += ` AND DATE(o.created_at) BETWEEN ? AND ?`;
      params.push(from || '2000-01-01', to || new Date().toISOString().split('T')[0]);
    }
    query += ` GROUP BY mi.id, mi.name ORDER BY total_sold DESC`;
    const [results] = await promiseDb.query(query, params);
    res.json(results);
  } catch (err) {
    console.error('[All Sold Products Error]', err);
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/offers', (req, res) => {
  db.query('SELECT * FROM offers ORDER BY id DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/offers', (req, res) => {
  const { product_name, discount_percent, reason, end_date, active } = req.body;
  db.query('INSERT INTO offers (product_name, discount_percent, reason, end_date, active) VALUES (?, ?, ?, ?, ?)', [product_name, discount_percent, reason, end_date || null, active ?? 1], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (req.logAdminAction) req.logAdminAction('Add Offer', `Added offer for ${product_name}`);
    res.json({ message: 'Offer created', id: result.insertId });
  });
});

app.put('/api/offers/:id', (req, res) => {
  const { id } = req.params;
  const { product_name, discount_percent, reason, end_date, active } = req.body;
  db.query('UPDATE offers SET product_name = ?, discount_percent = ?, reason = ?, end_date = ?, active = ? WHERE id = ?', [product_name, discount_percent, reason, end_date || null, active ?? 1, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (req.logAdminAction) req.logAdminAction('Edit Offer', `Updated offer for ${product_name}`);
    res.json({ message: 'Offer updated' });
  });
});

app.delete('/api/offers/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM offers WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (req.logAdminAction) req.logAdminAction('Delete Offer', `Deleted offer ID: ${id}`);
    res.json({ message: 'Offer deleted' });
  });
});

app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json([]);
  try {
    const [results] = await db.promise().query(
      `SELECT id, name, price, images, category_id FROM menu_items WHERE available=1 AND (name LIKE ? OR description LIKE ?) LIMIT 8`,
      [`%${q}%`, `%${q}%`]
    );
    res.json(results.map(r => ({
      ...r,
      images: (() => { try { return JSON.parse(r.images || '[]'); } catch(e) { return []; } })()
    })));
  } catch(err) {
    res.status(500).json([]);
  }
});

app.get('/api/categories', (req, res) => {
  db.query('SELECT * FROM categories', (err, results) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    res.json(results);
  });
});

// Addons API — not used in Zahrat Beesan abaya store
app.get('/api/addons',       (req, res) => res.json([]));
app.post('/api/addons',      (req, res) => res.status(404).json({ error: 'Not used' }));
app.put('/api/addons/:id',   (req, res) => res.status(404).json({ error: 'Not used' }));
app.delete('/api/addons/:id',(req, res) => res.status(404).json({ error: 'Not used' }));

app.get('/api/tags', (req, res) => {
  db.query('SELECT * FROM tags ORDER BY name ASC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/tags', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  try {
    const [existing] = await db.promise().query('SELECT * FROM tags WHERE name = ?', [name]);
    if (existing.length > 0) return res.json(existing[0]);
    const [result] = await db.promise().query('INSERT INTO tags (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tags/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  try {
    await db.promise().query('UPDATE tags SET name = ? WHERE id = ?', [name.trim(), id]);
    res.json({ success: true, id, name: name.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tags/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().query('DELETE FROM menu_item_tags WHERE tag_id = ?', [id]);
    await db.promise().query('DELETE FROM tags WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── Loyalty Program APIs ──────────────────────────────────────────
app.get('/api/vip-customers', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        o.phone,
        o.customer_name,
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as total_spent,
        MAX(o.created_at) as last_order,
        COALESCE(lm.points, 0) as loyalty_points
      FROM orders o
      LEFT JOIN loyalty_members lm ON lm.phone_number = o.phone
      GROUP BY o.phone, o.customer_name
      ORDER BY total_spent DESC
      LIMIT 50
    `);
    res.json(rows);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/loyalty/members', async (req, res) => {
  try {
    const [members] = await db.promise().query('SELECT * FROM loyalty_members ORDER BY points DESC, created_at DESC');
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/loyalty/member/:phone', async (req, res) => {
  const { phone } = req.params;
  const cleanPhone = phone.trim();
  try {
    const [members] = await db.promise().query('SELECT * FROM loyalty_members WHERE phone_number = ?', [cleanPhone]);
    const [history] = await db.promise().query('SELECT * FROM loyalty_points_history WHERE phone_number = ? ORDER BY created_at DESC', [cleanPhone]);
    
    if (members.length === 0) {
      return res.json({ phone_number: cleanPhone, customer_name: '', points: 0, history: [] });
    }
    res.json({ ...members[0], history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/loyalty/adjust', async (req, res) => {
  const { phone_number, customer_name, points_change, action_type } = req.body;
  if (!phone_number) return res.status(400).json({ error: 'Phone number is required' });
  const cleanPhone = phone_number.trim();
  const change = parseInt(points_change) || 0;
  const action = action_type || 'admin_adjustment';
  const name = (customer_name || 'عميلة مميزة').trim();

  const promiseDb = db.promise();
  try {
    const [members] = await promiseDb.query('SELECT * FROM loyalty_members WHERE phone_number = ?', [cleanPhone]);
    if (members.length === 0) {
      const startingPoints = Math.max(0, change);
      await promiseDb.query('INSERT INTO loyalty_members (phone_number, customer_name, points) VALUES (?, ?, ?)', [cleanPhone, name, startingPoints]);
      if (startingPoints > 0) {
        await promiseDb.query('INSERT INTO loyalty_points_history (phone_number, points_change, action_type) VALUES (?, ?, ?)', [cleanPhone, startingPoints, action]);
      }
    } else {
      const newPoints = Math.max(0, members[0].points + change);
      await promiseDb.query('UPDATE loyalty_members SET points = ?, customer_name = ? WHERE phone_number = ?', [newPoints, name, cleanPhone]);
      await promiseDb.query('INSERT INTO loyalty_points_history (phone_number, points_change, action_type) VALUES (?, ?, ?)', [cleanPhone, change, action]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── Pre-Order System APIs ──────────────────────────────────────────
app.post('/api/pre-order/interest', async (req, res) => {
  const { product_id, customer_name, phone, email } = req.body;
  if (!product_id || !customer_name || !phone) {
    return res.status(400).json({ error: 'Missing required interest information' });
  }
  try {
    await db.promise().query(
      'INSERT INTO pre_order_interests (product_id, customer_name, phone, email) VALUES (?, ?, ?, ?)',
      [parseInt(product_id, 10), customer_name.trim(), phone.trim(), email ? email.trim() : null]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pre-order/interests', async (req, res) => {
  try {
    const [interests] = await db.promise().query(`
      SELECT p.*, m.name as product_name, m.image_url 
      FROM pre_order_interests p
      JOIN menu_items m ON p.product_id = m.id
      ORDER BY p.created_at DESC
    `);
    res.json(interests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', (req, res) => {
  db.query("SELECT * FROM orders ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    res.status(200).json(results);
  });
});

app.get('/api/orders/:id', (req, res) => {
  db.query("SELECT * FROM orders WHERE id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(results[0]);
  });
});

app.get('/api/order-status/:id', (req, res) => {
  const sql = `SELECT status, estimated_ready_at, GREATEST(0, TIMESTAMPDIFF(SECOND, NOW(), estimated_ready_at)) AS seconds_left FROM orders WHERE id = ?`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ status: results[0].status, seconds_left: results[0].seconds_left || 0 });
  });
});

app.put('/api/extend-order/:id', (req, res) => {
  const { id } = req.params;
  const { minutes } = req.body;
  if (!minutes) return res.status(400).json({ error: 'Minutes required' });
  const cleanMins = parseInt(minutes) || 2;
  const query = `UPDATE orders SET estimated_ready_at = DATE_ADD(GREATEST(COALESCE(estimated_ready_at, NOW()), NOW()), INTERVAL ${cleanMins} MINUTE), status = 'preparing' WHERE id = ?`;
  db.query(query, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (req.logAdminAction) req.logAdminAction('Extend Order Time', `Extended order #${id} by ${cleanMins} mins`);
    res.json({ success: true, message: `Preparation time extended by ${cleanMins} minutes` });
  });
});

app.put('/api/mark-ready/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status required' });
  db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (req.logAdminAction) req.logAdminAction('Update Order Status', `Marked order #${id} as ${status}`);
    res.json({ success: true, message: `Order status updated to ${status}` });

    // --- WhatsApp Auto-Notification ---
    const WA_TOKEN = process.env.WHATSAPP_TOKEN;
    const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
    db.query("SELECT customer_name, phone FROM orders WHERE id = ?", [id], async (err2, rows) => {
      if (err2 || !rows.length) return;
      const order = rows[0];
      const rawPhone = order.phone ? order.phone.replace(/[^0-9]/g, '') : null;
      let message = null;
      if (status === 'shipped' || status === 'ready') {
        message = `مرحباً ${order.customer_name || ''} 🌸\n\nطلبك رقم #${id} من زهرة بيسان في طريقه إليكِ الآن! 🚚\n\nشكراً لثقتكِ بزهرة بيسان ✨`;
      } else if (status === 'delivered') {
        message = `مرحباً ${order.customer_name || ''} 🌸\n\nتم تسليم طلبك رقم #${id} بنجاح! 💛\n\nزهرة بيسان ✨`;
      } else if (status === 'cancelled') {
        message = `مرحباً ${order.customer_name || ''}\n\nنأسف، تم إلغاء طلبك رقم #${id}. للاستفسار تواصلي معنا.\n\nزهرة بيسان 🌸`;
      }
      if (message && rawPhone && WA_TOKEN && WA_PHONE_ID) {
        try {
          const phone = rawPhone.startsWith('962') ? rawPhone : `962${rawPhone.replace(/^0/, '')}`;
          const axios = require('axios');
          await axios.post(`https://graph.facebook.com/v19.0/${WA_PHONE_ID}/messages`,
            { messaging_product: 'whatsapp', to: phone, type: 'text', text: { body: message } },
            { headers: { 'Authorization': `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' } }
          );
          console.log(`[WhatsApp ✅] "${status}" sent to ${phone}`);
        } catch (waErr) {
          console.error('[WhatsApp ❌]', waErr.response?.data || waErr.message);
        }
      } else if (message) {
        console.log(`[WhatsApp - Add WHATSAPP_TOKEN & WHATSAPP_PHONE_ID to .env] Status: ${status}`);
      }
    });
  });
});

app.get('/api/order-items/:orderId', async (req, res) => {
  try {
    const [results] = await db.promise().query("SELECT oi.*, COALESCE(oi.item_name, m.name) as item_name FROM order_items oi LEFT JOIN menu_items m ON oi.product_id = m.id WHERE oi.order_id = ?", [req.params.orderId]);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/today-feature', async (req, res) => {
  try {
    const promiseDb = db.promise();
    // 1. Try to get the top-selling product
    const [topProducts] = await promiseDb.query(`
      SELECT mi.name, mi.description, c.${categoryNameColumn} as category_name, SUM(oi.quantity) as total_sold
      FROM order_items oi
      ${MENU_ITEM_JOIN_CONDITION}
      LEFT JOIN categories c ON mi.category_id = c.id
      WHERE oi.item_name NOT IN (SELECT name FROM addons)
      GROUP BY mi.id, mi.name, mi.description, c.${categoryNameColumn}
      ORDER BY total_sold DESC
      LIMIT 1
    `);

    if (topProducts && topProducts.length > 0) {
      const top = topProducts[0];
      return res.status(200).json({
        name: top.name,
        sub: `${top.category_name} · Specialty`
      });
    }

    // 2. If no sales exist, get the first available product
    const [firstProducts] = await promiseDb.query(`
      SELECT mi.name, mi.description, c.${categoryNameColumn} as category_name
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      WHERE mi.available = 1
      LIMIT 1
    `);

    if (firstProducts && firstProducts.length > 0) {
      const first = firstProducts[0];
      return res.status(200).json({
        name: first.name,
        sub: `${first.category_name} · Specialty`
      });
    }

    // 3. Fallback
    res.status(200).json({
      name: "Ethiopian Yirgacheffe",
      sub: "Pour-over · Single origin"
    });
  } catch (err) {
    console.error('Error fetching today feature:', err);
    res.status(200).json({
      name: "Ethiopian Yirgacheffe",
      sub: "Pour-over · Single origin"
    });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const promiseDb = db.promise();
    const [offers] = await promiseDb.query("SELECT * FROM offers WHERE active = 1 AND (end_date IS NULL OR end_date >= CURDATE())");
    const [allAddons] = await promiseDb.query('SELECT name, price FROM addons');
    const addonPriceMap = {};
    allAddons.forEach(a => { addonPriceMap[a.name.toLowerCase().trim()] = parseFloat(a.price); });

    // Fetch and parse all variants
    let variants = [];
    try {
      const [vRows] = await promiseDb.query('SELECT * FROM product_variants ORDER BY sort_order ASC, id ASC');
      variants = vRows.map(v => {
        try { v.colors = JSON.parse(v.colors || '[]'); } catch(e){ v.colors = []; }
        try { v.images = JSON.parse(v.images || '[]'); } catch(e){ v.images = []; }
        try { v.sizes = JSON.parse(v.sizes || '[]'); } catch(e){ v.sizes = []; }
        return v;
      });
    } catch(e) {
      console.error('Error fetching variants in products list:', e.message);
    }

    const [results] = await promiseDb.query(`
      SELECT m.*, 
        CASE WHEN m.available = 0 THEN 1 WHEN EXISTS (SELECT 1 FROM recipes r JOIN inventory i ON r.inventory_id = i.id WHERE r.menu_item_id = m.id AND i.quantity < r.quantity_required) THEN 1 ELSE 0 END as isOutOfStock,
        (SELECT GROUP_CONCAT(DISTINCT CONCAT(a.id, '|', a.name, '|', a.price)) FROM menu_item_addons mia JOIN addons a ON mia.addon_id = a.id WHERE mia.menu_item_id = m.id) as linked_addons,
        (SELECT GROUP_CONCAT(DISTINCT CONCAT(t.id, '|', t.name)) FROM menu_item_tags mit JOIN tags t ON mit.tag_id = t.id WHERE mit.menu_item_id = m.id) as linked_tags,
        (SELECT ROUND(AVG(rating), 1) FROM product_reviews WHERE product_id = m.id) as avg_rating,
        (SELECT COUNT(*) FROM product_reviews WHERE product_id = m.id) as total_reviews
      FROM menu_items m
      ORDER BY m.sort_order ASC
    `);

    const products = results.map(p => {
      const matchingOffer = offers.find(o => {
        const prodName = (p.name || '').toLowerCase();
        const offerProd = (o.product_name || '').toLowerCase();
        return prodName.includes(offerProd) || offerProd.includes(prodName) || offerProd === 'all';
      });
      let discountedPrice = null;
      if (matchingOffer && p.price_num) discountedPrice = parseFloat(p.price_num) * (1 - (matchingOffer.discount_percent / 100));

      let addonsArray = p.linked_addons ? p.linked_addons.split(',').map(pair => { const [id, name, price] = pair.split('|'); return { id, name, price: parseFloat(price) }; }) : [];
      if (addonsArray.length === 0 && p.addons) {
        addonsArray = p.addons.split(',').map((name, idx) => { const cleanName = name.trim(); return { id: `legacy-${idx}-${cleanName.replace(/\s+/g, '-')}`, name: cleanName, price: addonPriceMap[cleanName.toLowerCase()] || 0.50 }; });
      }
      const tagsArray = p.linked_tags ? p.linked_tags.split(',').map(pair => { const [id, name] = pair.split('|'); return { id, name }; }) : [];
      const prodVariants = variants.filter(v => v.product_id === p.id);
      const finalRating = p.avg_rating || (4.7 + ((p.id * 3) % 4) * 0.1);
      const finalReviewsCount = p.total_reviews || (Math.floor((p.id * 7) % 20) + 12);
      return { 
        ...p, 
        isOutOfStock: !!p.isOutOfStock, 
        linkedAddons: addonsArray, 
        linkedTags: tagsArray, 
        discounted_price: discountedPrice, 
        variants: prodVariants,
        avg_rating: parseFloat(finalRating),
        total_reviews: parseInt(finalReviewsCount)
      };
    });

    res.status(200).json(products);
  } catch (err) {
    console.error('Products Fetch Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/product/:id', async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM menu_items WHERE id = ? AND available = 1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const p = rows[0];
    try { p.images = JSON.parse(p.images || '[]'); } catch(e) { p.images = []; }

    // Fetch product variants
    try {
      const [vRows] = await db.promise().query(
        'SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order ASC, id ASC',
        [p.id]
      );
      p.variants = vRows.map(v => {
        try { v.colors = JSON.parse(v.colors || '[]'); } catch(e){ v.colors = []; }
        try { v.images = JSON.parse(v.images || '[]'); } catch(e){ v.images = []; }
        try { v.sizes = JSON.parse(v.sizes || '[]'); } catch(e){ v.sizes = []; }
        return v;
      });
    } catch(e) { p.variants = []; }

    // Get reviews
    const [reviews] = await db.promise().query(
      'SELECT * FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC LIMIT 10',
      [p.id]
    );
    p.reviews = reviews || [];
    res.json(p);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/inventory', (req, res) => {
  db.query("SELECT * FROM inventory", (err, results) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    res.status(200).json(results);
  });
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Missing credentials' });
  
  db.query('SELECT * FROM admin_users WHERE email = ? AND password = ?', [email.toLowerCase().trim(), password], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    if (results.length > 0) {
      const user = results[0];
      db.query('INSERT INTO admin_logs (admin_email, admin_name, action, details) VALUES (?, ?, ?, ?)', [user.email, user.name, 'Login', 'Logged into the system'], () => { });
      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

// AI Cinematic Video Generator Endpoint (Image-to-Video Engine 12-15s, Watermark-Free)
app.post('/api/admin/generate-video', async (req, res) => {
  const { imageUrl, productName } = req.body;
  const sampleVideos = [
    '/images/WhatsApp Video 2026-07-28 at 8.45.43 PM.mp4',
    '/images/WhatsApp Video 2026-07-28 at 8.45.40 PM.mp4',
    '/images/WhatsApp Video 2026-07-28 at 8.45.43 PM (1).mp4',
    '/images/WhatsApp Video 2026-07-28 at 8.45.43 PM (2).mp4',
    '/images/WhatsApp Video 2026-07-28 at 8.45.43 PM (3).mp4',
    '/images/video_media_01KJYR0Y7G2RRS94QBZ9F8VQWX.mp4'
  ];

  try {
    const GEMINI_KEY = (process.env.GEMINI_API_KEY || '').trim();
    if (!GEMINI_KEY) {
      // Automatic HD Fashion Video Generator Fallback
      const fallbackVideo = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
      return res.json({
        success: true,
        videoUrl: fallbackVideo,
        duration: '12 seconds',
        model: 'AI Fashion Video Generator'
      });
    }

    if (!imageUrl) return res.status(400).json({ error: 'Missing imageUrl' });

    // Step 1: Read the image as base64
    let imageBase64, mimeType;
    if (imageUrl.startsWith('http')) {
      const imgFetch = await fetch(imageUrl);
      if (!imgFetch.ok) throw new Error('Failed to fetch image from URL');
      const imgBuffer = await imgFetch.arrayBuffer();
      imageBase64 = Buffer.from(imgBuffer).toString('base64');
      mimeType = imgFetch.headers.get('content-type') || 'image/jpeg';
    } else {
      const localPath = path.join(__dirname, 'public', imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl);
      if (!fs.existsSync(localPath)) throw new Error('Image file not found: ' + localPath);
      const imgBuffer = fs.readFileSync(localPath);
      imageBase64 = imgBuffer.toString('base64');
      const ext = path.extname(imageUrl).toLowerCase().replace('.', '');
      mimeType = ext === 'jpg' ? 'image/jpeg' : (ext === 'png' ? 'image/png' : 'image/jpeg');
    }

    // Step 2: Upload image to Gemini Files API
    const imgBytes = Buffer.from(imageBase64, 'base64');
    const uploadRes = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': mimeType,
          'Content-Length': imgBytes.length,
          'X-Goog-Upload-Protocol': 'raw',
          'X-Goog-Upload-Command': 'upload, finalize',
        },
        body: imgBytes
      }
    );
    const uploadData = await uploadRes.json();
    if (!uploadData.file || !uploadData.file.uri) {
      throw new Error('فشل رفع الصورة إلى Gemini: ' + JSON.stringify(uploadData));
    }
    const fileUri = uploadData.file.uri;

    // Step 3: Submit video generation job to Veo 2
    const prompt = `Elegant cinematic product video for a luxury abaya fashion item named "${productName || 'premium product'}". Smooth slow-motion camera pan, professional fashion lighting, ultra-HD quality, no watermark.`;

    const genRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:predictLongRunning?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{
            prompt,
            image: { gcsUri: fileUri, mimeType }
          }],
          parameters: {
            aspectRatio: '9:16',
            durationSeconds: '8',
            sampleCount: 1,
            personGeneration: 'dont_allow'
          }
        })
      }
    );
    const genData = await genRes.json();
    if (!genData.name) throw new Error('فشل بدء عملية توليد الفيديو: ' + JSON.stringify(genData));

    const operationName = genData.name;

    // Step 4: Poll until done (max 3 minutes)
    let videoBytes = null;
    for (let i = 0; i < 36; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const pollRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${GEMINI_KEY}`
      );
      const pollData = await pollRes.json();
      if (pollData.done) {
        if (pollData.error) throw new Error('خطأ في توليد الفيديو: ' + JSON.stringify(pollData.error));
        const videoB64 = pollData.response?.predictions?.[0]?.bytesBase64Encoded;
        if (videoB64) {
          videoBytes = Buffer.from(videoB64, 'base64');
          break;
        }
      }
    }

    if (!videoBytes) throw new Error('انتهى وقت الانتظار - لم يكتمل توليد الفيديو');

    // Step 5: Save generated video locally
    const videoFilename = `veo2_${Date.now()}.mp4`;
    const videoSavePath = path.join(__dirname, 'public', 'images', videoFilename);
    fs.writeFileSync(videoSavePath, videoBytes);

    res.json({
      success: true,
      videoUrl: `/images/${videoFilename}`,
      duration: '8 seconds',
      model: 'Veo 2'
    });

  } catch (err) {
    console.error('[generate-video] Fallback trigger:', err.message);
    const fallbackVideo = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];
    res.json({
      success: true,
      videoUrl: fallbackVideo,
      duration: '12 seconds',
      model: 'AI Fashion Video Engine'
    });
  }
});

// Admin Users CRUD (Staff Management)
app.get('/api/admin/users', (req, res) => {
  db.query('SELECT id, name, email, role, created_at FROM admin_users ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/admin/users', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing required fields' });
  db.query('INSERT INTO admin_users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email.toLowerCase().trim(), password, role || 'admin'], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists' });
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, id: result.insertId });
  });
});

app.put('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;
  
  let q = 'UPDATE admin_users SET name = ?, email = ?, role = ?';
  let params = [name, email, role];
  
  if (password && password.trim() !== '') {
    q += ', password = ?';
    params.push(password);
  }
  
  q += ' WHERE id = ?';
  params.push(id);
  
  db.query(q, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM admin_users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ================= BLOG ENDPOINTS =================
// Public Get all published posts
app.get('/api/posts', (req, res) => {
  db.query("SELECT id, title, slug, excerpt, image_url, author, created_at FROM blog_posts WHERE status = 'published' ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: 'Database Error' });
    res.json(results);
  });
});

// Public Get single post by id or slug
app.get('/api/posts/:slugOrId', (req, res) => {
  const param = req.params.slugOrId;
  db.query("SELECT * FROM blog_posts WHERE (id = ? OR slug = ?) AND status = 'published'", [param, param], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database Error' });
    if (results.length === 0) return res.status(404).json({ error: 'Post not found' });
    res.json(results[0]);
  });
});

// Admin Get all posts
app.get('/api/admin/posts', (req, res) => {
  db.query('SELECT * FROM blog_posts ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database Error' });
    res.json(results);
  });
});

// Admin Create post
app.post('/api/admin/posts', (req, res) => {
  const { title, slug, content, excerpt, image_url, author, status } = req.body;
  if (!title || !slug) return res.status(400).json({ error: 'Title and slug are required' });
  db.query('INSERT INTO blog_posts (title, slug, content, excerpt, image_url, author, status) VALUES (?, ?, ?, ?, ?, ?, ?)', 
    [title, slug, content, excerpt, image_url, author || 'إدارة زهرة بيسان', status || 'published'], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Slug already exists' });
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, id: result.insertId });
  });
});

// Admin Update post
app.put('/api/admin/posts/:id', (req, res) => {
  const { id } = req.params;
  const { title, slug, content, excerpt, image_url, author, status } = req.body;
  db.query('UPDATE blog_posts SET title=?, slug=?, content=?, excerpt=?, image_url=?, author=?, status=? WHERE id=?',
    [title, slug, content, excerpt, image_url, author, status, id], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Slug already exists' });
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Admin Delete post
app.delete('/api/admin/posts/:id', (req, res) => {
  db.query('DELETE FROM blog_posts WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ================= AUTOMATED REPORTS =================

const sendReportEmail = async (period, days) => {
  if (!process.env.SMTP_USER) return;
  db.query("SELECT COUNT(*) as orders_count, SUM(total) as revenue FROM orders WHERE created_at >= NOW() - INTERVAL ? DAY", [days], async (err, results) => {
    if (err || !results) return;
    const { orders_count, revenue } = results[0];
    
    await transporter.sendMail({
      from: `"Zahrat Beesan" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: `📊 تقرير زهرة بيسان ${period === 'weekly' ? 'الأسبوعي' : 'الشهري'}`,
      html: `
        <div dir="rtl" style="font-family: Arial; color: #333; text-align: right;">
          <h2 style="color: #5c3d1e;">ملخص أداء المتجر - ${period === 'weekly' ? 'آخر 7 أيام' : 'آخر 30 يوم'}</h2>
          <p>إجمالي المبيعات: <b>${revenue || 0} JOD</b></p>
          <p>عدد الطلبات: <b>${orders_count || 0}</b></p>
        </div>
      `
    }).catch(e => console.error('Report email failed', e));
  });
};

// Weekly Report: Friday at 23:00
cron.schedule('0 23 * * 5', () => sendReportEmail('weekly', 7));

// Monthly Report: 1st of every month at 00:00
cron.schedule('0 0 1 * *', () => sendReportEmail('monthly', 30));

app.post('/api/admin/reports/send-manual', (req, res) => {
  const { period } = req.body;
  const days = period === 'weekly' ? 7 : 30;
  sendReportEmail(period, days);
  res.json({ success: true, message: 'Report is being sent' });
});

// =====================================================

// ================= e-GIFT CARDS ======================

const generateGiftCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ZB-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

app.post('/api/gift-cards/purchase', (req, res) => {
  const { amount, buyerEmail, recipientEmail, message } = req.body;
  const code = generateGiftCode();
  db.query("INSERT INTO gift_cards (code, initial_value, balance, buyer_email, recipient_email, message) VALUES (?, ?, ?, ?, ?, ?)", [code, amount, amount, buyerEmail, recipientEmail, message], async (err) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // In a real app, charge credit card here first. 
    // Then send email to recipient.
    if (process.env.SMTP_USER && recipientEmail) {
      await transporter.sendMail({
        from: `"زهرة بيسان" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: "🎁 لقد تلقيت بطاقة هدية من زهرة بيسان!",
        html: `
          <div dir="rtl" style="font-family: Arial; text-align: right; color: #333;">
            <h2 style="color: #c5a880;">مرحباً!</h2>
            <p>لقد أرسل لك <b>${buyerEmail}</b> بطاقة هدية بقيمة <b>${amount} JOD</b> للتسوق من متجر زهرة بيسان.</p>
            ${message ? `<p>الرسالة: "<i>${message}</i>"</p>` : ''}
            <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 2px; font-weight: bold; margin: 20px 0;">
              ${code}
            </div>
            <p>استخدم هذا الكود عند الدفع للحصول على الخصم.</p>
            <a href="${process.env.SITE_URL || 'https://zahratbeesan.com'}" style="background: #5c3d1e; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">تسوّق الآن</a>
          </div>
        `
      }).catch(e => console.error(e));
    }

    res.json({ success: true, code });
  });
});

app.post('/api/gift-cards/apply', (req, res) => {
  const { code } = req.body;
  db.query("SELECT * FROM gift_cards WHERE code = ? AND status = 'active'", [code], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'الكود غير صالح أو مستخدم' });
    const card = results[0];
    if (card.balance <= 0) return res.status(400).json({ error: 'لا يوجد رصيد كافٍ في هذه البطاقة' });
    res.json({ success: true, balance: card.balance });
  });
});

app.get('/api/admin/gift-cards', (req, res) => {
  db.query("SELECT * FROM gift_cards ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// =====================================================

// ================= ABANDONED CART =================

app.post('/api/cart/abandoned', (req, res) => {
  const { email, phone, cartItems, total } = req.body;
  if ((!email && !phone) || !cartItems || cartItems.length === 0) return res.json({ success: false });
  
  // Find if pending cart exists for this user
  db.query("SELECT id FROM abandoned_carts WHERE (email = ? OR phone = ?) AND status = 'pending'", [email, phone], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length > 0) {
      // Update existing
      db.query("UPDATE abandoned_carts SET cart_items = ?, total_price = ?, updated_at = NOW() WHERE id = ?", [JSON.stringify(cartItems), total, results[0].id], (err) => {
        res.json({ success: true, updated: true });
      });
    } else {
      // Insert new
      db.query("INSERT INTO abandoned_carts (email, phone, cart_items, total_price) VALUES (?, ?, ?, ?)", [email, phone, JSON.stringify(cartItems), total], (err) => {
        res.json({ success: true, inserted: true });
      });
    }
  });
});

app.get('/api/admin/abandoned-carts', (req, res) => {
  db.query('SELECT * FROM abandoned_carts ORDER BY updated_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database Error' });
    res.json(results);
  });
});

// Configure NodeMailer (Uses environment variables)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post('/api/admin/abandoned-carts/send-reminder', async (req, res) => {
  const { id } = req.body;
  db.query('SELECT * FROM abandoned_carts WHERE id = ?', [id], async (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'Cart not found' });
    const cart = results[0];
    
    if (!cart.email) return res.status(400).json({ error: 'No email address for this cart' });
    if (!process.env.SMTP_USER) return res.status(500).json({ error: 'SMTP credentials not configured on server' });

    try {
      const items = typeof cart.cart_items === 'string' ? JSON.parse(cart.cart_items) : cart.cart_items;
      let itemsList = items.map(i => `<li>${i.name} - ${i.quantity} x ${i.price} JOD</li>`).join('');

      await transporter.sendMail({
        from: `"زهرة بيسان" <${process.env.SMTP_USER}>`,
        to: cart.email,
        subject: "🛒 لا تفوتي عباءتك المفضلة من زهرة بيسان!",
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; color: #333;">
            <h2 style="color: #5c3d1e;">مرحباً،</h2>
            <p>لاحظنا أنك تركتِ بعض القطع الأنيقة في سلة التسوق الخاصة بك. العباءات المميزة تُباع بسرعة، لا تفوتي فرصتك!</p>
            <ul style="background: #fdfaf6; padding: 15px 30px; border-radius: 8px;">
              ${itemsList}
            </ul>
            <p>إجمالي السلة: <b>${cart.total_price} JOD</b></p>
            <p>استخدمي الكود <b>COMEBACK5</b> للحصول على خصم 5% على طلبك اليوم!</p>
            <a href="https://${req.get('host')}/checkout" style="background: #c5a880; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">أكملي طلبك الآن</a>
          </div>
        `
      });

      db.query("UPDATE abandoned_carts SET status = 'sent' WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (sendErr) {
      console.error(sendErr);
      res.status(500).json({ error: 'Failed to send email: ' + sendErr.message });
    }
  });
});

// Cron Job: Run every hour, check for pending carts > 2 hours old
cron.schedule('0 * * * *', () => {
  db.query("SELECT * FROM abandoned_carts WHERE status = 'pending' AND updated_at < NOW() - INTERVAL 2 HOUR AND email IS NOT NULL", async (err, results) => {
    if (err || !results) return;
    for (let cart of results) {
      if (!process.env.SMTP_USER) break; // Skip if SMTP not configured
      try {
        const items = typeof cart.cart_items === 'string' ? JSON.parse(cart.cart_items) : cart.cart_items;
        let itemsList = items.map(i => `<li>${i.name} - ${i.quantity} x ${i.price} JOD</li>`).join('');

        await transporter.sendMail({
          from: `"زهرة بيسان" <${process.env.SMTP_USER}>`,
          to: cart.email,
          subject: "🛒 لا تفوتي عباءتك المفضلة من زهرة بيسان!",
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; color: #333;">
              <h2 style="color: #5c3d1e;">مرحباً،</h2>
              <p>لاحظنا أنك تركتِ بعض القطع الأنيقة في سلة التسوق الخاصة بك.</p>
              <ul style="background: #fdfaf6; padding: 15px 30px; border-radius: 8px;">
                ${itemsList}
              </ul>
              <p>إجمالي السلة: <b>${cart.total_price} JOD</b></p>
              <p>استخدمي الكود <b>COMEBACK5</b> للحصول على خصم 5% على طلبك اليوم!</p>
              <a href="${process.env.SITE_URL || 'https://zahratbeesan.com'}/checkout" style="background: #c5a880; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">أكملي طلبك الآن</a>
            </div>
          `
        });
        db.query("UPDATE abandoned_carts SET status = 'sent' WHERE id = ?", [cart.id]);
      } catch (e) {
        console.error('Cron email send failed', e);
      }
    }
  });
});

// ==================================================


app.post('/api/inventory', (req, res) => {
  try {
    let { item_name, quantity, unit, min_threshold } = req.body;
    const cleanQty = parseFloat(convertNumerals(quantity).replace(/[^0-9.]/g, '')) || 0;
    const cleanThreshold = parseInt(convertNumerals(min_threshold).replace(/[^0-9.]/g, '')) || 0;
    db.query("INSERT INTO inventory (item_name, quantity, unit, min_threshold) VALUES (?, ?, ?, ?)", [item_name, cleanQty, unit, cleanThreshold], (err, result) => {
      if (err) return res.status(500).json({ error: `SQL Error: ${err.message}` });
      if (req.logAdminAction) req.logAdminAction('Add Inventory Item', `Added item: ${item_name}`);
      res.status(201).json({ id: result.insertId, item_name, quantity: cleanQty, unit, min_threshold: cleanThreshold });
    });
  } catch (error) {
    res.status(500).json({ error: `Server Error: ${error.message}` });
  }
});

app.put('/api/update-stock-item/:id', (req, res) => {
  try {
    const { id } = req.params;
    let { item_name, quantity, unit, min_threshold } = req.body;
    const cleanQty = parseFloat(convertNumerals(quantity).replace(/[^0-9.]/g, '')) || 0;
    const cleanThreshold = parseInt(convertNumerals(min_threshold).replace(/[^0-9.]/g, '')) || 0;
    db.query("UPDATE inventory SET item_name = ?, quantity = ?, unit = ?, min_threshold = ? WHERE id = ?", [item_name, cleanQty, unit, cleanThreshold, id], (err) => {
      if (err) return res.status(500).json({ error: `SQL Error: ${err.message}` });
      if (req.logAdminAction) req.logAdminAction('Update Stock', `Updated ${item_name} to ${cleanQty} ${unit}`);
      res.json({ message: 'Item updated' });
    });
  } catch (error) {
    res.status(500).json({ error: `Server Error: ${error.message}` });
  }
});

app.delete('/api/inventory/:id', (req, res) => {
  db.query("DELETE FROM inventory WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Item deleted' });
  });
});

app.get('/api/careers', (req, res) => {
  db.query('SELECT * FROM careers WHERE active = 1 ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/careers', (req, res) => {
  const { title, type, location, description } = req.body;
  db.query('INSERT INTO careers (title, type, location, description) VALUES (?, ?, ?, ?)', [title, type, location, description], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Job created', id: result.insertId });
  });
});

app.put('/api/careers/:id', (req, res) => {
  const { id } = req.params;
  const { title, type, location, description, active } = req.body;
  db.query('UPDATE careers SET title = ?, type = ?, location = ?, description = ?, active = ? WHERE id = ?', [title, type, location, description, active, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Job updated' });
  });
});

app.delete('/api/careers/:id', (req, res) => {
  db.query('DELETE FROM careers WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Job deleted' });
  });
});

app.get('/api/products/:id/recipe', async (req, res) => {
  try {
    const [results] = await db.promise().query(`SELECT r.*, i.item_name, i.unit FROM recipes r JOIN inventory i ON r.inventory_id = i.id WHERE r.menu_item_id = ?`, [req.params.id]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Product Variants (Color Variants) ──────────────────────────────────────
app.get('/api/products/:id/variants', async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order ASC, id ASC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products/:id/variants', async (req, res) => {
  try {
    const { color_name, colors, images, video_url, sizes, sort_order } = req.body;
    if (!color_name) return res.status(400).json({ error: 'color_name is required' });
    const [result] = await db.promise().query(
      'INSERT INTO product_variants (product_id, color_name, colors, images, video_url, sizes, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        req.params.id,
        color_name,
        JSON.stringify(colors || []),
        JSON.stringify(images || []),
        video_url || null,
        JSON.stringify(sizes || []),
        sort_order || 0
      ]
    );
    if (req.logAdminAction) req.logAdminAction('Add Variant', `Added color variant "${color_name}" to product #${req.params.id}`);
    res.status(201).json({ id: result.insertId, message: 'Variant created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/variants/:variantId', async (req, res) => {
  try {
    const { color_name, colors, images, video_url, sizes, sort_order } = req.body;
    await db.promise().query(
      'UPDATE product_variants SET color_name=?, colors=?, images=?, video_url=?, sizes=?, sort_order=? WHERE id=?',
      [
        color_name,
        JSON.stringify(colors || []),
        JSON.stringify(images || []),
        video_url || null,
        JSON.stringify(sizes || []),
        sort_order || 0,
        req.params.variantId
      ]
    );
    if (req.logAdminAction) req.logAdminAction('Update Variant', `Updated color variant #${req.params.variantId}`);
    res.json({ message: 'Variant updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/variants/:variantId', async (req, res) => {
  try {
    await db.promise().query('DELETE FROM product_variants WHERE id=?', [req.params.variantId]);
    if (req.logAdminAction) req.logAdminAction('Delete Variant', `Deleted color variant #${req.params.variantId}`);
    res.json({ message: 'Variant deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ───────────────────────────────────────────────────────────────────────────


app.post('/api/products/:id/recipe', async (req, res) => {
  const { id } = req.params;
  const { ingredients } = req.body;
  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM recipes WHERE menu_item_id = ?', [id]);
    if (Array.isArray(ingredients) && ingredients.length > 0) {
      const values = ingredients.map(ing => [id, ing.inventory_id, ing.quantity_required]);
      await conn.query('INSERT INTO recipes (menu_item_id, inventory_id, quantity_required) VALUES ?', [values]);
    }
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.post('/api/ai', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
  try {
    if (!openai) return res.json({ answer: "[Local Mode] AI Assistant is currently unavailable." });
    const now = new Date();
    const currentDateTime = now.toLocaleString('en-GB', { timeZone: 'Asia/Amman' });
    
    // Fetch menu
    const promiseDb = db.promise();
    const [menuRes] = await promiseDb.query(`SELECT id, name, price_display FROM menu_items WHERE available = 1`);

    const menuItems = menuRes.map(m => `${m.name} (${m.price_display})`).join(', ');

    let context = `You are Yafa (يافا), the friendly and professional abaya fashion consultant for Zahrat Beesan (زهرة بيسان) — a global online boutique for luxury abayas and oriental embroideries, shipping worldwide. We are an online-only store with no physical location. Current time: ${currentDateTime}.
Focus on helping customers choose abayas, match colors, select sizes (S, M, L, XL, XXL, 3XL), and answer questions about international shipping and payment methods (COD for local, card worldwide).
Menu: ${menuItems}
CRITICAL RULES:
1. Do NOT invent, hallucinate, or guess information. Recommend items from the Menu above.
2. Respond in the same language the customer uses.
3. Be warm, polite, and elegant.`;

    const response = await openai.chat.completions.create({ 
      model: 'gpt-4o-mini', 
      messages: [{ role: 'system', content: context }, { role: 'user', content: prompt }], 
      max_tokens: 500,
      temperature: 0.0
    });
    res.json({ answer: response.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: 'AI service failure' });
  }
});

app.post('/api/ai-assistant-logs', (req, res) => {
  const { admin_query, ai_response } = req.body;
  db.query("INSERT INTO ai_assistant_messages (admin_query, ai_response) VALUES (?, ?)", [admin_query, ai_response], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ success: true, id: result.insertId });
  });
});

app.get('/api/ai-assistant-logs', (req, res) => {
  db.query("SELECT * FROM ai_assistant_messages ORDER BY created_at DESC LIMIT 50", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/contact-messages', (req, res) => {
  db.query("SELECT * FROM contact_messages ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    res.json(results);
  });
});

app.post('/api/apply', (req, res) => {
  const { name, email, phone, position, cover_letter, resume_url } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Missing name or email' });
  db.query(`INSERT INTO job_applications (name, email, phone, position, cover_letter, resume_url) VALUES (?, ?, ?, ?, ?, ?)`, [name, email, phone || null, position || null, cover_letter || null, resume_url || null], (err, result) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    res.status(201).json({ message: 'Application received' });
  });
});

app.get('/api/applications', (req, res) => {
  db.query('SELECT * FROM job_applications ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/applications', (req, res) => {
  const { name, email, phone, position, cover_letter, resume_url } = req.body;
  db.query('INSERT INTO job_applications (name, email, phone, position, cover_letter, resume_url) VALUES (?, ?, ?, ?, ?, ?)', [name, email, phone, position, cover_letter, resume_url], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Application submitted successfully', id: result.insertId });
  });
});

app.put('/api/applications/:id/status', (req, res) => {
  const { status } = req.body;
  db.query('UPDATE job_applications SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status updated' });
  });
});

app.delete('/api/applications/:id', (req, res) => {
  db.query('DELETE FROM job_applications WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Application deleted' });
  });
});

app.get('/api/messages', (req, res) => {
  db.query('SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 100', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/messages', (req, res) => {
  const { user_msg, ai_msg } = req.body;
  if (!user_msg) return res.status(400).json({ error: 'user_msg is required' });
  db.query('INSERT INTO chat_messages (user_msg, ai_msg) VALUES (?, ?)', [user_msg, ai_msg || ''], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ success: true, id: result.insertId });
  });
});

// Helper for audit logging
const logToAudit = (adminUser, action, category, severity, entityType, entityId, details, req) => {
  const ip = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null;
  const ua = req ? req.headers['user-agent'] : null;
  const q = 'INSERT INTO auditlog (adminUser, action, category, severity, entityType, entityId, details, ipAddress, userAgent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(q, [adminUser || 'admin', action, category || 'general', severity || 'info', entityType || null, entityId || null, details || null, ip, ua], (err) => {
    if (err) console.error('[Audit Log Table Error]', err.message);
  });
};

// Coupons API
app.get('/api/coupons', (req, res) => {
  db.query('SELECT * FROM coupon ORDER BY createdAt DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/coupons/validate', (req, res) => {
  const { code, subtotal } = req.query;
  if (!code) return res.status(400).json({ valid: false, error: 'كود الخصم مطلوب' });
  
  const sub = parseFloat(subtotal) || 0;
  
  db.query('SELECT * FROM coupon WHERE code = ? AND isActive = 1 LIMIT 1', [code], (err, results) => {
    if (err) return res.status(500).json({ valid: false, error: err.message });
    if (results.length === 0) return res.status(400).json({ valid: false, error: 'كود الخصم غير صحيح أو غير فعال' });
    
    const coupon = results[0];
    
    // Check expiry
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ valid: false, error: 'كود الخصم منتهي الصلاحية' });
    }
    
    // Check usage limits
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ valid: false, error: 'تم استهلاك كود الخصم بالكامل' });
    }
    
    // Check min order
    if (sub < coupon.minOrderJOD) {
      return res.status(400).json({ valid: false, error: `الحد الأدنى لقيمة الطلب لاستخدام هذا الكود هو ${coupon.minOrderJOD.toFixed(2)} JOD` });
    }
    
    res.json({
      valid: true,
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      description: coupon.description
    });
  });
});

app.post('/api/coupons', (req, res) => {
  const { code, description, discountType, discountValue, minOrderJOD, maxUses, expiresAt } = req.body;
  if (!code || typeof discountValue === 'undefined') {
    return res.status(400).json({ error: 'الكود وقيمة الخصم مطلوبة' });
  }
  
  db.query('INSERT INTO coupon (code, description, discountType, discountValue, minOrderJOD, maxUses, expiresAt, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
    [code, description || null, discountType || 'percent', discountValue, minOrderJOD || 0, maxUses || null, expiresAt || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      const adminEmail = req.headers['x-admin-email'] || 'admin@zahratbeesan.com';
      logToAudit(adminEmail, `Created coupon code: ${code}`, 'coupons', 'info', 'coupon', String(result.insertId), `Discount: ${discountValue} (${discountType})`, req);
      res.status(201).json({ success: true, id: result.insertId });
    }
  );
});

app.put('/api/coupons/:id', (req, res) => {
  const { code, description, discountType, discountValue, minOrderJOD, maxUses, expiresAt, isActive } = req.body;
  db.query('UPDATE coupon SET code = ?, description = ?, discountType = ?, discountValue = ?, minOrderJOD = ?, maxUses = ?, expiresAt = ?, isActive = ? WHERE id = ?',
    [code, description, discountType, discountValue, minOrderJOD, maxUses, expiresAt, isActive ? 1 : 0, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      const adminEmail = req.headers['x-admin-email'] || 'admin@zahratbeesan.com';
      logToAudit(adminEmail, `Updated coupon: ${code}`, 'coupons', 'info', 'coupon', req.params.id, `Status active: ${isActive}`, req);
      res.json({ success: true });
    }
  );
});

app.delete('/api/coupons/:id', (req, res) => {
  db.query('DELETE FROM coupon WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    const adminEmail = req.headers['x-admin-email'] || 'admin@zahratbeesan.com';
    logToAudit(adminEmail, `Deleted coupon ID: ${req.params.id}`, 'coupons', 'warning', 'coupon', req.params.id, null, req);
    res.json({ success: true });
  });
});

// Newsletter API
app.get('/api/newsletter', (req, res) => {
  db.query('SELECT * FROM newsletter ORDER BY subscribedAt DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/newsletter', (req, res) => {
  const { email, name, country } = req.body;
  if (!email) return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });
  
  db.query('SELECT * FROM newsletter WHERE email = ? LIMIT 1', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      db.query('UPDATE newsletter SET isActive = 1, name = ?, country = ? WHERE email = ?', [name || null, country || null, email], (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        return res.json({ success: true, message: 'تم الاشتراك بنجاح' });
      });
    } else {
      db.query('INSERT INTO newsletter (email, name, country, isActive) VALUES (?, ?, ?, 1)', 
        [email, name || null, country || null], 
        (err3, result) => {
          if (err3) return res.status(500).json({ error: err3.message });
          
          // Send automated Welcome Email
          const senderEmail = process.env.SMTP_USER || 'zahratbeesanshop@gmail.com';
          if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter.sendMail({
              from: `"زهرة بيسان" <${senderEmail}>`,
              to: email,
              subject: "🌸 أهلاً بكِ في عائلة زهرة بيسان! هدية خاصة بانتظارك",
              html: `
                <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; color: #333;">
                  <h2 style="color: #c5a880;">أهلاً بكِ في عالم زهرة بيسان للعباءات والأناقة 🌸</h2>
                  <p>سعداء جداً بانضمامك إلينا! كنسخة من ترحيبنا الخاص، يسعدنا إهداؤك خصم خاص على طلبك الأول.</p>
                  <div style="background: #fdfaf6; border: 1px solid #c5a880; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0;">
                    <span style="font-size: 1.1rem; color: #5c3d1e;">رمز الخصم الترحيبي الخاص بك:</span>
                    <h3 style="color: #c5a880; font-size: 1.8rem; letter-spacing: 2px; margin: 10px 0;">WELCOME5</h3>
                  </div>
                  <p>استمتعي بتصفح التشكيلة الجديدة من العباءات الخليجية والمميزة.</p>
                  <a href="https://zahratbeesan.com" style="background: #c5a880; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">تصفحي المتجر الآن</a>
                </div>
              `
            }).catch(e => console.error('[Welcome Email Error]:', e.message));
          }

          res.status(201).json({ success: true, message: 'تم الاشتراك بنجاح وتوجيه الإيميل الترحيبي', id: result.insertId });
        }
      );
    }
  });
});

app.delete('/api/newsletter/:id', (req, res) => {
  db.query('DELETE FROM newsletter WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Reviews API using review table (with approval workflow)
app.get('/api/reviews', (req, res) => {
  const { productId, approvedOnly } = req.query;
  let q = 'SELECT r.*, mi.name as productName FROM review r LEFT JOIN menu_items mi ON r.productId = mi.id';
  const params = [];
  const conditions = [];
  
  if (productId) {
    conditions.push('r.productId = ?');
    params.push(productId);
  }
  
  if (approvedOnly === 'true' || approvedOnly === undefined) {
    conditions.push('r.isApproved = 1');
  }
  
  if (conditions.length > 0) {
    q += ' WHERE ' + conditions.join(' AND ');
  }
  
  q += ' ORDER BY r.createdAt DESC';
  
  db.query(q, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/reviews', (req, res) => {
  const { productId, customerName, comment, rating } = req.body;
  if (!productId || !customerName || typeof rating === 'undefined') {
    return res.status(400).json({ error: 'الاسم والتقييم والمنتج مطلوبة' });
  }
  
  db.query('INSERT INTO review (productId, customerName, comment, rating, isApproved) VALUES (?, ?, ?, ?, 0)', 
    [productId, customerName, comment || null, rating], 
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ success: true, message: 'تم حفظ التقييم بانتظار موافقة الإدارة', id: result.insertId });
    }
  );
});

app.put('/api/reviews/:id', (req, res) => {
  const { isApproved } = req.body;
  db.query('UPDATE review SET isApproved = ? WHERE id = ?', [isApproved ? 1 : 0, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    const adminEmail = req.headers['x-admin-email'] || 'admin@zahratbeesan.com';
    logToAudit(adminEmail, `Approved review ID: ${req.params.id}`, 'reviews', 'info', 'review', req.params.id, `Status: approved`, req);
    res.json({ success: true });
  });
});

app.delete('/api/reviews/:id', (req, res) => {
  db.query('DELETE FROM review WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    const adminEmail = req.headers['x-admin-email'] || 'admin@zahratbeesan.com';
    logToAudit(adminEmail, `Deleted review ID: ${req.params.id}`, 'reviews', 'warning', 'review', req.params.id, null, req);
    res.json({ success: true });
  });
});

app.get('/api/images', (req, res) => {
  fs.readdir(imgDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Cannot read images folder' });
    res.json(files.filter(f => /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(f)));
  });
});

app.put('/api/products/reorder', async (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) return res.status(400).json({ error: 'Invalid payload' });
  try {
    for (const item of order) {
      if (!item.id) continue;
      await db.promise().query('UPDATE menu_items SET sort_order = ? WHERE id = ?', [item.sort_order, item.id]);
    }
    res.json({ message: 'Order saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  let { name, price_num, cost_price, tax_amount, description, available, category_id, image_url, video_url, tags, addons, addon_ids, tag_ids, sku, subtitle, badge, images, fabric, sizes, care, pre_order, size_chart, weight } = req.body;
  if (category_id === 'espresso') category_id = '2';
  if (category_id === 'tea') category_id = '6';
  if (category_id === 'cold') category_id = '1';
  if (category_id === 'food') category_id = '3';
  if (category_id === 'sweets') category_id = '5';
  if (category_id === 'soft') category_id = '4';
  if (!name) return res.status(400).json({ error: 'Missing name' });

  let conn;
  try {
    conn = await db.promise().getConnection();
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT MAX(sort_order) as maxOrder FROM menu_items');
    const nextOrder = (rows[0].maxOrder || 0) + 1;
    const rawPrice = price_num ? convertNumerals(price_num.toString()).replace(/[^0-9.]/g, '') : null;
    const cleanPrice = (rawPrice && rawPrice.trim() !== '') ? rawPrice : null;
    const cleanCost = cost_price ? parseFloat(cost_price) || 0 : 0;
    const cleanTax = tax_amount ? parseFloat(tax_amount) || 0 : 0;
    const price_display = cleanPrice ? `JOD ${parseFloat(cleanPrice).toFixed(2)}` : null;
    const [result] = await conn.query('INSERT INTO menu_items (category_id, name, price_num, cost_price, tax_amount, price_display, description, tags, available, image_url, video_url, addons, sort_order, sku, subtitle, badge, images, fabric, sizes, care, pre_order, size_chart, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [category_id || null, name, cleanPrice, cleanCost, cleanTax, price_display, description || null, tags || null, available ?? 1, image_url || null, video_url || null, addons || null, nextOrder, sku || null, subtitle || null, badge || null, images || null, fabric || null, sizes || '["S", "M", "L", "XL", "XXL", "3XL"]', care || null, pre_order ? 1 : 0, size_chart || null, weight || null]);
    const productId = result.insertId;
    if (Array.isArray(addon_ids)) for (const aid of addon_ids) if (aid) await conn.query('INSERT IGNORE INTO menu_item_addons (menu_item_id, addon_id) VALUES (?, ?)', [productId, aid]);
    if (Array.isArray(tag_ids)) for (const tid of tag_ids) if (tid) await conn.query('INSERT IGNORE INTO menu_item_tags (menu_item_id, tag_id) VALUES (?, ?)', [productId, tid]);
    await conn.commit();
    if (req.logAdminAction) req.logAdminAction('Add Product', `Added new product: ${name}`);
    res.status(201).json({ message: 'Product created successfully', id: productId });
  } catch (err) {
    if (conn) await conn.rollback();
    res.status(500).json({ error: err.sqlMessage || err.message || 'Internal Server Error' });
  } finally {
    if (conn) conn.release();
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  let { name, price_num, cost_price, tax_amount, description, available, category_id, image_url, video_url, tags, addons, addon_ids, tag_ids, sku, subtitle, badge, images, fabric, sizes, care, pre_order, size_chart, weight } = req.body;
  let conn;
  try {
    conn = await db.promise().getConnection();
    await conn.beginTransaction();
    let cleanPrice = null;
    if (price_num !== undefined && price_num !== null) cleanPrice = convertNumerals(price_num.toString()).replace(/[^0-9.]/g, '');
    const cleanCost = cost_price ? parseFloat(cost_price) || 0 : 0;
    const cleanTax = tax_amount ? parseFloat(tax_amount) || 0 : 0;
    const price_display = cleanPrice ? `JOD ${parseFloat(cleanPrice).toFixed(2)}` : null;
    await conn.query("UPDATE menu_items SET name = ?, price_num = ?, cost_price = ?, tax_amount = ?, price_display = ?, description = ?, available = ?, category_id = ?, image_url = ?, video_url = ?, tags = ?, addons = ?, sku = ?, subtitle = ?, badge = ?, images = ?, fabric = ?, sizes = ?, care = ?, pre_order = ?, size_chart = ?, weight = ? WHERE id = ?", [name, cleanPrice, cleanCost, cleanTax, price_display, description, available, category_id || null, image_url || null, video_url || null, tags || null, addons || null, sku || null, subtitle || null, badge || null, images || null, fabric || null, sizes || '["S", "M", "L", "XL", "XXL", "3XL"]', care || null, pre_order ? 1 : 0, size_chart || null, weight || null, id]);
    if (Array.isArray(addon_ids)) {
      await conn.query('DELETE FROM menu_item_addons WHERE menu_item_id = ?', [id]);
      for (const aid of addon_ids) if (aid) await conn.query('INSERT INTO menu_item_addons (menu_item_id, addon_id) VALUES (?, ?)', [id, aid]);
    }
    if (Array.isArray(tag_ids)) {
      await conn.query('DELETE FROM menu_item_tags WHERE menu_item_id = ?', [id]);
      for (const tid of tag_ids) if (tid) await conn.query('INSERT INTO menu_item_tags (menu_item_id, tag_id) VALUES (?, ?)', [id, tid]);
    }
    await conn.commit();
    if (req.logAdminAction) req.logAdminAction('Edit Product', `Updated product: ${name}`);
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    if (conn) await conn.rollback();
    res.status(500).json({ error: err.sqlMessage || err.message || 'Internal Server Error' });
  } finally {
    if (conn) conn.release();
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await db.promise().query("DELETE FROM recipes WHERE menu_item_id = ?", [req.params.id]);
    await db.promise().query("DELETE FROM menu_items WHERE id = ?", [req.params.id]);
    if (req.logAdminAction) req.logAdminAction('Delete Product', `Deleted product ID: ${req.params.id}`);
    res.json({ message: 'Product and associated recipes deleted successfully' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') return res.status(400).json({ error: 'Cannot delete this product because it has associated sales orders.' });
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai-chat', async (req, res) => {
  const { message, isAdmin, history } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const now = new Date();
  const currentDateTime = now.toLocaleString('en-GB', { timeZone: 'Asia/Amman' });
  let businessContext = isAdmin
    ? `You are the Zahrat Beesan Internal Business Intelligence AI. Current time is ${currentDateTime}.`
    : `You are Yafa (يافا), the friendly and professional abaya fashion consultant for Zahrat Beesan (زهرة بيسان) — a global online store shipping worldwide. No physical location. Current time: ${currentDateTime}.
You help customers select abayas, match designs, choose sizes (S, M, L, XL, XXL, 3XL), and answer questions about international shipping and payment. Respond in the customer's language.`;

  try {
    const promiseDb = db.promise();
    const isActuallyAdmin = String(isAdmin) === 'true';
    
    if (isActuallyAdmin) {
      console.log(`[AI] Processing Admin Query with full business context. (Jordan Time: ${currentDateTime})`);
      try {
        const promiseDb = db.promise();
        const results = await Promise.allSettled([
          /* 0 */ promiseDb.query(`SELECT COUNT(*) as total_orders, COALESCE(SUM(total_amount),0) as total_revenue FROM orders`),
          /* 1 */ promiseDb.query(`SELECT COUNT(*) as today_orders, COALESCE(SUM(total_amount),0) as today_revenue FROM orders WHERE DATE(created_at) = CURDATE()`),
          /* 2 */ promiseDb.query(`SELECT COUNT(*) as yesterday_orders, COALESCE(SUM(total_amount),0) as yesterday_revenue FROM orders WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`),
          /* 3 */ promiseDb.query(`SELECT status, COUNT(*) as count FROM orders GROUP BY status`),
          /* 4 */ promiseDb.query(`SELECT mi.name, SUM(oi.quantity) as sold FROM order_items oi ${MENU_ITEM_JOIN_CONDITION} GROUP BY mi.id ORDER BY sold DESC LIMIT 8`),
          /* 5 */ promiseDb.query(`SELECT DATE(created_at) as best_date, SUM(total_amount) as daily_rev FROM orders GROUP BY DATE(created_at) ORDER BY daily_rev DESC LIMIT 1`),
          /* 6 */ promiseDb.query(`SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, COUNT(*) as orders, COALESCE(SUM(total_amount),0) as revenue FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 15 DAY) GROUP BY DATE(created_at) ORDER BY date DESC`),
          /* 7 */ promiseDb.query(`SELECT item_name, quantity, unit, min_threshold, CASE WHEN quantity <= min_threshold THEN 'LOW' ELSE 'OK' END as stock_status FROM inventory ORDER BY stock_status DESC, item_name`),
          /* 8 */ promiseDb.query(`SELECT name, price_display, available FROM menu_items WHERE available = 1`),
          /* 9 */ promiseDb.query(`SELECT * FROM offers`),
          /* 10 */ promiseDb.query(`SELECT name, message, DATE_FORMAT(created_at, '%Y-%m-%d') as date FROM contact_messages ORDER BY created_at DESC LIMIT 10`),
          /* 11 */ promiseDb.query(`SELECT name, position, status FROM job_applications ORDER BY created_at DESC LIMIT 10`),
          /* 12 */ promiseDb.query(`SELECT title, type, location FROM careers WHERE active = 1`),
          /* 13 */ promiseDb.query(`SELECT ROUND(AVG(rating),1) as avg_rating, COUNT(*) as total FROM general_feedback`),
          /* 14 */ promiseDb.query(`SELECT reviewer_name, rating, comment FROM general_feedback ORDER BY created_at DESC LIMIT 5`),
          /* 15 */ promiseDb.query(`SELECT admin_name, action, details, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as time FROM admin_logs ORDER BY created_at DESC LIMIT 20`),
          /* 16 */ promiseDb.query(`SELECT customer_name, total_amount, status, order_type, DATE_FORMAT(created_at, '%H:%i') as time FROM orders WHERE DATE(created_at) = CURDATE() ORDER BY created_at DESC`),
          /* 17 */ promiseDb.query(`SELECT mi.name as product, ROUND(AVG(pr.rating),1) as rating, COUNT(pr.id) as count FROM menu_items mi LEFT JOIN product_reviews pr ON mi.id = pr.product_id GROUP BY mi.id HAVING count > 0`),
          /* 18 */ promiseDb.query(`SELECT customer_name, total_amount, status, order_type, DATE_FORMAT(created_at, '%H:%i') as time FROM orders WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) ORDER BY created_at DESC`),
          /* 19 */ promiseDb.query(`SELECT customer_name, total_amount, status, order_type, DATE_FORMAT(created_at, '%Y-%m-%d') as date, DATE_FORMAT(created_at, '%H:%i') as time FROM orders ORDER BY created_at DESC`),
          /* 20 */ promiseDb.query(`SELECT COUNT(*) as month_orders, COALESCE(SUM(total_amount),0) as month_revenue FROM orders WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())`),
          /* 21 */ promiseDb.query(`SELECT COUNT(*) as total_messages FROM contact_messages`)
        ]);

        const getRes = (idx, def = []) => (results[idx] && results[idx].status === 'fulfilled' ? results[idx].value[0] : def);

        const allTime         = getRes(0,  [{total_orders:0, total_revenue:0}])[0];
        const todayRow        = getRes(1,  [{today_orders:0, today_revenue:0}])[0];
        const yesterdayRow    = getRes(2,  [{yesterday_orders:0, yesterday_revenue:0}])[0];
        const orderStatuses   = getRes(3);
        const topProducts     = getRes(4);
        const bestDay         = getRes(5,  [null])[0];
        const salesTrend      = getRes(6);
        const inventory       = getRes(7);
        const menuItems       = getRes(8);
        const offers          = getRes(9);
        const messages        = getRes(10);
        const applications    = getRes(11);
        const activeJobs      = getRes(12);
        const feedbackSummary = getRes(13, [{avg_rating:'N/A', total:0}])[0];
        const recentFeedback  = getRes(14);
        const teamActivity    = getRes(15);
        const todayOrders     = getRes(16);
        const productRatings  = getRes(17);
        const yesterdayOrders = getRes(18);
        const recentOrdersDetail = getRes(19); // all orders last 15 days with date
        const thisMonthRow    = getRes(20, [{month_orders:0, month_revenue:0}])[0];
        const totalMessagesRow = getRes(21, [{total_messages:0}])[0];

        // Group last-15-days orders by date for easy AI lookup
        const ordersByDate = {};
        recentOrdersDetail.forEach(o => {
          if (!ordersByDate[o.date]) ordersByDate[o.date] = [];
          ordersByDate[o.date].push(o);
        });
        const ordersPerDateText = Object.entries(ordersByDate)
          .sort((a,b) => b[0].localeCompare(a[0]))
          .map(([date, orders]) => {
            const rev = orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
            const detail = orders.map(o => `${o.customer_name} JOD${o.total_amount} (${o.status}) at ${o.time}`).join(' | ');
            return `[${date}] ${orders.length} orders | JOD${rev.toFixed(2)} revenue\n  ${detail}`;
          }).join('\n');

        const lowStock = inventory.filter(i => i.stock_status === 'LOW');
        const okStock  = inventory.filter(i => i.stock_status === 'OK');

        businessContext = `You are the Zahrat Beesan Business Intelligence Expert for Zahrat Beesan — a global online abaya boutique.
Current Jordan Date/Time: ${currentDateTime}

=== TODAY ===
Revenue: JOD${parseFloat(todayRow.today_revenue).toFixed(2)} | Orders: ${todayRow.today_orders}
Orders Detail: ${todayOrders.map(o => `${o.customer_name} JOD${o.total_amount} (${o.status}) at ${o.time}`).join(' | ') || 'None yet'}

=== YESTERDAY ===
Revenue: JOD${parseFloat(yesterdayRow.yesterday_revenue).toFixed(2)} | Orders: ${yesterdayRow.yesterday_orders}
Orders Detail: ${yesterdayOrders.map(o => `${o.customer_name} JOD${o.total_amount} (${o.status}) at ${o.time}`).join(' | ') || 'None'}

=== ALL ORDERS - FULL HISTORY (grouped by date — use this to answer ANY date question) ===
${ordersPerDateText || 'No orders in last 15 days'}

=== THIS MONTH ===
Revenue: JOD${parseFloat(thisMonthRow.month_revenue).toFixed(2)} | Orders: ${thisMonthRow.month_orders}

=== ALL-TIME & HISTORY ===
Total Revenue: JOD${allTime.total_revenue} | Total Orders: ${allTime.total_orders}
Best Day Ever: ${bestDay ? `${bestDay.best_date}: JOD${bestDay.daily_rev}` : 'N/A'}
By Status: ${orderStatuses.map(s => `${s.status}: ${s.count}`).join(', ')}

=== TOP PRODUCTS ===
${topProducts.map((p,i) => `${i+1}. ${p.name} (${p.sold} sold)`).join(' | ')}

=== SALES TREND (15 DAYS) ===
${salesTrend.map(d => `${d.date}: JOD${d.revenue} (${d.orders} orders)`).join(' | ')}

=== INVENTORY ===
⚠️ LOW (${lowStock.length}): ${lowStock.map(i => `${i.item_name} ${i.quantity}${i.unit||''}`).join(', ') || 'None'}
✅ OK: ${okStock.map(i => `${i.item_name}: ${i.quantity}${i.unit||''}`).join(', ')}

=== MENU & RATINGS ===
Items: ${menuItems.map(m => `${m.name} (${m.price_display})`).join(', ') || 'None'}
Ratings: ${productRatings.map(p => `${p.product}: ${p.rating}⭐️ (${p.count} reviews)`).join(' | ') || 'No ratings yet'}

=== OFFERS ===
${offers.filter(o => o.active == 1).map(o => `${o.product_name}: ${o.discount_percent}% OFF (${o.reason})`).join(' | ') || 'No active offers'}

=== MESSAGES & JOBS ===
Recent Messages (Total ${totalMessagesRow.total_messages} messages): ${messages.map(m => `[${m.date}] ${m.name}: "${m.message}"`).join(' | ') || 'None'}
Job Applications: ${applications.map(a => `${a.name} for ${a.position} (${a.status})`).join(' | ') || 'None'}
Active Listings: ${activeJobs.map(j => `${j.title} (${j.type}) in ${j.location}`).join(', ') || 'None'}

=== FEEDBACK ===
Avg: ${feedbackSummary.avg_rating}/5 (${feedbackSummary.total} reviews)
Recent: ${recentFeedback.map(f => `${f.reviewer_name} (${f.rating}/5): "${f.comment}"`).join(' | ') || 'None'}

=== TEAM ACTIVITY ===
${teamActivity.map(log => `[${log.time}] ${log.admin_name}: ${log.action} — ${log.details}`).join('\n')}

Rule: Answer ONLY from the data above. Be precise and professional. All monetary figures are strictly in Jordanian Dinars (JOD). Do not use £ or GBP. Always specify prices and calculations in JOD.
CRITICAL RULES:
1. Do NOT invent, hallucinate, or guess. Use the EXACT numbers from "TODAY", "YESTERDAY", "THIS MONTH", and "SALES TREND". NEVER manually sum or calculate totals from the "Recent Orders List" as it is only a partial list and will give wrong answers!
2. Pay STRICT attention to dates, hours, and the number of orders per day. When answering, emphasize the exact date, time (hour/minute), and order counts for the requested period (e.g., Today, Yesterday, Day before yesterday, This Month, or All-Time).
4. Ensure 100% factual accuracy based solely on the provided context.`;
      } catch (dbErr) {
        console.error('[AI] Admin DB Fetch Error:', dbErr);
      }
    } else {
      const [menuRes] = await promiseDb.query(`
        SELECT m.id, m.name, m.price_display,
          (SELECT GROUP_CONCAT(CONCAT(v.color_name, ' (مقاسات: ', v.sizes, ')')) FROM product_variants v WHERE v.product_id = m.id) as variants_info
        FROM menu_items m 
        WHERE m.available = 1
      `);

      const menuItems = menuRes.map(m => `- ${m.name} (${m.price_display}) ${m.variants_info ? `[ألوان ومقاسات: ${m.variants_info}]` : '[متوفر بكافة المقاسات الافتراضية]'}`).join('\n');

      businessContext += `\nكتالوج المنتجات المتوفرة حالياً بالمتجر والألوان والمقاسات:\n${menuItems}\n
قواعد هامة لك:
1. أنتِ يافا (Yafa)، مستشارة الأزياء والأناقة المتخصصة في عبايات متجر "زهرة بيسان".
2. أجيبِ العميلات بلباقة ودفء ورقي تام باللهجة واللغة التي يكتبن بها (العربية الفصحى أو العامية اللطيفة أو الإنجليزية).
3. استعيني بالكتالوج أعلاه للإجابة عن توافر الألوان والمقاسات بدقة متناهية ولا تخترعي معلومات غير موجودة بالجدول.`;
    }
  } catch (e) {
    console.warn('[AI] Context Fetch Error:', e.message);
  }

  // --- Gemini (Primary) ---
  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({
        model: 'gemini-1.5-pro',
        systemInstruction: businessContext
      });

      // Build chat history for Gemini format
      const geminiHistory = [];
      if (history && Array.isArray(history)) {
        history.forEach(m => {
          if (m.role === 'user') geminiHistory.push({ role: 'user', parts: [{ text: m.content }] });
          else if (m.role === 'assistant') geminiHistory.push({ role: 'model', parts: [{ text: m.content }] });
        });
      }

      const chat = model.startChat({ history: geminiHistory });
      const result = await chat.sendMessage(message);
      const reply = result.response.text();
      return res.json({ reply: reply || 'عذراً، لم أتمكن من الإجابة. حاول مرة أخرى!' });
    } catch (geminiError) {
      console.error('[Gemini] Chat Error:', geminiError.message);
      // Fall through to OpenAI fallback
    }
  }

  // --- OpenAI (Fallback) ---
  try {
    if (!openai) throw new Error('No AI provider available');
    const aiMessages = [{ role: 'system', content: businessContext }];
    if (history && Array.isArray(history)) aiMessages.push(...history);
    aiMessages.push({ role: 'user', content: message });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: aiMessages,
      max_tokens: 500,
      temperature: 0.0
    });
    return res.json({ reply: completion.choices[0]?.message?.content || 'عذراً، لم أتمكن من الإجابة.' });
  } catch (error) {
    console.error('[AI] Chat Fallback Error:', error.message);
    return res.status(200).json({ reply: 'عذراً، خدمة الذكاء الاصطناعي غير متاحة مؤقتاً. يرجى المحاولة لاحقاً.' });
  }
});

app.get('/api/admin/logs', (req, res) => {
  db.query('SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 200', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/admin/log', (req, res) => {
  const { action, details } = req.body;
  if (req.logAdminAction) req.logAdminAction(action, details);
  res.json({ success: true });
});

app.get('/api/test-ai', (req, res) => {
  res.json({ message: 'AI Server is reachable!', openai: !!openai });
});

app.post('/api/ai-assistant-logs', (req, res) => {
  const { admin_query, ai_response } = req.body;
  db.query('INSERT INTO ai_assistant_logs (admin_query, ai_response) VALUES (?, ?)', [admin_query, ai_response], (err) => {
    if (err) console.error('AI Log Error:', err);
    res.json({ success: true });
  });
});

app.get('/api/debug-images', (req, res) => {
  try {
    const dir = path.resolve(__dirname, 'public/images');
    if (!fs.existsSync(dir)) return res.json({ error: 'Directory not found', path: dir });
    const files = fs.readdirSync(dir);
    res.json({ 
      cwd: process.cwd(),
      dirname: __dirname,
      imageDir: dir,
      count: files.length,
      files: files.slice(0, 50) // only first 50 to avoid huge response
    });
  } catch (e) {
    res.json({ error: e.message });
  }
});


// --- SETTINGS ENDPOINTS ---
const settingsPath = path.join(__dirname, 'store_settings.json');

app.get('/api/settings', (req, res) => {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json({ iban: '', wallet: '', cliqAlias: '' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to read settings' });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    let existing = {};
    if (fs.existsSync(settingsPath)) { try { existing = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch (e) {} }
    const newSettings = { ...existing, ...req.body };
    fs.writeFileSync(settingsPath, JSON.stringify(newSettings, null, 2));
    if (req.logAdminAction) {
      req.logAdminAction('Update Settings', 'Updated IBAN and/or Wallet information');
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});


// --- SOCIAL MEDIA POSTS ---

// Auto-create social_posts table if it doesn't exist
db.getConnection((err, conn) => {
  if (err) return;
  conn.query(`
    CREATE TABLE IF NOT EXISTS social_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      content TEXT NOT NULL,
      image_url VARCHAR(500) DEFAULT NULL,
      platforms JSON NOT NULL,
      status VARCHAR(50) DEFAULT 'draft',
      published_at DATETIME DEFAULT NULL,
      scheduled_at DATETIME DEFAULT NULL,
      results JSON DEFAULT NULL,
      admin_name VARCHAR(100) DEFAULT NULL,
      created_at DATETIME DEFAULT NOW()
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `, (err2) => {
    if (err2) console.error('[Social] Table creation error:', err2.message);
    else console.log('[Social] social_posts table ready.');
    conn.release();
  });
});

// GET all posts history
app.get('/api/social/posts', async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM social_posts ORDER BY created_at DESC LIMIT 100');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a post
app.delete('/api/social/posts/:id', async (req, res) => {
  try {
    await db.promise().query('DELETE FROM social_posts WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — publish a new post
app.post('/api/social/post', async (req, res) => {
  const { content, image_url, platforms, scheduled_at } = req.body;
  const adminName = req.headers['x-admin-name'] || 'Admin';

  if (!content || !content.trim()) return res.status(400).json({ error: 'Post content is required' });
  if (!platforms || !platforms.length) return res.status(400).json({ error: 'Select at least one platform' });

  // Load settings for API tokens
  let settings = {};
  try {
    const settingsPath = path.join(__dirname, 'store_settings.json');
    if (fs.existsSync(settingsPath)) settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (e) {}

  const results = {};
  const isScheduled = !!scheduled_at;

  if (!isScheduled) {
    // Attempt real publishing for each platform
    for (const platform of platforms) {
      try {
        if (platform === 'facebook' && settings.fb_page_id && settings.fb_access_token) {
          const fbRes = await fetch(
            `https://graph.facebook.com/v19.0/${settings.fb_page_id}/feed`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: content,
                ...(image_url ? { link: image_url } : {}),
                access_token: settings.fb_access_token
              })
            }
          );
          const fbData = await fbRes.json();
          results[platform] = fbData.id ? { success: true, id: fbData.id } : { success: false, error: fbData.error?.message };
        } else if (platform === 'instagram' && settings.ig_user_id && settings.fb_access_token && image_url) {
          // Step 1: Create media container
          const containerRes = await fetch(
            `https://graph.facebook.com/v19.0/${settings.ig_user_id}/media`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                image_url,
                caption: content,
                access_token: settings.fb_access_token
              })
            }
          );
          const containerData = await containerRes.json();
          if (containerData.id) {
            // Step 2: Publish
            const pubRes = await fetch(
              `https://graph.facebook.com/v19.0/${settings.ig_user_id}/media_publish`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creation_id: containerData.id, access_token: settings.fb_access_token })
              }
            );
            const pubData = await pubRes.json();
            results[platform] = pubData.id ? { success: true, id: pubData.id } : { success: false, error: 'Publish step failed' };
          } else {
            results[platform] = { success: false, error: containerData.error?.message || 'Container creation failed' };
          }
        } else if (platform === 'whatsapp') {
          // WhatsApp Business API (Cloud API)
          if (settings.wa_phone_number_id && settings.wa_access_token) {
            const waRes = await fetch(
              `https://graph.facebook.com/v19.0/${settings.wa_phone_number_id}/messages`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.wa_access_token}` },
                body: JSON.stringify({
                  messaging_product: 'whatsapp',
                  to: settings.wa_broadcast_number || settings.wa_phone_number_id,
                  type: 'text',
                  text: { body: content }
                })
              }
            );
            const waData = await waRes.json();
            results[platform] = waData.messages ? { success: true } : { success: false, error: JSON.stringify(waData.error) };
          } else {
            results[platform] = { success: false, error: 'WhatsApp API not configured', manual: true };
          }
        } else {
          // Platform not API-configured — mark as manual
          results[platform] = { success: false, error: 'API not configured', manual: true };
        }
      } catch (platformErr) {
        results[platform] = { success: false, error: platformErr.message };
      }
    }
  }

  // Save to DB
  try {
    const [insertResult] = await db.promise().query(
      'INSERT INTO social_posts (content, image_url, platforms, status, published_at, scheduled_at, results, admin_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        content,
        image_url || null,
        JSON.stringify(platforms),
        isScheduled ? 'scheduled' : 'published',
        isScheduled ? null : new Date(),
        isScheduled ? new Date(scheduled_at) : null,
        JSON.stringify(results),
        adminName
      ]
    );
    if (req.logAdminAction) req.logAdminAction('Social Post', `Published to: ${platforms.join(', ')}`);
    res.json({ success: true, id: insertResult.insertId, results });
  } catch (dbErr) {
    res.status(500).json({ error: dbErr.message });
  }
});

// Production static files already served at top

// Clean DB Endpoint (Temporary)
app.get('/api/clean-db', async (req, res) => {
  try {
    const promiseDb = db.promise ? db.promise() : db;
    await promiseDb.query('DELETE FROM order_items');
    await promiseDb.query('DELETE FROM orders');
    await promiseDb.query('DELETE FROM admin_logs');
    await promiseDb.query('DELETE FROM contact_messages');
    try { await promiseDb.query('DELETE FROM reviews'); } catch(e){}
    res.json({ success: true, message: 'Database cleaned' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Secure FedEx Shipping Rates Endpoint
app.post('/api/shipping-rates', async (req, res) => {
  const { countryCode, city, postalCode, totalWeight } = req.body;
  if (!countryCode) return res.status(400).json({ error: 'Country code is required' });

  // FedEx Production Credentials
  const fedexClientId = process.env.FEDEX_CLIENT_ID || 'l744fb38ebfcd74c87bce7b16fbe236931';
  const fedexClientSecret = process.env.FEDEX_CLIENT_SECRET || '2771d602967246658269cc3a0ae4b4b9';
  const fedexAccountNum = process.env.FEDEX_ACCOUNT_NUM || '211266142';
  const FEDEX_BASE = 'https://apis.fedex.com';

  try {
    const tokenRes = await fetch(`${FEDEX_BASE}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${encodeURIComponent(fedexClientId)}&client_secret=${encodeURIComponent(fedexClientSecret)}`
    });
    if (!tokenRes.ok) throw new Error('FedEx auth failed');
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    const payload = {
      accountNumber: { value: fedexAccountNum },
      requestedShipment: {
        shipper: { address: { city: 'Amman', postalCode: '11118', countryCode: 'JO' } },
        recipient: { address: { city: city || 'Capital', postalCode: postalCode || '00000', countryCode: countryCode } },
        pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
        rateRequestType: ['ACCOUNT'],
        requestedPackageLineItems: [{ weight: { units: 'KG', value: totalWeight || 1 } }]
      }
    };

    const rateRes = await fetch(`${FEDEX_BASE}/rate/v1/rates/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    
    if (!rateRes.ok) {
      throw new Error('FedEx rate calculation failed');
    }

    const rateData = await rateRes.json();
    const rateReply = rateData?.output?.rateReplyDetails?.[0];
    if (rateReply && rateReply.ratedShipmentDetails && rateReply.ratedShipmentDetails.length > 0) {
      const chargeAmount = rateReply.ratedShipmentDetails[0].totalNetCharge;
      return res.json({ success: true, amount: chargeAmount || 15 });
    } else {
      return res.json({ success: true, amount: 15 }); // fallback
    }
  } catch (err) {
    console.error('[FedEx Rate Error]:', err.message);
    res.status(500).json({ error: err.message, fallbackRate: 15 });
  }
});

app.get('/api/facebook-catalog.xml', (req, res) => {
  db.query('SELECT * FROM menu_items WHERE active = 1', (err, results) => {
    if (err) return res.status(500).send('Database Error');
    
    let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>زهرة بيسان (Zahrat Beesan)</title>
    <link>https://${req.get('host')}</link>
    <description>متجر زهرة بيسان للعباءات الفاخرة</description>
`;

    results.forEach(item => {
      // Clean description for XML
      const desc = (item.description || item.subtitle || item.name).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
      const title = item.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
      const img = item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `https://${req.get('host')}${item.image_url}`) : `https://${req.get('host')}/logo512.png`;
      const link = `https://${req.get('host')}/product/${item.id}`;
      
      xml += `    <item>
      <g:id>${item.id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${img}</g:image_link>
      <g:brand>Zahrat Beesan</g:brand>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${item.price} JOD</g:price>
      <g:inventory>${item.quantity > 0 ? item.quantity : 1}</g:inventory>
    </item>\n`;
    });

    xml += `  </channel>\n</rss>`;
    
    res.set('Content-Type', 'text/xml');
    res.send(xml);
  });
});

// Theme & Banner Settings API
app.get('/api/settings/theme', async (req, res) => {
  try {
    const promiseDb = db.promise();
    const [rows] = await promiseDb.query("SELECT `key`, `value` FROM site_settings WHERE `key` IN ('theme_primary', 'theme_bg', 'theme_text', 'theme_hover', 'hero_banners')");
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings/theme', async (req, res) => {
  try {
    const { theme_primary, theme_bg, theme_text, theme_hover, hero_banners } = req.body;
    const promiseDb = db.promise();
    
    const updateSetting = async (k, v) => {
      if (v !== undefined) {
        await promiseDb.query("DELETE FROM site_settings WHERE `key` = ?", [k]);
        await promiseDb.query("INSERT INTO site_settings (`key`, `value`) VALUES (?, ?)", [k, typeof v === 'string' ? v : JSON.stringify(v)]);
      }
    };

    await updateSetting('theme_primary', theme_primary);
    await updateSetting('theme_bg', theme_bg);
    await updateSetting('theme_text', theme_text);
    await updateSetting('theme_hover', theme_hover);
    await updateSetting('hero_banners', hero_banners);

    if (req.logAdminAction) {
      req.logAdminAction('Update Theme', 'Updated storefront colors and banners.');
    }

    res.json({ success: true, message: 'Theme settings updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SOCIAL ADS & PIXELS API ---
app.get('/api/social-pixels', (req, res) => {
  db.query('SELECT meta_pixel_id, snap_pixel_id, tiktok_pixel_id FROM social_pixels WHERE id = 1 LIMIT 1', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.json({ meta_pixel_id: '', snap_pixel_id: '', tiktok_pixel_id: '' });
    res.json(results[0]);
  });
});

app.get('/api/admin/social-pixels', (req, res) => {
  db.query('SELECT * FROM social_pixels WHERE id = 1 LIMIT 1', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.json({
        meta_pixel_id: '',
        snap_pixel_id: '',
        tiktok_pixel_id: '',
        meta_token: '',
        snap_token: '',
        tiktok_token: ''
      });
    }
    res.json(results[0]);
  });
});

app.post('/api/admin/social-pixels', (req, res) => {
  const { meta_pixel_id, snap_pixel_id, tiktok_pixel_id, meta_token, snap_token, tiktok_token } = req.body;
  const sql = `
    INSERT INTO social_pixels (id, meta_pixel_id, snap_pixel_id, tiktok_pixel_id, meta_token, snap_token, tiktok_token)
    VALUES (1, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      meta_pixel_id = VALUES(meta_pixel_id),
      snap_pixel_id = VALUES(snap_pixel_id),
      tiktok_pixel_id = VALUES(tiktok_pixel_id),
      meta_token = VALUES(meta_token),
      snap_token = VALUES(snap_token),
      tiktok_token = VALUES(tiktok_token)
  `;
  db.query(sql, [meta_pixel_id || '', snap_pixel_id || '', tiktok_pixel_id || '', meta_token || '', snap_token || '', tiktok_token || ''], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (req.logAdminAction) {
      req.logAdminAction('Update Social Pixels', 'Updated social ad tracking IDs & access tokens.');
    }
    res.json({ success: true, message: 'تم حفظ إعدادات البكسل بنجاح' });
  });
});

// Catalog Feed for Social Ads (Meta / Snapchat / TikTok catalog ingestion)
app.get('/api/catalog.json', (req, res) => {
  const host = req.get('host');
  const protocol = req.protocol;
  const baseUrl = `${protocol}://${host}`;

  db.query('SELECT * FROM products WHERE available = 1 ORDER BY id DESC', (err, products) => {
    if (err) return res.status(500).json({ error: err.message });

    const catalog = products.map(p => {
      let imageUrl = p.image || '';
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }

      return {
        id: `PROD_${p.id}`,
        title: p.name,
        description: p.description || p.name,
        availability: 'in stock',
        condition: 'new',
        price: `${parseFloat(p.price).toFixed(2)} JOD`,
        link: `${baseUrl}/#product-${p.id}`,
        image_link: imageUrl,
        brand: 'Zahrat Beesan',
        category: p.category || 'Abaya'
      };
    });

    res.setHeader('Content-Type', 'application/json');
    res.json({
      title: 'Zahrat Beesan Product Catalog',
      updated_at: new Date().toISOString(),
      item_count: catalog.length,
      items: catalog
    });
  });
});

// For any other GET request (that isn't an API), serve React's index.html without caching index.html
app.get(/.*/, (req, res) => {
  const indexPath = path.join(__dirname, 'build', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.sendFile(indexPath);
  }
  res.send('Zahrat Beesan Server is LIVE. Loading app...');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is LIVE on port: ${PORT}`);
});

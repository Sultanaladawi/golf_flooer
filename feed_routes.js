const express = require('express');

module.exports = function registerFeedRoutes(app, db) {
  const promiseDb = db.promise ? db.promise() : db;

  // ─── 1. META / FACEBOOK XML FEED ─────────────────────────────
  // Standard Google Merchant / Facebook Catalog XML RSS 2.0
  app.get(['/api/feed/meta-catalog.xml', '/api/feed/facebook.xml'], async (req, res) => {
    try {
      const [products] = await promiseDb.query("SELECT * FROM menu_items WHERE available = 1 ORDER BY id DESC");
      const host = 'https://zahratbeesan.com';

      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Zahrat Beesan Couture - Instagram &amp; Facebook Shop Feed</title>
    <link>${host}</link>
    <description>Live automated product catalog feed for Meta Commerce (Instagram &amp; Facebook Shop)</description>
`;

      for (const p of products) {
        let mainImg = p.image_url || 'https://zahratbeesan.com/logo.png';
        if (p.images) {
          try {
            const parsed = JSON.parse(p.images);
            if (Array.isArray(parsed) && parsed.length > 0) mainImg = parsed[0];
          } catch (e) {}
        }
        if (!mainImg.startsWith('http')) {
          mainImg = `${host}${mainImg.startsWith('/') ? '' : '/'}${mainImg}`;
        }

        const productUrl = `${host}/product/${p.id}`;
        const rawDesc = (p.description || p.subtitle || 'عباية فاخرة وتصميم أنيق من زهرة بيسان كوتور').replace(/<[^>]*>?/gm, '');
        const price = `${Number(p.price_num || 50).toFixed(2)} JOD`;
        const availability = (p.stock_quantity === null || p.stock_quantity > 0) ? 'in stock' : 'out of stock';

        xml += `    <item>
      <g:id>${p.id}</g:id>
      <g:title><![CDATA[${p.name || 'عباية فاخرة'}]]></g:title>
      <g:description><![CDATA[${rawDesc}]]></g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${mainImg}</g:image_link>
      <g:brand>Zahrat Beesan Couture</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:google_product_category>Clothing &amp; Accessories &gt; Clothing &gt; Traditional &amp; Ceremonial Clothing</g:google_product_category>
    </item>\n`;
      }

      xml += `  </channel>
</rss>`;

      res.set('Content-Type', 'application/xml; charset=utf-8');
      res.send(xml);
    } catch (err) {
      console.error('[Meta Feed Error]:', err.message);
      res.status(500).send('Error generating Meta XML feed');
    }
  });

  // ─── 2. META / FACEBOOK CSV FEED ─────────────────────────────
  app.get('/api/feed/meta.csv', async (req, res) => {
    try {
      const [products] = await promiseDb.query("SELECT * FROM products ORDER BY id DESC");
      const host = req.protocol + '://' + (req.get('host') || 'zahratbeesan.com');

      let csv = 'id,title,description,availability,condition,price,link,image_link,brand,google_product_category,product_type\n';

      for (const p of products) {
        let parsedImages = [];
        try {
          parsedImages = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
        } catch (e) {
          parsedImages = p.images ? [p.images] : [];
        }

        let mainImg = parsedImages[0] || '/logo.png';
        if (!mainImg.startsWith('http')) {
          mainImg = `${host}${mainImg.startsWith('/') ? '' : '/'}${mainImg}`;
        }

        const productUrl = `${host}/product/${p.id}`;
        const title = `"${(p.name || 'عباية فاخرة').replace(/"/g, '""')}"`;
        const desc = `"${(p.description || 'عباية فاخرة وتصميم أنيق').replace(/"/g, '""')}"`;
        const price = `"${Number(p.price || 50).toFixed(2)} JOD"`;
        const availability = (p.stock > 0 || p.stock === null) ? 'in stock' : 'out of stock';
        const brand = '"Zahrat Beesan Couture"';
        const googleCat = '"Clothing & Accessories > Clothing > Traditional & Ceremonial Clothing"';
        const productType = `"${(p.category || 'عبايات').replace(/"/g, '""')}"`;

        csv += `${p.id},${title},${desc},${availability},new,${price},${productUrl},${mainImg},${brand},${googleCat},${productType}\n`;
      }

      res.set('Content-Type', 'text/csv; charset=utf-8');
      res.attachment('meta_products_feed.csv');
      res.send(csv);
    } catch (err) {
      res.status(500).send('Error generating Meta CSV feed');
    }
  });

  console.log('[Meta Feed Routes] Meta/Instagram Commerce Live Feeds registered at /api/feed/meta-catalog.xml & /api/feed/meta.csv');
};

// Real-Time Visitor, Cart, and Funnel Tracking Engine for Zahrat Beesan
const inMemorySessions = new Map();
const inMemoryActivity = [];

// Cleanup stale in-memory sessions every 2 minutes (older than 10 mins)
setInterval(() => {
  const now = Date.now();
  for (const [sId, sess] of inMemorySessions.entries()) {
    if (now - sess.lastActiveTime > 10 * 60 * 1000) {
      inMemorySessions.delete(sId);
    }
  }
  // Keep last 150 activities
  if (inMemoryActivity.length > 150) {
    inMemoryActivity.splice(150);
  }
}, 120000);

module.exports = function setupLiveTracker(app, db) {
  // Ensure tables exist
  if (db && typeof db.query === 'function') {
    db.query(`CREATE TABLE IF NOT EXISTS store_live_sessions (
      session_id VARCHAR(100) PRIMARY KEY,
      ip_address VARCHAR(100) DEFAULT '',
      user_agent VARCHAR(255) DEFAULT '',
      city VARCHAR(100) DEFAULT '',
      country VARCHAR(100) DEFAULT '',
      device_type VARCHAR(50) DEFAULT 'mobile',
      current_page VARCHAR(255) DEFAULT '/',
      page_title VARCHAR(255) DEFAULT '',
      customer_name VARCHAR(150) DEFAULT '',
      customer_phone VARCHAR(60) DEFAULT '',
      customer_email VARCHAR(255) DEFAULT '',
      cart_items JSON,
      cart_total DECIMAL(10,2) DEFAULT 0.00,
      stage VARCHAR(50) DEFAULT 'browsing',
      last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => {
      if (err) console.error('[Tracker DB Init Error]:', err.message);
    });

    db.query(`CREATE TABLE IF NOT EXISTS store_activity_feed (
      id INT AUTO_INCREMENT PRIMARY KEY,
      session_id VARCHAR(100),
      event_type VARCHAR(50),
      page VARCHAR(255),
      title VARCHAR(255),
      stage VARCHAR(50),
      customer_name VARCHAR(150) DEFAULT '',
      customer_phone VARCHAR(60) DEFAULT '',
      details JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`, (err) => {
      if (err) console.error('[Activity Feed DB Init Error]:', err.message);
    });
  }

  // 1. Ingest tracker events from clients
  app.post('/api/tracker/event', (req, res) => {
    try {
      const data = req.body || {};
      const sessionId = data.sessionId;
      if (!sessionId) return res.json({ success: false, reason: 'no_session_id' });

      const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';
      const now = Date.now();

      const customer = data.customer || {};
      const cartItems = Array.isArray(data.cartItems) ? data.cartItems : [];
      const cartTotal = parseFloat(data.cartTotal) || 0;
      
      let stage = data.stage || 'browsing';
      if (stage === 'browsing' && cartItems.length > 0) {
        stage = 'cart_filled';
      }

      // Memory session record
      const prevSession = inMemorySessions.get(sessionId) || {};
      const sessionRecord = {
        sessionId,
        ip: clientIp,
        userAgent,
        device: data.device || (userAgent.includes('Mobile') ? 'mobile' : 'desktop'),
        currentPage: data.page || prevSession.currentPage || '/',
        pageTitle: data.title || prevSession.pageTitle || 'متجر زهرة بيسان',
        customerName: customer.name || prevSession.customerName || '',
        customerPhone: customer.phone || prevSession.customerPhone || '',
        customerEmail: customer.email || prevSession.customerEmail || '',
        customerCity: customer.city || prevSession.customerCity || '',
        customerCountry: customer.country || prevSession.customerCountry || '',
        cartItems: cartItems.length > 0 ? cartItems : (prevSession.cartItems || []),
        cartTotal: cartTotal > 0 ? cartTotal : (prevSession.cartTotal || 0),
        stage: (stage === 'purchased' || prevSession.stage === 'purchased') ? 'purchased' : stage,
        firstSeen: prevSession.firstSeen || now,
        lastActiveTime: now
      };

      inMemorySessions.set(sessionId, sessionRecord);

      // Activity Feed entry
      let humanDesc = '';
      if (data.eventType === 'page_view') {
        const p = data.page || '/';
        if (p.includes('/product/')) humanDesc = `تصفح صفحة منتج: ${data.title || 'عباية'}`;
        else if (p === '/' || p === '/#collection') humanDesc = 'تصفح تشكيلة العبايات والكولكشن الملكي';
        else if (p.includes('/checkout')) humanDesc = 'دخل إلى صفحة إتمام الطلب والدفع';
        else if (p.includes('/cart')) humanDesc = 'فتح سلة المشتريات';
        else humanDesc = `تصفح الصفحة: ${data.page}`;
      } else if (data.eventType === 'cart_update') {
        const count = cartItems.length;
        const firstName = cartItems[0]?.name || 'عباية';
        humanDesc = `أضاف قطعة إلى السلة: ${firstName} ${count > 1 ? `(+${count - 1} قطع أخرى)` : ''}`;
      } else if (data.eventType === 'checkout_view') {
        humanDesc = 'وصل لصفحة إتمام الدفع وبدأ بتعبئة بيانات الشحن';
      } else if (data.eventType === 'payment_attempt') {
        humanDesc = `بدأ محاولة الدفع بواسطة (${data.paymentMethod || 'بطاقة بنكية / أبل باي'})`;
      } else if (data.eventType === 'order_placed') {
        humanDesc = `🎉 أكمل الشراء والطلب بنجاح! الإجمالي: ${cartTotal} د.أ`;
      }

      if (humanDesc) {
        inMemoryActivity.unshift({
          id: 'act_' + now + '_' + Math.random().toString(36).substr(2, 4),
          sessionId,
          eventType: data.eventType,
          description: humanDesc,
          page: data.page,
          customerName: sessionRecord.customerName,
          customerPhone: sessionRecord.customerPhone,
          cartTotal: sessionRecord.cartTotal,
          stage: sessionRecord.stage,
          device: sessionRecord.device,
          time: new Date().toISOString()
        });
      }

      // Asynchronously update MySQL database if configured
      if (db && typeof db.query === 'function') {
        const sql = `INSERT INTO store_live_sessions 
          (session_id, ip_address, user_agent, device_type, current_page, page_title, customer_name, customer_phone, customer_email, cart_items, cart_total, stage, last_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
          current_page = VALUES(current_page),
          page_title = VALUES(page_title),
          customer_name = IF(VALUES(customer_name) != '', VALUES(customer_name), customer_name),
          customer_phone = IF(VALUES(customer_phone) != '', VALUES(customer_phone), customer_phone),
          customer_email = IF(VALUES(customer_email) != '', VALUES(customer_email), customer_email),
          cart_items = IF(VALUES(cart_items) IS NOT NULL, VALUES(cart_items), cart_items),
          cart_total = IF(VALUES(cart_total) > 0, VALUES(cart_total), cart_total),
          stage = VALUES(stage),
          last_active = NOW()`;

        db.query(sql, [
          sessionId,
          clientIp,
          userAgent.substring(0, 255),
          sessionRecord.device,
          sessionRecord.currentPage.substring(0, 255),
          sessionRecord.pageTitle.substring(0, 255),
          sessionRecord.customerName,
          sessionRecord.customerPhone,
          sessionRecord.customerEmail,
          sessionRecord.cartItems ? JSON.stringify(sessionRecord.cartItems) : null,
          sessionRecord.cartTotal,
          sessionRecord.stage
        ], (err) => {
          if (err) console.error('[Tracker DB Upsert Error]:', err.message);
        });

        // Also sync abandoned_carts table if there is customer phone/email + items
        if ((sessionRecord.customerPhone || sessionRecord.customerEmail) && sessionRecord.cartItems && sessionRecord.cartItems.length > 0 && sessionRecord.stage !== 'purchased') {
          db.query("SELECT id FROM abandoned_carts WHERE (phone = ? OR email = ?) AND status = 'pending'", [sessionRecord.customerPhone || '', sessionRecord.customerEmail || ''], (err, resA) => {
            if (!err && resA && resA.length > 0) {
              db.query("UPDATE abandoned_carts SET cart_items = ?, total_price = ?, updated_at = NOW() WHERE id = ?", [JSON.stringify(sessionRecord.cartItems), sessionRecord.cartTotal, resA[0].id]);
            } else if (!err) {
              db.query("INSERT INTO abandoned_carts (email, phone, cart_items, total_price) VALUES (?, ?, ?, ?)", [sessionRecord.customerEmail || '', sessionRecord.customerPhone || '', JSON.stringify(sessionRecord.cartItems), sessionRecord.cartTotal]);
            }
          });
        }
      }

      res.json({ success: true });
    } catch (err) {
      console.error('[Tracker Event Handler Error]:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Admin Live Radar & Funnel API
  app.get('/api/admin/live-radar', (req, res) => {
    try {
      const now = Date.now();
      const activeThreshold = 4 * 60 * 1000; // active in last 4 mins
      
      const allSessions = Array.from(inMemorySessions.values());
      const activeVisitors = allSessions.filter(s => (now - s.lastActiveTime) <= activeThreshold);

      // Funnel metrics
      let bouncedCount = 0;
      let cartFilledCount = 0;
      let checkoutReachedCount = 0;
      let purchasedCount = 0;

      allSessions.forEach(s => {
        if (s.stage === 'purchased') {
          purchasedCount++;
        } else if (s.stage === 'checkout_step' || s.stage === 'payment_attempt' || s.currentPage?.includes('/checkout')) {
          checkoutReachedCount++;
        } else if (s.stage === 'cart_filled' || (s.cartItems && s.cartItems.length > 0)) {
          cartFilledCount++;
        } else {
          bouncedCount++;
        }
      });

      // Group sessions with carts
      const sessionsWithCarts = allSessions
        .filter(s => s.cartItems && s.cartItems.length > 0)
        .map(s => ({
          sessionId: s.sessionId,
          customerName: s.customerName || 'عميلة زائرة',
          customerPhone: s.customerPhone || '',
          customerEmail: s.customerEmail || '',
          customerCity: s.customerCity || '',
          customerCountry: s.customerCountry || '',
          stage: s.stage,
          cartItems: s.cartItems,
          cartTotal: s.cartTotal,
          currentPage: s.currentPage,
          device: s.device,
          isOnline: (now - s.lastActiveTime) <= activeThreshold,
          lastActiveAgoSec: Math.round((now - s.lastActiveTime) / 1000),
          lastActive: new Date(s.lastActiveTime).toISOString()
        }))
        .sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0) || b.cartTotal - a.cartTotal);

      // Real-time visitor items
      const onlineVisitorsList = activeVisitors.map(s => ({
        sessionId: s.sessionId,
        page: s.currentPage,
        pageTitle: s.pageTitle,
        stage: s.stage,
        device: s.device,
        customerName: s.customerName || 'زائرة غير مسجلة',
        customerPhone: s.customerPhone || '',
        cartItemsCount: (s.cartItems && s.cartItems.length) || 0,
        cartTotal: s.cartTotal || 0,
        cartItems: s.cartItems || [],
        idleSeconds: Math.round((now - s.lastActiveTime) / 1000)
      }));

      res.json({
        success: true,
        activeNow: activeVisitors.length,
        totalSessionsToday: allSessions.length,
        funnel: {
          totalVisitors: allSessions.length,
          bouncedCount,
          cartFilledCount,
          checkoutReachedCount,
          purchasedCount,
          bouncedRate: allSessions.length > 0 ? Math.round((bouncedCount / allSessions.length) * 100) : 0,
          cartConversionRate: allSessions.length > 0 ? Math.round((cartFilledCount / allSessions.length) * 100) : 0,
          checkoutRate: allSessions.length > 0 ? Math.round((checkoutReachedCount / allSessions.length) * 100) : 0,
          purchaseRate: allSessions.length > 0 ? Math.round((purchasedCount / allSessions.length) * 100) : 0
        },
        onlineVisitors: onlineVisitorsList,
        sessionsWithCarts,
        recentActivity: inMemoryActivity.slice(0, 30)
      });
    } catch (err) {
      console.error('[Live Radar API Error]:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });
};

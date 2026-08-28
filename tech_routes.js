const express = require('express');

module.exports = function registerTechRoutes(app, db) {
  const promiseDb = db.promise ? db.promise() : db;

  // ─── 1. INITIALIZE TECH DATABASE TABLES ──────────────────────
  const initSql = `
    CREATE TABLE IF NOT EXISTS tech_leads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(100) NOT NULL,
      email VARCHAR(255) DEFAULT '',
      company VARCHAR(255) DEFAULT '',
      service VARCHAR(255) DEFAULT '',
      budget VARCHAR(100) DEFAULT '',
      details TEXT,
      estimated_quote VARCHAR(100) DEFAULT '',
      calculator_details TEXT,
      status VARCHAR(50) DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS tech_projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      lead_id INT NULL,
      client_name VARCHAR(255) NOT NULL,
      client_phone VARCHAR(100) NOT NULL,
      client_email VARCHAR(255) DEFAULT '',
      company VARCHAR(255) DEFAULT '',
      project_title VARCHAR(255) NOT NULL,
      service_type VARCHAR(100) DEFAULT 'ecommerce',
      stage VARCHAR(50) DEFAULT 'in_development',
      total_price DECIMAL(10,2) DEFAULT 0.00,
      deposit_paid DECIMAL(10,2) DEFAULT 0.00,
      mid_payment DECIMAL(10,2) DEFAULT 0.00,
      final_payment DECIMAL(10,2) DEFAULT 0.00,
      payment_status VARCHAR(50) DEFAULT 'partial',
      domain_name VARCHAR(255) DEFAULT '',
      domain_expires_at DATE NULL,
      hosting_plan VARCHAR(100) DEFAULT '',
      hosting_expires_at DATE NULL,
      repo_url VARCHAR(500) DEFAULT '',
      live_url VARCHAR(500) DEFAULT '',
      admin_panel_url VARCHAR(500) DEFAULT '',
      warranty_ends_at DATE NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS tech_quotations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      quote_number VARCHAR(50) UNIQUE NOT NULL,
      client_name VARCHAR(255) NOT NULL,
      client_phone VARCHAR(100) NOT NULL,
      client_email VARCHAR(255) DEFAULT '',
      company VARCHAR(255) DEFAULT '',
      project_title VARCHAR(255) NOT NULL,
      service_type VARCHAR(100) DEFAULT 'ecommerce',
      scope_items JSON,
      total_amount DECIMAL(10,2) DEFAULT 0.00,
      discount_amount DECIMAL(10,2) DEFAULT 0.00,
      final_amount DECIMAL(10,2) DEFAULT 0.00,
      payment_terms TEXT,
      timeline_days VARCHAR(100) DEFAULT '7 - 14 يوم عمل',
      warranty_months INT DEFAULT 12,
      status VARCHAR(50) DEFAULT 'sent',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  // Run creation queries and optional seed
  db.query(initSql, (err) => {
    if (err) {
      console.error('[Tech Routes] Table init error (non-fatal):', err.message);
    } else {
      console.log('[Tech Routes] Tech Agency DB tables verified.');
      seedDefaultData();
    }
  });

  async function seedDefaultData() {
    try {
      const [[projCount]] = await promiseDb.query("SELECT COUNT(*) as c FROM tech_projects");
      if (projCount.c === 0) {
        await promiseDb.query(`
          INSERT INTO tech_projects (client_name, client_phone, client_email, company, project_title, service_type, stage, total_price, deposit_paid, mid_payment, final_payment, payment_status, domain_name, domain_expires_at, hosting_plan, hosting_expires_at, live_url, warranty_ends_at, notes)
          VALUES 
          ('م. رائد النابلسي', '0795551234', 'raed@nabulsi.jo', 'شركة النابلسي للتطوير العقاري', 'منصة العقارات والفلل الفاخرة مع جولات 360°', 'custom', 'in_development', 1450.00, 725.00, 0.00, 0.00, 'partial', 'nabulsi-estates.com', DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'Azure Business Cloud (35 د.أ)', DATE_ADD(CURDATE(), INTERVAL 18 DAY), 'https://nabulsi-estates.com', DATE_ADD(CURDATE(), INTERVAL 365 DAY), 'مشروع منصة عقارات فاخرة مع دمج خريطة تفاعلية وحاسبة أقساط.'),
          ('مجموعة المشرق الاستثمارية', '0788884321', 'info@mashreq.jo', 'المشرق القابضة', 'بوابة الـ ERP المركزية وإدارة سلاسل التوريد', 'erp', 'qa_testing', 2800.00, 1400.00, 700.00, 0.00, 'partial', 'mashreq-group.jo', DATE_ADD(CURDATE(), INTERVAL 280 DAY), 'AWS Dedicated Enterprise (75 د.أ)', DATE_ADD(CURDATE(), INTERVAL 280 DAY), 'https://erp.mashreq-group.jo', DATE_ADD(CURDATE(), INTERVAL 300 DAY), 'ربط 4 مستودعات رئيسية مع الفواتير الضريبية الإلكترونية QR.'),
          ('د. سامر الصالحي', '0799998877', 'dr.samer@salhiclinic.com', 'مجمع الصالحي الطبي', 'تطبيق وموقع حجز العيادات الطبية والملف الصحي', 'mobile', 'completed', 950.00, 475.00, 0.00, 475.00, 'paid', 'salhi-clinic.com', DATE_ADD(CURDATE(), INTERVAL 310 DAY), 'Cloud Speed NVMe (19 د.أ)', DATE_ADD(CURDATE(), INTERVAL 310 DAY), 'https://salhi-clinic.com', DATE_ADD(CURDATE(), INTERVAL 240 DAY), 'تم تسليم التطبيق على متجر App Store و Google Play بنجاح.'),
          ('السيد طارق حداد', '0777123456', 'tariq@hadadauto.com', 'معرض حداد لتأجير السيارات الفاخرة', 'منصة تأجير السيارات مع تتبع GPS والعقود الرقمية', 'ecommerce', 'proposal_sent', 1200.00, 0.00, 0.00, 0.00, 'unpaid', 'hadad-rentals.jo', NULL, 'Azure Cloud (35 د.أ)', NULL, '', NULL, 'بانتظار توقيع العقد النهائي واستلام الدفعة الأولى 50%.')
        `);
        console.log('[Tech Routes] Seeded sample tech projects.');
      }

      const [[quoteCount]] = await promiseDb.query("SELECT COUNT(*) as c FROM tech_quotations");
      if (quoteCount.c === 0) {
        await promiseDb.query(`
          INSERT INTO tech_quotations (quote_number, client_name, client_phone, client_email, company, project_title, service_type, scope_items, total_amount, discount_amount, final_amount, payment_terms, timeline_days, warranty_months, status, notes)
          VALUES 
          ('ZB-Q-2026-1042', 'شركة الأفق للتجارة العامة', '0795559988', 'ceo@alofooq.jo', 'الأفق للتجارة', 'تطوير متجر إلكتروني فاخر B2B & B2C مع ربط CliQ والمخازن', 'ecommerce', 
           '[{\"title\":\"تصميم متجر ويب وتطبيق جوال فخم\",\"desc\":\"واجهات سريعة متجاوبة مع سلة ذكية وشراء سريع\",\"price\":650},{\"title\":\"تكامل بوابات الدفع (CliQ, Visa, Tamara)\",\"desc\":\"دفع إلكتروني آمن مع فواتير QR آلية\",\"price\":250},{\"title\":\"لوحة تحكم ERP سحابية متعددة الفروع\",\"desc\":\"إدارة المخزون والموردين والمحاسبة\",\"price\":350}]', 
           1250.00, 150.00, 1100.00, '50% دفعة أولى عند توقيع العقد، 25% عند اكتمال التصميم، 25% عند التسليم والتشغيل.', '10 - 14 يوم عمل', 12, 'sent', 'عرض سعر رسمي يشمل الاستضافة السحابية للسنة الأولى مجاناً.'),
          ('ZB-Q-2026-1088', 'مكتب المحامي مروان الكردي', '0787776655', 'marwan@kurdi-law.jo', 'الكردي للمحاماة', 'منصة الاستشارات القانونية وحجز المواعيد السرية', 'custom', 
           '[{\"title\":\"بوابة الموكلين واستشارات الفيديو المشفرة\",\"desc\":\"حجز ودفع الاستشارات وتشفير المستندات 256-bit\",\"price\":550},{\"title\":\"نظام أرشفة القضايا وجلسات المحاكم\",\"desc\":\"إشعارات SMS وتنبيهات مواعيد الجلسات\",\"price\":300}]', 
           850.00, 100.00, 750.00, '50% دفعة أولى، 50% عند التسليم النهائي.', '7 - 10 أيام عمل', 12, 'accepted', 'تمت الموافقة من قبل العميل وجاري صياغة الاتفاقية.')
        `);
        console.log('[Tech Routes] Seeded sample tech quotations.');
      }
    } catch (e) {
      console.log('[Tech Routes] Seed check error (ignorable):', e.message);
    }
  }

  // ─── 2. TECH STATS & KPI AGGREGATION ─────────────────────────
  app.get('/api/admin/tech-stats', async (req, res) => {
    try {
      const [[leadsCount]] = await promiseDb.query("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_leads FROM tech_leads");
      const [[projectsCount]] = await promiseDb.query("SELECT COUNT(*) as total, SUM(CASE WHEN stage != 'completed' THEN 1 ELSE 0 END) as active_projects, SUM(total_price) as total_val, SUM(deposit_paid + mid_payment + final_payment) as total_collected FROM tech_projects");
      const [[quotesCount]] = await promiseDb.query("SELECT COUNT(*) as total, SUM(final_amount) as total_quoted FROM tech_quotations");
      
      // Domains/Hosting expiring in next 45 days
      const [expiringDomains] = await promiseDb.query(`
        SELECT id, client_name, client_phone, project_title, domain_name, domain_expires_at, hosting_plan, hosting_expires_at,
               DATEDIFF(domain_expires_at, CURDATE()) as domain_days_left
        FROM tech_projects 
        WHERE (domain_expires_at IS NOT NULL AND domain_expires_at <= DATE_ADD(CURDATE(), INTERVAL 45 DAY))
           OR (hosting_expires_at IS NOT NULL AND hosting_expires_at <= DATE_ADD(CURDATE(), INTERVAL 45 DAY))
        ORDER BY domain_expires_at ASC
      `);

      res.json({
        leadsTotal: leadsCount?.total || 0,
        leadsNew: leadsCount?.new_leads || 0,
        projectsTotal: projectsCount?.total || 0,
        projectsActive: projectsCount?.active_projects || 0,
        totalPipelineValue: projectsCount?.total_val || 0,
        totalCollectedRevenue: projectsCount?.total_collected || 0,
        quotesTotal: quotesCount?.total || 0,
        quotesValue: quotesCount?.total_quoted || 0,
        expiringCount: expiringDomains.length,
        expiringList: expiringDomains
      });
    } catch (err) {
      console.error('[Tech Stats Error]:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // ─── 3. TECH PROJECTS CRUD (KANBAN, PAYMENTS & SERVERS) ──────
  app.get('/api/admin/tech-projects', async (req, res) => {
    try {
      const [rows] = await promiseDb.query(`
        SELECT *,
          (total_price - (deposit_paid + mid_payment + final_payment)) AS remaining_balance,
          DATEDIFF(domain_expires_at, CURDATE()) AS domain_days_left,
          DATEDIFF(hosting_expires_at, CURDATE()) AS hosting_days_left,
          DATEDIFF(warranty_ends_at, CURDATE()) AS warranty_days_left
        FROM tech_projects 
        ORDER BY id DESC
      `);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/tech-projects', async (req, res) => {
    try {
      const {
        lead_id, client_name, client_phone, client_email, company,
        project_title, service_type, stage, total_price, deposit_paid,
        mid_payment, final_payment, payment_status, domain_name,
        domain_expires_at, hosting_plan, hosting_expires_at, repo_url,
        live_url, admin_panel_url, warranty_ends_at, notes
      } = req.body;

      if (!client_name || !client_phone || !project_title) {
        return res.status(400).json({ error: 'Client name, phone and project title are required' });
      }

      const [result] = await promiseDb.query(`
        INSERT INTO tech_projects (
          lead_id, client_name, client_phone, client_email, company,
          project_title, service_type, stage, total_price, deposit_paid,
          mid_payment, final_payment, payment_status, domain_name,
          domain_expires_at, hosting_plan, hosting_expires_at, repo_url,
          live_url, admin_panel_url, warranty_ends_at, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        lead_id || null, client_name, client_phone, client_email || '', company || '',
        project_title, service_type || 'ecommerce', stage || 'in_development',
        total_price || 0, deposit_paid || 0, mid_payment || 0, final_payment || 0,
        payment_status || 'partial', domain_name || '', domain_expires_at || null,
        hosting_plan || '', hosting_expires_at || null, repo_url || '', live_url || '',
        admin_panel_url || '', warranty_ends_at || null, notes || ''
      ]);

      res.json({ success: true, id: result.insertId, message: 'Project created successfully' });
    } catch (err) {
      console.error('[Tech Project Insert Error]:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/admin/tech-projects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        client_name, client_phone, client_email, company,
        project_title, service_type, stage, total_price, deposit_paid,
        mid_payment, final_payment, payment_status, domain_name,
        domain_expires_at, hosting_plan, hosting_expires_at, repo_url,
        live_url, admin_panel_url, warranty_ends_at, notes
      } = req.body;

      await promiseDb.query(`
        UPDATE tech_projects SET
          client_name = COALESCE(?, client_name),
          client_phone = COALESCE(?, client_phone),
          client_email = COALESCE(?, client_email),
          company = COALESCE(?, company),
          project_title = COALESCE(?, project_title),
          service_type = COALESCE(?, service_type),
          stage = COALESCE(?, stage),
          total_price = COALESCE(?, total_price),
          deposit_paid = COALESCE(?, deposit_paid),
          mid_payment = COALESCE(?, mid_payment),
          final_payment = COALESCE(?, final_payment),
          payment_status = COALESCE(?, payment_status),
          domain_name = COALESCE(?, domain_name),
          domain_expires_at = ?,
          hosting_plan = COALESCE(?, hosting_plan),
          hosting_expires_at = ?,
          repo_url = COALESCE(?, repo_url),
          live_url = COALESCE(?, live_url),
          admin_panel_url = COALESCE(?, admin_panel_url),
          warranty_ends_at = ?,
          notes = COALESCE(?, notes)
        WHERE id = ?
      `, [
        client_name, client_phone, client_email, company,
        project_title, service_type, stage, total_price, deposit_paid,
        mid_payment, final_payment, payment_status, domain_name,
        domain_expires_at || null, hosting_plan, hosting_expires_at || null, repo_url,
        live_url, admin_panel_url, warranty_ends_at || null, notes, id
      ]);

      res.json({ success: true, message: 'Project updated' });
    } catch (err) {
      console.error('[Tech Project Update Error]:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/tech-projects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await promiseDb.query('DELETE FROM tech_projects WHERE id = ?', [id]);
      res.json({ success: true, message: 'Project deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── 4. TECH QUOTATIONS & PROPOSALS CRUD ─────────────────────
  app.get('/api/admin/tech-quotations', async (req, res) => {
    try {
      const [rows] = await promiseDb.query('SELECT * FROM tech_quotations ORDER BY id DESC');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/admin/tech-quotations', async (req, res) => {
    try {
      const {
        client_name, client_phone, client_email, company,
        project_title, service_type, scope_items, total_amount,
        discount_amount, final_amount, payment_terms, timeline_days,
        warranty_months, status, notes
      } = req.body;

      if (!client_name || !client_phone || !project_title) {
        return res.status(400).json({ error: 'Client name, phone and project title are required' });
      }

      // Auto generate quotation number: ZB-Q-YYYY-XXXX
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const quote_number = `ZB-Q-${year}-${randomSuffix}`;

      const [result] = await promiseDb.query(`
        INSERT INTO tech_quotations (
          quote_number, client_name, client_phone, client_email, company,
          project_title, service_type, scope_items, total_amount,
          discount_amount, final_amount, payment_terms, timeline_days,
          warranty_months, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        quote_number, client_name, client_phone, client_email || '', company || '',
        project_title, service_type || 'ecommerce', JSON.stringify(scope_items || []),
        total_amount || 0, discount_amount || 0, final_amount || total_amount || 0,
        payment_terms || '50% دفعة أولى عند توقيع العقد، 25% عند اكتمال التصميم، 25% عند التسليم النهائي والتشغيل.',
        timeline_days || '7 - 14 يوم عمل', warranty_months || 12, status || 'sent', notes || ''
      ]);

      res.json({ success: true, id: result.insertId, quote_number, message: 'Quotation generated successfully' });
    } catch (err) {
      console.error('[Tech Quotation Insert Error]:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/admin/tech-quotations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, final_amount, notes } = req.body;
      await promiseDb.query(`
        UPDATE tech_quotations SET
          status = COALESCE(?, status),
          final_amount = COALESCE(?, final_amount),
          notes = COALESCE(?, notes)
        WHERE id = ?
      `, [status, final_amount, notes, id]);
      res.json({ success: true, message: 'Quotation updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/admin/tech-quotations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await promiseDb.query('DELETE FROM tech_quotations WHERE id = ?', [id]);
      res.json({ success: true, message: 'Quotation deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  console.log('[Tech Agency Backend] All 4 Tech modules routes registered.');
};

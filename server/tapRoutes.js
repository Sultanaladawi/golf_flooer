/**
 * Tap Payments Routes
 * This file is required by the main server to register Tap payment endpoints.
 * Importing it AFTER the main server is set up ensures routes are registered correctly.
 */

module.exports = function registerTapRoutes(app) {
  const TAP_SECRET_KEY = process.env.TAP_SECRET_KEY || Buffer.from('c2tfdGVzdF95MmtoRElYcVlnQVE0OGQzZTU2Vk50b1I=', 'base64').toString('utf8');

  app.post('/api/tap/create-charge', async (req, res) => {
    try {
      const { amount, currency, customer, orderId, orderItems, metadata, redirectUrl } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      const cleanPhone = (customer?.phone || '').replace(/[^0-9]/g, '') || '796697413';
      const countryCode = cleanPhone.startsWith('962') ? '962' : (cleanPhone.startsWith('966') ? '966' : '962');
      const localPhone = cleanPhone.replace(/^962|^966/, '') || cleanPhone;
      const nameParts = (customer?.name || 'Valued Customer').trim().split(' ');
      const firstName = nameParts[0] || 'Valued';
      const lastName = nameParts.slice(1).join(' ') || 'Customer';

      const defaultRedirect = `${req.protocol}://${req.get('host')}/checkout`;
      const finalRedirectUrl = redirectUrl || defaultRedirect;

      const chargePayload = {
        amount: parseFloat(amount),
        currency: currency || 'JOD',
        threeDSecure: true,
        save_card: false,
        description: `Order from Zahrat Beesan #${orderId || 'New'}`,
        statement_descriptor: 'Zahrat Beesan',
        metadata: { orderId: String(orderId || ''), customerName: customer?.name || '', ...(metadata || {}) },
        customer: {
          first_name: firstName,
          last_name: lastName,
          email: (customer?.email && customer.email.includes('@')) ? customer.email : 'zahratbeesanshop@gmail.com',
          phone: { country_code: countryCode, number: localPhone }
        },
        source: { id: 'src_all' },
        redirect: { url: finalRedirectUrl }
      };

      const postData = JSON.stringify(chargePayload);
      const https = require('https');
      const tapReq = https.request({
        hostname: 'api.tap.company',
        path: '/v2/charges',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TAP_SECRET_KEY}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (tapRes) => {
        let body = '';
        tapRes.on('data', chunk => body += chunk);
        tapRes.on('end', () => {
          try {
            const json = JSON.parse(body);
            if (tapRes.statusCode >= 200 && tapRes.statusCode < 300 && json.transaction && json.transaction.url) {
              console.log(`[Tap Payments] Charge created: ${json.id}`);
              res.json({ success: true, chargeId: json.id, redirectUrl: json.transaction.url });
            } else {
              console.error('[Tap Payments Error]:', json);
              res.status(tapRes.statusCode || 400).json({
                error: (json.errors && json.errors[0] && json.errors[0].description) || json.message || 'Failed to create Tap charge'
              });
            }
          } catch(e) {
            res.status(500).json({ error: 'Invalid response from Tap Payments' });
          }
        });
      });
      tapReq.on('error', (e) => {
        console.error('[Tap Request Error]:', e.message);
        res.status(500).json({ error: e.message });
      });
      tapReq.write(postData);
      tapReq.end();
    } catch (err) {
      console.error('[Tap Charge Error]:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/tap/verify-charge/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const https = require('https');
      const tapReq = https.request({
        hostname: 'api.tap.company',
        path: `/v2/charges/${id}`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${TAP_SECRET_KEY}` }
      }, (tapRes) => {
        let body = '';
        tapRes.on('data', chunk => body += chunk);
        tapRes.on('end', () => {
          try {
            const json = JSON.parse(body);
            res.json({ success: json.status === 'CAPTURED', status: json.status, charge: json });
          } catch(e) {
            res.status(500).json({ error: 'Invalid response' });
          }
        });
      });
      tapReq.on('error', (e) => res.status(500).json({ error: e.message }));
      tapReq.end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  console.log('[Tap Payments] Routes registered: POST /api/tap/create-charge, GET /api/tap/verify-charge/:id');
};

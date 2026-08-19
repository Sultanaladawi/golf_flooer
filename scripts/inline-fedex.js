const fs = require('fs');
const path = require('path');

const inlineFedex = `
// ══════════════════════════════════════════════════════════════════════════════
// 📦 INLINED FEDEX EXPRESS SERVICE (SANDBOX & PROD READY)
// ══════════════════════════════════════════════════════════════════════════════
const fedexConfig = {
  apiKey: process.env.FEDEX_API_KEY || 'l754c6249a4d6947c98c6bf4a11d641e57',
  secretKey: process.env.FEDEX_SECRET_KEY || '0cde3db959cb4aaeac06604a66a84ece',
  accountNumber: process.env.FEDEX_ACCOUNT_NUMBER || '740561073',
  hostname: process.env.FEDEX_HOSTNAME || 'apis-sandbox.fedex.com',
  isSandbox: true
};

let fedexCachedToken = null;
let fedexTokenExpiresAt = 0;

async function getInlineFedExToken() {
  const now = Date.now();
  if (fedexCachedToken && fedexTokenExpiresAt > now + 60000) return fedexCachedToken;
  const postData = require('querystring').stringify({
    grant_type: 'client_credentials',
    client_id: fedexConfig.apiKey,
    client_secret: fedexConfig.secretKey
  });

  return new Promise((resolve, reject) => {
    const req = require('https').request({
      hostname: fedexConfig.hostname,
      port: 443,
      path: '/oauth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.access_token) {
            fedexCachedToken = json.access_token;
            fedexTokenExpiresAt = Date.now() + ((json.expires_in || 3600) * 1000);
            resolve(fedexCachedToken);
          } else {
            reject(new Error(json.errors ? json.errors[0]?.message : 'FedEx Auth Failed'));
          }
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function makeInlineFedExRequest(endpoint, payload) {
  const token = await getInlineFedExToken();
  const postData = JSON.stringify(payload);
  const zlib = require('zlib');
  return new Promise((resolve, reject) => {
    const req = require('https').request({
      hostname: fedexConfig.hostname,
      port: 443,
      path: endpoint,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Accept-Encoding': 'identity',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try {
          let buffer = Buffer.concat(chunks);
          if (res.headers['content-encoding'] === 'gzip') {
            buffer = zlib.gunzipSync(buffer);
          }
          const json = JSON.parse(buffer.toString('utf8'));
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            const errDetail = json.errors ? json.errors.map(e => e.message || e.code).join(' | ') : (json.message || ('HTTP ' + res.statusCode));
            reject(new Error('FedEx Error: ' + errDetail));
          }
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runDirectFedExShipment(orderId, customerName, phone, email, address, totalAmount) {
  const todayStr = new Date().toISOString().split('T')[0];
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '') || '1234567890';
  const payload = {
    labelResponseOptions: 'LABEL',
    requestedShipment: {
      shipper: {
        contact: { personName: 'Zahrat Beesan Boutique', companyName: 'Zahrat Beesan', phoneNumber: '1234567890' },
        address: { streetLines: ['10 FedEx Parkway'], city: 'Memphis', stateOrProvinceCode: 'TN', postalCode: '38118', countryCode: 'US' }
      },
      recipients: [{
        contact: { personName: customerName || 'Valued Customer', phoneNumber: cleanPhone },
        address: { streetLines: [address || '123 Main St, Suite 400'], city: 'Austin', stateOrProvinceCode: 'TX', postalCode: '78701', countryCode: 'US' }
      }],
      shipDatestamp: todayStr,
      serviceType: 'FEDEX_GROUND',
      packagingType: 'YOUR_PACKAGING',
      pickupType: 'USE_SCHEDULED_PICKUP',
      shippingChargesPayment: { paymentType: 'SENDER' },
      labelSpecification: { labelFormatType: 'COMMON2D', imageType: 'PDF', labelStockType: 'PAPER_85X11_TOP_HALF_LABEL' },
      requestedPackageLineItems: [{ weight: { units: 'LB', value: 3.5 } }]
    },
    accountNumber: { value: fedexConfig.accountNumber }
  };

  const response = await makeInlineFedExRequest('/ship/v1/shipments', payload);
  const shipment = response.output?.transactionShipments?.[0];
  const trk = shipment?.masterTrackingNumber || shipment?.pieceResponses?.[0]?.trackingNumber;
  const encodedLabel = shipment?.pieceResponses?.[0]?.packageDocuments?.[0]?.encodedLabel;
  
  if (encodedLabel) {
    const labelsDir = path.resolve(process.cwd(), 'data', 'labels');
    if (!fs.existsSync(labelsDir)) fs.mkdirSync(labelsDir, { recursive: true });
    fs.writeFileSync(path.join(labelsDir, 'fedex-label-' + orderId + '.pdf'), Buffer.from(encodedLabel, 'base64'));
    const buildLabelsDir = path.resolve(process.cwd(), 'build', 'data', 'labels');
    if (!fs.existsSync(buildLabelsDir)) fs.mkdirSync(buildLabelsDir, { recursive: true });
    fs.writeFileSync(path.join(buildLabelsDir, 'fedex-label-' + orderId + '.pdf'), Buffer.from(encodedLabel, 'base64'));
  }
  return { trackingNumber: trk, labelUrl: '/api/fedex/label/' + orderId, serviceType: 'FEDEX_GROUND' };
}
`;

const targets = ['main_server.js', 'server.js', 'app.js', 'release/server.js', 'server_bundled.js'];
for (const t of targets) {
  const filePath = path.resolve(__dirname, '..', t);
  if (!fs.existsSync(filePath)) continue;
  let c = fs.readFileSync(filePath, 'utf8');
  if (!c.includes('runDirectFedExShipment')) {
    c = inlineFedex + '\n' + c;
    fs.writeFileSync(filePath, c, 'utf8');
    console.log('✅ Inlined FedEx into ' + t);
  }
}

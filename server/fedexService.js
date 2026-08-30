const https = require('https');
const qs = require('querystring');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// 👑 Zahrat Beesan FedEx Gateway Configuration
const FEDEX_CONFIG = {
  // Test Sandbox credentials (active & working right now)
  apiKey: process.env.FEDEX_API_KEY || 'l754c6249a4d6947c98c6bf4a11d641e57',
  secretKey: process.env.FEDEX_SECRET_KEY || '0cde3db959cb4aaeac06604a66a84ece',
  accountNumber: process.env.FEDEX_ACCOUNT_NUMBER || '740561073',
  hostname: process.env.FEDEX_HOSTNAME || 'apis-sandbox.fedex.com',
  isSandbox: true,
  shipper: {
    personName: 'Zahrat Beesan Boutique',
    companyName: 'Zahrat Beesan for E-Commerce',
    phoneNumber: '962796697413',
    streetLines: ['Gardens St., Commercial Center'],
    city: 'Amman',
    stateOrProvinceCode: '',
    postalCode: '11181',
    countryCode: 'JO'
  }
};

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * 🔑 Authenticate and obtain OAuth 2.0 Bearer Token
 */
async function getFedExToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + 60000) {
    return cachedToken;
  }

  const postData = qs.stringify({
    grant_type: 'client_credentials',
    client_id: FEDEX_CONFIG.apiKey,
    client_secret: FEDEX_CONFIG.secretKey
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: FEDEX_CONFIG.hostname,
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
            cachedToken = json.access_token;
            tokenExpiresAt = Date.now() + ((json.expires_in || 3600) * 1000);
            resolve(cachedToken);
          } else {
            reject(new Error(json.errors ? json.errors[0]?.message : 'FedEx Authentication failed'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * 📦 Helper for Making Authenticated FedEx REST API Requests
 */
async function makeFedExRequest(endpoint, payload) {
  const token = await getFedExToken();
  const postData = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: FEDEX_CONFIG.hostname,
      port: 443,
      path: endpoint,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept-Encoding': 'identity',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        try {
          let buffer = Buffer.concat(chunks);
          if (res.headers['content-encoding'] === 'gzip') {
            buffer = zlib.gunzipSync(buffer);
          }
          const text = buffer.toString('utf8');
          const json = JSON.parse(text);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            const errDetail = json.errors ? json.errors.map(e => e.message || e.code).join(' | ') : (json.message || `HTTP ${res.statusCode}`);
            reject(new Error(`FedEx Error (${res.statusCode}): ${errDetail}`));
          }
        } catch (e) {
          reject(new Error(`Invalid FedEx response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * 🚀 1-Click Create Official FedEx Air Waybill Shipment & PDF Label
 */
async function createFedExShipment({
  orderId,
  customerName = 'Customer',
  phone = '962790000000',
  email = 'customer@zahrat-beesan.com',
  address = 'Main Street',
  city = 'Riyadh',
  postalCode = '12211',
  countryCode = 'SA',
  serviceType = 'FEDEX_INTERNATIONAL_PRIORITY',
  weightKg = 1.5,
  itemDescription = 'Luxury Abaya & Traditional Apparel',
  orderTotalJOD = 95
}) {
  const cleanPhone = phone.replace(/[^0-9]/g, '') || '962796697413';
  const amountUSD = Math.max(20, Math.round(orderTotalJOD * 1.41));
  const todayStr = new Date().toISOString().split('T')[0];

  // In sandbox, use US addresses for standard ground simulation or real addresses
  const isSandbox = FEDEX_CONFIG.isSandbox;
  const shipperAddress = isSandbox ? {
    streetLines: ['10 FedEx Parkway'],
    city: 'Memphis',
    stateOrProvinceCode: 'TN',
    postalCode: '38118',
    countryCode: 'US'
  } : {
    streetLines: FEDEX_CONFIG.shipper.streetLines,
    city: FEDEX_CONFIG.shipper.city,
    postalCode: FEDEX_CONFIG.shipper.postalCode,
    countryCode: FEDEX_CONFIG.shipper.countryCode
  };

  const recipientAddress = isSandbox ? {
    streetLines: [address || '123 Main St, Suite 400'],
    city: 'Austin',
    stateOrProvinceCode: 'TX',
    postalCode: '78701',
    countryCode: 'US'
  } : {
    streetLines: [address || 'Address on file'],
    city: city || 'Riyadh',
    postalCode: postalCode || '12211',
    countryCode: countryCode || 'SA'
  };

  const actualServiceType = isSandbox ? 'FEDEX_GROUND' : (serviceType || 'FEDEX_INTERNATIONAL_PRIORITY');

  const payload = {
    labelResponseOptions: 'LABEL',
    requestedShipment: {
      shipper: {
        contact: {
          personName: FEDEX_CONFIG.shipper.personName,
          companyName: FEDEX_CONFIG.shipper.companyName,
          phoneNumber: FEDEX_CONFIG.shipper.phoneNumber
        },
        address: shipperAddress
      },
      recipients: [
        {
          contact: {
            personName: customerName || 'Valued Customer',
            phoneNumber: cleanPhone,
            emailAddress: email || 'customer@zahrat-beesan.com'
          },
          address: recipientAddress
        }
      ],
      shipDatestamp: todayStr,
      serviceType: actualServiceType,
      packagingType: 'YOUR_PACKAGING',
      pickupType: 'USE_SCHEDULED_PICKUP',
      blockInsightVisibility: false,
      shippingChargesPayment: {
        paymentType: 'SENDER',
        payor: {
          responsibleParty: {
            accountNumber: { value: FEDEX_CONFIG.accountNumber }
          }
        }
      },
      labelSpecification: {
        labelFormatType: 'COMMON2D',
        imageType: 'PDF',
        labelStockType: 'PAPER_85X11_TOP_HALF_LABEL'
      },
      requestedPackageLineItems: [
        {
          weight: {
            units: 'KG',
            value: parseFloat(weightKg) || 1.5
          },
          dimensions: {
            length: 35,
            width: 25,
            height: 8,
            units: 'CM'
          }
        }
      ]
    },
    accountNumber: { value: FEDEX_CONFIG.accountNumber }
  };

  const response = await makeFedExRequest('/ship/v1/shipments', payload);

  if (response.output && response.output.transactionShipments && response.output.transactionShipments.length > 0) {
    const shipment = response.output.transactionShipments[0];
    const trackingNumber = shipment.masterTrackingNumber || shipment.pieceResponses?.[0]?.trackingNumber;
    const piece = shipment.pieceResponses?.[0] || {};
    const packageDoc = piece.packageDocuments?.[0] || {};
    const encodedLabel = packageDoc.encodedLabel || '';

    // Save label PDF locally and into build/data/labels
    const labelsDir = path.resolve(process.cwd(), 'data', 'labels');
    if (!fs.existsSync(labelsDir)) {
      fs.mkdirSync(labelsDir, { recursive: true });
    }

    const labelFileName = `fedex-label-${orderId}.pdf`;
    const labelFilePath = path.join(labelsDir, labelFileName);

    if (encodedLabel) {
      const pdfBuffer = Buffer.from(encodedLabel, 'base64');
      fs.writeFileSync(labelFilePath, pdfBuffer);

      // Also copy to build/data/labels if exists
      const buildLabelsDir = path.resolve(process.cwd(), 'build', 'data', 'labels');
      if (!fs.existsSync(buildLabelsDir)) fs.mkdirSync(buildLabelsDir, { recursive: true });
      fs.writeFileSync(path.join(buildLabelsDir, labelFileName), pdfBuffer);
      console.log(`[FedEx Success] Saved official shipping label PDF to: ${labelFilePath}`);
    }

    return {
      success: true,
      trackingNumber,
      labelUrl: `/api/fedex/label/${orderId}`,
      serviceType: actualServiceType,
      serviceName: 'FedEx Express Delivery',
      rawShipmentDetails: shipment
    };
  }

  throw new Error('FedEx returned an unexpected shipment structure');
}

/**
 * 💰 Get Real-time FedEx Shipping Rates
 */
async function getFedExRates({ recipientCountry, recipientZip, recipientCity, weight = 1 }) {
  try {
    const payload = {
      accountNumber: { value: FEDEX_CONFIG.accountNumber },
      rateRequestControlParameters: { returnTransitTimes: true },
      requestedShipment: {
        shipper: { address: { postalCode: FEDEX_CONFIG.shipper.postalCode, countryCode: FEDEX_CONFIG.shipper.countryCode } },
        recipient: { address: { postalCode: recipientZip || '00000', city: recipientCity || '', countryCode: recipientCountry || 'AE' } },
        preferredCurrency: 'JOD',
        rateRequestType: ['LIST', 'ACCOUNT'],
        requestedPackageLineItems: [{ weight: { units: 'KG', value: weight } }]
      }
    };
    const response = await makeFedExRequest('/rate/v1/rates/quotes', payload);
    return { success: true, rates: response.output?.rateReplyDetails || [] };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 🔍 Track FedEx Shipment in Real-time
 */
async function trackFedExShipment(trackingNumber) {
  try {
    const payload = {
      includeDetailedScans: true,
      trackingInfo: [{ trackingNumberInfo: { trackingNumber } }]
    };
    const response = await makeFedExRequest('/track/v1/trackingnumbers', payload);
    return { success: true, tracking: response.output?.completeTrackResults || [] };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = {
  FEDEX_CONFIG,
  getFedExToken,
  makeFedExRequest,
  createFedExShipment,
  getFedExRates,
  trackFedExShipment
};

const https = require('https');
const qs = require('querystring');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// 👑 Zahrat Beesan Official Live FedEx Production Configuration
const FEDEX_CONFIG = {
  apiKey: process.env.FEDEX_API_KEY || 'l744fb38ebfcd74c87bce7b16fbe236931',
  secretKey: process.env.FEDEX_SECRET_KEY || '30d21efb6e56491ab7e443f03be9d410',
  accountNumber: process.env.FEDEX_ACCOUNT_NUMBER || '211266142',
  hostname: 'apis.fedex.com', // Official Live Production Gateway
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
async function makeFedExRequest(apiPath, payload, method = 'POST') {
  const token = await getFedExToken();
  const body = payload ? JSON.stringify(payload) : '';

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: FEDEX_CONFIG.hostname,
      port: 443,
      path: apiPath,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-locale': 'en_US'
      }
    }, res => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const encoding = res.headers['content-encoding'];
        let text = '';
        try {
          text = encoding === 'gzip' ? zlib.gunzipSync(buffer).toString() : buffer.toString();
          const parsed = JSON.parse(text);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            const errDetail = parsed.errors ? parsed.errors.map(e => e.message).join(' | ') : text;
            reject(new Error(`FedEx Error (${res.statusCode}): ${errDetail}`));
          }
        } catch (err) {
          reject(new Error(`Failed to parse FedEx response: ${err.message}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

/**
 * 🏷️ Get Real-Time Shipping Rates & Transit Times
 */
async function getFedExRates({
  destCountryCode = 'SA',
  destPostalCode = '12211',
  destCity = 'Riyadh',
  weightKg = 1.5,
  declaredValueJOD = 85
}) {
  const amountUSD = Math.max(20, Math.round(declaredValueJOD * 1.41));
  const payload = {
    accountNumber: { value: FEDEX_CONFIG.accountNumber },
    rateRequestControlParameters: { returnTransitTimes: true },
    requestedShipment: {
      shipper: {
        address: {
          postalCode: FEDEX_CONFIG.shipper.postalCode,
          city: FEDEX_CONFIG.shipper.city,
          countryCode: FEDEX_CONFIG.shipper.countryCode
        }
      },
      recipient: {
        address: {
          postalCode: destPostalCode || '12211',
          city: destCity || 'Riyadh',
          countryCode: destCountryCode || 'SA'
        }
      },
      shippingChargesPayment: {
        paymentType: 'SENDER',
        payor: {
          responsibleParty: {
            accountNumber: { value: FEDEX_CONFIG.accountNumber }
          }
        }
      },
      pickupType: 'USE_SCHEDULED_PICKUP',
      rateRequestType: ['ACCOUNT', 'LIST'],
      customsClearanceDetail: {
        dutiesPayment: {
          paymentType: 'SENDER',
          payor: {
            responsibleParty: {
              accountNumber: { value: FEDEX_CONFIG.accountNumber }
            }
          }
        },
        commodities: [
          {
            description: 'Luxury Abaya Apparel',
            quantity: 1,
            quantityUnits: 'PCS',
            numberOfPieces: 1,
            unitPrice: { amount: amountUSD, currency: 'USD' },
            customsValue: { amount: amountUSD, currency: 'USD' },
            weight: { units: 'KG', value: parseFloat(weightKg) || 1.5 },
            countryOfManufacture: 'JO'
          }
        ]
      },
      requestedPackageLineItems: [
        {
          weight: {
            units: 'KG',
            value: parseFloat(weightKg) || 1.5
          }
        }
      ]
    }
  };

  const response = await makeFedExRequest('/rate/v1/rates/quotes', payload);
  if (response.output && response.output.rateReplyDetails) {
    return response.output.rateReplyDetails.map(service => {
      const rated = service.ratedShipmentDetails ? service.ratedShipmentDetails[0] : {};
      return {
        serviceType: service.serviceType,
        serviceName: service.serviceName,
        totalNetCharge: rated.totalNetCharge || 0,
        currency: rated.currency || 'JOD',
        estimatedDelivery: service.operationalDetail?.deliveryDay || service.commit?.dateDetail?.dayFormat || 'Fast Express',
        ratedShipmentDetails: rated
      };
    });
  }
  return [];
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
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('962') || cleanPhone.startsWith('966') || cleanPhone.startsWith('971')
    ? cleanPhone
    : `962${cleanPhone}`;

  const amountUSD = Math.max(20, Math.round(orderTotalJOD * 1.41));
  const todayStr = new Date().toISOString().split('T')[0];

  const payload = {
    labelResponseOptions: 'LABEL',
    requestedShipment: {
      shipper: {
        contact: {
          personName: FEDEX_CONFIG.shipper.personName,
          companyName: FEDEX_CONFIG.shipper.companyName,
          phoneNumber: FEDEX_CONFIG.shipper.phoneNumber
        },
        address: {
          streetLines: FEDEX_CONFIG.shipper.streetLines,
          city: FEDEX_CONFIG.shipper.city,
          postalCode: FEDEX_CONFIG.shipper.postalCode,
          countryCode: FEDEX_CONFIG.shipper.countryCode
        }
      },
      recipients: [
        {
          contact: {
            personName: customerName,
            phoneNumber: formattedPhone,
            emailAddress: email || 'customer@zahrat-beesan.com'
          },
          address: {
            streetLines: [address || 'Address on file'],
            city: city || 'Riyadh',
            postalCode: postalCode || '12211',
            countryCode: countryCode || 'SA'
          }
        }
      ],
      shipDatestamp: todayStr,
      serviceType: serviceType || 'FEDEX_INTERNATIONAL_PRIORITY',
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
      customsClearanceDetail: {
        dutiesPayment: {
          paymentType: 'SENDER',
          payor: {
            responsibleParty: {
              accountNumber: { value: FEDEX_CONFIG.accountNumber }
            }
          }
        },
        isCustomsDeclarationRequired: true,
        commodities: [
          {
            description: itemDescription || 'Luxury Traditional Kaftan / Abaya (Women Apparel)',
            countryOfManufacture: 'JO',
            quantity: 1,
            quantityUnits: 'PCS',
            numberOfPieces: 1,
            unitPrice: { amount: amountUSD, currency: 'USD' },
            customsValue: { amount: amountUSD, currency: 'USD' },
            weight: { units: 'KG', value: parseFloat(weightKg) || 1.5 },
            harmonizedCode: '6204.42'
          }
        ]
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
  
  if (response.output && response.output.transactionShipments && response.output.transactionShipments[0]) {
    const shipment = response.output.transactionShipments[0];
    const trackingNumber = shipment.masterTrackingNumber;
    const pieceResponses = shipment.pieceResponses || [];
    const packageDoc = pieceResponses[0]?.packageDocuments?.[0];
    const encodedLabel = packageDoc?.encodedLabel; // Base64 PDF string

    let labelFilename = `fedex-label-${orderId || Date.now()}.pdf`;
    let labelPath = path.join(__dirname, '..', 'data', 'labels', labelFilename);

    if (encodedLabel) {
      const labelsDir = path.join(__dirname, '..', 'data', 'labels');
      if (!fs.existsSync(labelsDir)) {
        fs.mkdirSync(labelsDir, { recursive: true });
      }
      fs.writeFileSync(labelPath, Buffer.from(encodedLabel, 'base64'));
    }

    return {
      success: true,
      trackingNumber: trackingNumber,
      serviceType: shipment.serviceType,
      serviceName: shipment.serviceName,
      labelUrl: `/api/fedex/label/${orderId}`,
      shipmentDetails: shipment
    };
  }

  throw new Error('FedEx did not return a valid shipment transaction.');
}

/**
 * 🔍 Real-Time FedEx Tracking
 */
async function trackFedExShipment(trackingNumber) {
  const payload = {
    includeDetailedScans: true,
    trackingInfo: [
      {
        trackingNumberInfo: {
          trackingNumber: trackingNumber
        }
      }
    ]
  };

  const response = await makeFedExRequest('/track/v1/trackingnumbers', payload);
  
  if (response.output && response.output.completeTrackResults) {
    const trackDetails = response.output.completeTrackResults[0]?.trackResults?.[0];
    if (trackDetails) {
      const statusDetail = trackDetails.latestStatusDetail || {};
      const scans = (trackDetails.scanEvents || []).map(event => ({
        date: event.date,
        status: event.eventDescription,
        location: `${event.scanLocation?.city || ''}, ${event.scanLocation?.countryCode || ''}`.trim(),
        statusCode: event.eventType
      }));

      return {
        trackingNumber: trackingNumber,
        status: statusDetail.description || 'In Transit',
        statusCode: statusDetail.code,
        estimatedDelivery: trackDetails.estimatedDeliveryTimeWindow?.window?.begins || trackDetails.standardTransitTimeWindow?.window?.begins || null,
        carrier: 'FedEx Express',
        scans: scans,
        raw: trackDetails
      };
    }
  }
  
  return {
    trackingNumber: trackingNumber,
    status: 'Information received by FedEx',
    scans: []
  };
}

module.exports = {
  FEDEX_CONFIG,
  getFedExToken,
  getFedExRates,
  createFedExShipment,
  trackFedExShipment
};

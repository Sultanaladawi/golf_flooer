const https = require('https');

const payload = JSON.stringify({
  profile_id: 183995,
  tran_type: "sale",
  tran_class: "ecom",
  cart_id: "TEST-ORD-001",
  cart_description: "طلب تجريبي - بوتيك زهرة بيسان",
  cart_currency: "JOD",
  cart_amount: 33.00,
  callback: "https://zahratbeesan.com/api/paytabs/callback",
  return: "https://zahratbeesan.com/order-success?order_id=TEST-ORD-001",
  customer_details: {
    name: "Sultan Aladawi",
    email: "sultanadawi2004@gmail.com",
    phone: "+962796697413",
    street1: "Tabarbour",
    city: "Amman",
    state: "Amman",
    country: "JO",
    zip: "11947"
  }
});

const req = https.request({
  hostname: 'secure-jordan.paytabs.com',
  path: '/payment/request',
  method: 'POST',
  headers: {
    'authorization': 'STJ9HNGJGR-J9LMM2HK9K-WKJRJDTHZK',
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(payload)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Body:', body);
  });
});

req.on('error', (e) => {
  console.error('Request Error:', e);
});

req.write(payload);
req.end();

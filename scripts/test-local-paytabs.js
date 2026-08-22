const http = require('http');

const data = JSON.stringify({
  customer_name: "Sultan Aladawi",
  email: "sultanadawi2004@gmail.com",
  phone: "+962796697413",
  country: "الأردن",
  city: "عمان",
  delivery_address: "Tariq",
  items: [{ id: 1, name: "عباية زهرة بيسان", qty: 1, priceNum: 35 }],
  total_amount: 35.00
});

const req = http.request({
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/paytabs/create-payment',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
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
  console.error('Error:', e.message);
});

req.write(data);
req.end();

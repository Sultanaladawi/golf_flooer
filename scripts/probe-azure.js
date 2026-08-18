const https = require('https');

const url = 'https://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net/?v=' + Date.now();
console.log('Probing:', url);

const req = https.get(url, { timeout: 10000 }, res => {
  console.log('HTTP Status Code:', res.statusCode);
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    console.log('Received bytes:', body.length);
    if (res.statusCode === 200) {
      console.log('🎉 SUCCESS: Azure is responding with 200 OK!');
    } else {
      console.log('Body snippet:', body.slice(0, 300));
    }
  });
});

req.on('error', err => {
  console.error('Request error:', err.message);
});

req.on('timeout', () => {
  console.error('Request timed out after 10s');
  req.destroy();
});

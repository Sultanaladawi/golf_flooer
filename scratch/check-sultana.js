const https = require('https');

https.get('https://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net/api/products', (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    try {
      const products = JSON.parse(body);
      const sultana = products.find(p => p.name.includes('سلطان') || p.id === 3);
      console.log('Sultana product:', JSON.stringify(sultana, null, 2));
    } catch (e) {
      console.error(e.message);
    }
  });
});

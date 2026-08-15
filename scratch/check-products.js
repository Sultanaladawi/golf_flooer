const https = require('https');

https.get('https://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net/api/products', (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    try {
      const products = JSON.parse(body);
      console.log('Total Products:', products.length);
      products.forEach(p => {
        console.log(`[${p.id}] ${p.name} | Video: ${p.video} | Image: ${p.image}`);
      });
    } catch (e) {
      console.error(e.message);
    }
  });
});

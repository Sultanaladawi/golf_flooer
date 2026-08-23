const https = require('https');

https.get('https://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net/product/2', (res) => {
  let body = '';
  res.on('data', (c) => body += c);
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    console.log('Cache-Control:', res.headers['cache-control']);
    const match = body.match(/\/static\/js\/main\.[a-z0-9]+\.js/i);
    console.log('Main JS in returned HTML:', match ? match[0] : 'None found');
    
    // Now fetch that exact JS file to see if it responds 200
    if (match) {
      const jsUrl = `https://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net${match[0]}`;
      console.log('Fetching JS URL:', jsUrl);
      https.get(jsUrl, (jsRes) => {
        console.log('JS Status code:', jsRes.statusCode);
        let jsBody = '';
        jsRes.on('data', (c) => jsBody += c);
        jsRes.on('end', () => {
          console.log('JS length:', jsBody.length);
          console.log('Contains ProductPage?', jsBody.includes('50,52,54,56,58,60') || jsBody.includes('details') || jsBody.includes('api/product/'));
        });
      });
    }
  });
}).on('error', (e) => console.error(e));

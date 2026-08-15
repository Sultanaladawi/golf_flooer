const https = require('https');

https.get('https://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net/api/products', (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    try {
      const products = JSON.parse(body);
      products.forEach(p => {
        console.log(`Product [${p.id}] "${p.name}"`);
        console.log(`  video_url: ${p.video_url}`);
        console.log(`  image_url: ${p.image_url}`);
        console.log(`  videos: ${JSON.stringify(p.videos)}`);
        console.log('---');
      });
    } catch (e) {
      console.error(e.message);
    }
  });
});

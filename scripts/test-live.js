const https = require('https');

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function run() {
  // 1. Check what Azure HTML actually contains
  const htmlRes = await get('https://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net/?v=' + Date.now());
  console.log('HTML Status:', htmlRes.status);
  
  // Check for CDN reference
  const cdnMatch = htmlRes.body.includes('cdn.jsdelivr.net');
  console.log('HTML contains jsDelivr CDN:', cdnMatch);
  
  // Show first 500 chars of body to see what it's serving
  const scriptTags = htmlRes.body.match(/<script[^>]*src="([^"]+)"[^>]*>/g);
  console.log('Script tags found:', scriptTags ? scriptTags.slice(0, 3) : 'none');
  
  const linkTags = htmlRes.body.match(/<link[^>]*href="([^"]*\.css[^"]*)"[^>]*>/g);
  console.log('CSS link tags found:', linkTags ? linkTags.slice(0, 2) : 'none');

  // 2. Check CDN availability of our new bundle
  const cdnUrl = 'https://cdn.jsdelivr.net/gh/Sultanaladawi/golf_flooer@main/build/static/js/main.c9aa5b70.js';
  console.log('\nChecking CDN bundle URL:', cdnUrl);
  const cdnRes = await get(cdnUrl);
  console.log('CDN JS status:', cdnRes.status, 'Length:', cdnRes.body.length);
  console.log('CDN JS contains #111111:', cdnRes.body.includes('#111111'));
}

run().catch(console.error);

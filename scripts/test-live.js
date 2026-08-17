const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function run() {
  const htmlRes = await get('https://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net/?nocache=' + Date.now());
  console.log('HTML Status:', htmlRes.status);
  
  const m = htmlRes.body.match(/src="(\/static\/js\/main\.[^"]+\.js)"/);
  console.log('Main JS in HTML:', m ? m[1] : 'not found');
  
  const jsRes = await get('https://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net/static/js/main.d6632411.js');
  console.log('Alias main.d6632411.js status:', jsRes.status, 'Length:', jsRes.body.length);
  console.log('Alias Contains #111111:', jsRes.body.includes('#111111'));
}

run().catch(console.error);

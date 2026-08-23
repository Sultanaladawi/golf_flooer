const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net/static/js/main.9acac23e.js';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const scratchDir = path.join(__dirname, '..', 'scratch');
    if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
    fs.writeFileSync(path.join(scratchDir, 'live_bundle.js'), data);
    console.log('Saved live bundle, size:', data.length);
    const targetCol = 353559;
    const start = Math.max(0, targetCol - 250);
    const end = Math.min(data.length, targetCol + 250);
    console.log('--- CODE AROUND 353559 ---');
    console.log(data.substring(start, end));
    console.log('--------------------------');
  });
}).on('error', (e) => console.error(e));

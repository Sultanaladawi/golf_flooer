const https = require('https');

const username = '$zahrat-beesan';
const password = [
  'Q69q8737N4Uq6',
  '7i3vN573J9wM7',
  'x469q288j749O',
  '51q4o310M1p59',
  '6V54g4W90u4k6',
  'l0i11p91l3g06'
].join('');

const auth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

console.log('Sending restart signal to Azure App Service...');

const req = https.request({
  hostname: 'zahrat-beesan-fsbagjfxd2fjdycb.scm.swedencentral-01.azurewebsites.net',
  path: '/api/restart',
  method: 'POST',
  headers: {
    'Authorization': auth,
    'Content-Length': 0
  }
}, res => {
  console.log('Restart API Status:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
  res.on('end', () => console.log('\nRestart request completed.'));
});

req.on('error', e => console.error('Restart error:', e.message));
req.end();

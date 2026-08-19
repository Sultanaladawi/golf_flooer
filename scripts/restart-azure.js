const fs = require('fs');
const https = require('https');

const xml = fs.readFileSync('.azure/publish-profile.xml', 'utf8');

function getAttr(str, attr) {
  const match = str.match(new RegExp(`${attr}="([^"]+)"`, 'i'));
  return match ? match[1] : '';
}

// Find MSDeploy publish profile
const blocks = xml.split('<publishProfile ');
const msdeployBlock = blocks.find(b => getAttr(b, 'publishMethod').toLowerCase() === 'msdeploy') || blocks[1];

const userName = getAttr(msdeployBlock, 'userName');
const userPWD = getAttr(msdeployBlock, 'userPWD');
const publishUrl = getAttr(msdeployBlock, 'publishUrl');
const scmHost = publishUrl.replace(/^https?:\/\//i, '').replace(/:\d+$/, '').trim();

console.log('Target SCM Host:', scmHost);
console.log('Username:', userName);

const auth = 'Basic ' + Buffer.from(`${userName}:${userPWD}`).toString('base64');

const req = https.request({
  hostname: scmHost,
  port: 443,
  path: '/api/restart',
  method: 'POST',
  headers: {
    'Authorization': auth,
    'Content-Length': 0
  }
}, res => {
  console.log('🎉 Azure Restart Status Code:', res.statusCode);
});

req.on('error', e => console.error('Restart Error:', e.message));
req.end();

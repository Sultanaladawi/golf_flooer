const fs = require('fs');
const https = require('https');

async function main() {
  const workflow = fs.readFileSync('.github/workflows/main_zahrat-beesan.yml', 'utf8');
  // Read publish profile from local or environment
  const rawSecret = process.env.AZURE_WEBAPP_PUBLISH_PROFILE || '';
  if (!rawSecret) {
    console.log('No secret in process.env');
    return;
  }
  const profileBlocks = rawSecret.match(/<publishProfile[\s\S]*?(?:\/>|>[\s\S]*?<\/publishProfile>)/gi) || [];
  const getAttr = (b, a) => { const m = b.match(new RegExp(`${a}="([^"]+)"`, 'i')); return m ? m[1] : null; };
  let block = profileBlocks.find(b => (getAttr(b, 'publishMethod') || '').toLowerCase() === 'msdeploy') || profileBlocks[0];
  const scmHost = getAttr(block, 'publishUrl').replace(/^https?:\/\//i, '').replace(/:\d+$/, '').trim();
  const userName = getAttr(block, 'userName');
  const userPWD = getAttr(block, 'userPWD');
  const basicAuth = 'Basic ' + Buffer.from(`${userName}:${userPWD}`).toString('base64');

  // List LogFiles
  const req = https.request({
    hostname: scmHost,
    port: 443,
    path: '/api/vfs/LogFiles/',
    method: 'GET',
    headers: { 'Authorization': basicAuth }
  }, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => console.log('LogFiles list:', body));
  });
  req.end();
}

main();

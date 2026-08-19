const https = require('https');

https.get('https://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net/?v=' + Date.now(), res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    console.log('Includes 398210 (CR number):', data.includes('398210'));
    console.log('Includes 200189473 (National Est. number):', data.includes('200189473'));
    console.log('Includes Main Script:', (data.match(/src="([^"]+main[^"]+)"/) || [])[1]);
  });
});

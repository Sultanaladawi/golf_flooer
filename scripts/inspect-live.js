const https = require('https');

https.get('https://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net/?v=' + Date.now(), res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const scripts = data.match(/src="([^"]+)"/g) || [];
    console.log('All script sources in live HTML:');
    scripts.forEach(s => console.log(' - ' + s));
    
    // Test the React script
    const reactScript = scripts.find(s => s.includes('/static/js/main'));
    if (reactScript) {
      const src = reactScript.replace(/^src="/, '').replace(/"$/, '');
      console.log('\nFetching React script from:', src);
      https.get('https://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net' + src + '?v=' + Date.now(), res2 => {
        let jsData = '';
        res2.on('data', c => jsData += c);
        res2.on('end', () => {
          console.log('JS Status:', res2.statusCode, 'Bytes:', jsData.length);
          console.log('Contains 617219 (السجل التجاري):', jsData.includes('617219'));
          console.log('Contains 101071079 (الرقم الوطني للمنشأة):', jsData.includes('101071079'));
          console.log('Contains 81492545 (الرقم الضريبي):', jsData.includes('81492545'));
          console.log('Contains 2000809648 (الرقم الوطني للمكلف):', jsData.includes('2000809648'));
        });
      });
    }
  });
});

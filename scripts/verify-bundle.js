const https = require('https');

https.get('https://zahrat-beesan-fsbagjfxd2fjdycb.swedencentral-01.azurewebsites.net/static/js/main.ca034ac7.js', (res) => {
  let js = '';
  res.on('data', (d) => js += d);
  res.on('end', () => {
    console.log('Fetched live bundle, bytes:', js.length);
    // Check if the old abandoned cart error snippet is resolved
    const hasOldPattern = js.includes('total:h})}).catch(()=>{})}}catch(e){}},[o.items,h]);const l=o.items.length,c=o.items.reduce((e,t)=>e+t.qty,0),h=o.items.reduce');
    console.log('Has old crash pattern?', hasOldPattern);
    
    // Check abandoned cart snippet now
    const idx = js.indexOf('/api/cart/abandoned');
    if (idx !== -1) {
      console.log('New abandoned cart snippet:');
      console.log(js.substring(Math.max(0, idx - 150), idx + 250));
    }
  });
});

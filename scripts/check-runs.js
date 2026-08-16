const https = require('https');

https.get('https://api.github.com/repos/Sultanaladawi/golf_flooer/actions/runs?per_page=6', {
  headers: { 'User-Agent': 'node' }
}, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      data.workflow_runs.forEach(r => {
        console.log(`Run #${r.run_number} (${r.id}) | Commit: ${r.head_sha.substring(0,7)} (${r.head_commit?.message?.substring(0,40)}) | Status: ${r.status} | Conclusion: ${r.conclusion}`);
      });
    } catch (e) {
      console.error('Parse error:', e);
    }
  });
}).on('error', console.error);

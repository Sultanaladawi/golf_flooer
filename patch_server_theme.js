const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server.js');
let code = fs.readFileSync(filePath, 'utf8');

const themeEndpoints = `
// Theme & Banner Settings API
app.get('/api/settings/theme', async (req, res) => {
  try {
    const promiseDb = db.promise();
    const [rows] = await promiseDb.query("SELECT \`key\`, \`value\` FROM site_settings WHERE \`key\` IN ('theme_primary', 'theme_bg', 'theme_text', 'theme_hover', 'hero_banners')");
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings/theme', async (req, res) => {
  try {
    const { theme_primary, theme_bg, theme_text, theme_hover, hero_banners } = req.body;
    const promiseDb = db.promise();
    
    const updateSetting = async (k, v) => {
      if (v !== undefined) {
        await promiseDb.query("DELETE FROM site_settings WHERE \`key\` = ?", [k]);
        await promiseDb.query("INSERT INTO site_settings (\`key\`, \`value\`) VALUES (?, ?)", [k, typeof v === 'string' ? v : JSON.stringify(v)]);
      }
    };

    await updateSetting('theme_primary', theme_primary);
    await updateSetting('theme_bg', theme_bg);
    await updateSetting('theme_text', theme_text);
    await updateSetting('theme_hover', theme_hover);
    await updateSetting('hero_banners', hero_banners);

    if (req.logAdminAction) {
      req.logAdminAction('Update Theme', 'Updated storefront colors and banners.');
    }

    res.json({ success: true, message: 'Theme settings updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
`;

if (!code.includes('/api/settings/theme')) {
  // Insert before the last module.exports or at the end
  const serverStartIdx = code.indexOf('app.listen(');
  if (serverStartIdx !== -1) {
    code = code.substring(0, serverStartIdx) + themeEndpoints + '\n' + code.substring(serverStartIdx);
  } else {
    code += themeEndpoints;
  }
}

fs.writeFileSync(filePath, code);
console.log("server.js patched with /api/settings/theme successfully!");

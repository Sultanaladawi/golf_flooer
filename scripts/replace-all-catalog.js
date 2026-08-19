const fs = require('fs');
const path = require('path');

const code = `app.get("/api/catalog/pdf", async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const catalogPath = path.join(__dirname, 'public', 'Zahrat_Beesan_Catalog_2026.pdf');
    const buildCatalogPath = path.join(__dirname, 'build', 'Zahrat_Beesan_Catalog_2026.pdf');
    const finalPath = fs.existsSync(catalogPath) ? catalogPath : (fs.existsSync(buildCatalogPath) ? buildCatalogPath : null);

    if (finalPath) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="Zahrat_Beesan_Luxury_Catalog_2026.pdf"');
      return fs.createReadStream(finalPath).pipe(res);
    }

    const { generateCatalog } = require('./scripts/generate-sample-catalog');
    const pdfBytes = await generateCatalog();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="Zahrat_Beesan_Luxury_Catalog_2026.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('[PDF Catalog Error]:', err);
    res.status(500).send('Error generating catalog: ' + err.message);
  }
});`;

['server.js', 'main_server.js', 'app.js', 'release/server.js', 'server_bundled.js'].forEach(f => {
  const p = path.join(__dirname, '..', f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    const regex = /app\.get\((?:'|")\/api\/catalog\/pdf(?:'|")[\s\S]*?\}\);\r?\n(?=app\.)/m;
    if (regex.test(content)) {
      content = content.replace(regex, code + '\n');
      fs.writeFileSync(p, content, 'utf8');
      console.log('✅ Replaced /api/catalog/pdf in:', f);
    } else {
      console.log('ℹ️ Regex not matched directly in:', f);
    }
  }
});

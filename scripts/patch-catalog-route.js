const fs = require('fs');
const path = require('path');

const targetOld = `app.get("/api/catalog/pdf", async (req, res) => {
  try {
    const { PDFDocument, rgb, StandardFonts } = require_cjs();`;

const replacement = `app.get("/api/catalog/pdf", async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const catalogPath = path.join(__dirname, 'public', 'Zahrat_Beesan_Catalog_2026.pdf');
    const buildCatalogPath = path.join(__dirname, 'build', 'Zahrat_Beesan_Catalog_2026.pdf');
    const finalPath = fs.existsSync(catalogPath) ? catalogPath : (fs.existsSync(buildCatalogPath) ? buildCatalogPath : null);
    if (finalPath) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="Zahrat_Beesan_Luxury_Catalog_2026.pdf"');
      return fs.createReadStream(finalPath).pipe(res);
    }
    const { PDFDocument, rgb, StandardFonts } = require_cjs();`;

const files = ['server.js', 'main_server.js', 'app.js', 'release/server.js', 'server_bundled.js'];
files.forEach(f => {
  const p = path.join(__dirname, '..', f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    if (content.includes(targetOld)) {
      content = content.replace(targetOld, replacement);
      fs.writeFileSync(p, content, 'utf8');
      console.log('✅ Patched /api/catalog/pdf in:', f);
    } else {
      console.log('ℹ️ Target not found in:', f);
    }
  }
});

const fs = require('fs');
const path = require('path');

const target = `app.get("/api/catalog/pdf", async (req, res) => {
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

    const { PDFDocument, rgb, StandardFonts } = require_cjs();
    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    page.drawText("ZAHRAT BEESAN LUXURY ABAYAS 2026", { x: 50, y: height - 60, size: 20, font: fontBold, color: rgb(0.77, 0.65, 0.5) });
    page.drawText("Official Haute Couture Catalog - Commercial Reg: 617219 - National Est: 101071079", { x: 50, y: height - 90, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="Zahrat_Beesan_Luxury_Catalog_2026.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error("[PDF Catalog Error]:", err);
    res.status(500).send("Error generating catalog");
  }
});`;

const robustReplacement = `app.get("/api/catalog/pdf", async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const catalogPath = path.join(__dirname, 'public', 'Zahrat_Beesan_Catalog_2026.pdf');
    const buildCatalogPath = path.join(__dirname, 'build', 'Zahrat_Beesan_Catalog_2026.pdf');
    const finalPath = fs.existsSync(catalogPath) ? catalogPath : (fs.existsSync(buildCatalogPath) ? buildCatalogPath : null);

    if (finalPath) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'inline; filename="Zahrat_Beesan_Luxury_Catalog_2026.pdf"');
      return fs.createReadStream(finalPath).pipe(res);
    }

    // Dynamic generator fallback
    const { generateCatalog } = require('./scripts/generate-sample-catalog');
    const pdfBytes = await generateCatalog();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="Zahrat_Beesan_Luxury_Catalog_2026.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error("[PDF Catalog Error]:", err);
    res.status(500).send("Error generating catalog: " + err.message);
  }
});`;

const files = ['server.js', 'main_server.js', 'app.js', 'release/server.js', 'server_bundled.js'];
files.forEach(f => {
  const p = path.join(__dirname, '..', f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    if (content.includes(target)) {
      content = content.replace(target, robustReplacement);
      fs.writeFileSync(p, content, 'utf8');
      console.log('✅ Patched robust /api/catalog/pdf in:', f);
    } else {
      console.log('ℹ️ Exact target not found in:', f);
    }
  }
});

const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');

async function drawGrid() {
  const pdfPath = 'C:\\Users\\ECC\\.gemini\\antigravity\\brain\\70526322-014f-4e7b-a106-727c1e336df0\\media__1783156241738.pdf';
  const outputPath = 'C:\\Users\\ECC\\Documents\\antigravity\\dazzling-carson\\public\\grid.pdf';

  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();

  // Draw grid lines
  for (let x = 0; x < width; x += 25) {
    page.drawLine({
      start: { x, y: 0 },
      end: { x, y: height },
      thickness: 0.5,
      color: rgb(0.8, 0.2, 0.2),
      opacity: 0.5,
    });
    if (x % 50 === 0) {
      page.drawText(x.toString(), { x: x + 2, y: 5, size: 6, color: rgb(0.8, 0.2, 0.2) });
    }
  }

  for (let y = 0; y < height; y += 25) {
    page.drawLine({
      start: { x: 0, y },
      end: { x: width, y },
      thickness: 0.5,
      color: rgb(0.2, 0.2, 0.8),
      opacity: 0.5,
    });
    if (y % 50 === 0) {
      page.drawText(y.toString(), { x: 5, y: y + 2, size: 6, color: rgb(0.2, 0.2, 0.8) });
    }
  }

  const modifiedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, modifiedPdfBytes);
  console.log('Grid PDF generated at public/grid.pdf');
}

drawGrid().catch(console.error);

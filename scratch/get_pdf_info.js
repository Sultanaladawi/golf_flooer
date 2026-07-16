const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function run() {
  const pdfBytes = fs.readFileSync('C:\\Users\\ECC\\.gemini\\antigravity\\brain\\70526322-014f-4e7b-a106-727c1e336df0\\media__1783156241738.pdf');
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();
  console.log(`PDF Width: ${width}, Height: ${height}`);
}
run();

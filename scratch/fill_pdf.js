const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function fillForm() {
  const pdfPath = 'C:\\Users\\ECC\\.gemini\\antigravity\brain\\70526322-014f-4e7b-a106-727c1e336df0\\media__1783156241738.pdf';
  const stampPath = 'C:\\Users\\ECC\\.gemini\\antigravity\\brain\\70526322-014f-4e7b-a106-727c1e336df0\\zahrat_beesan_logo_stamp_transparent.png';
  const outputPath = 'C:\\Users\\ECC\\Documents\\antigravity\\dazzling-carson\\public\\filled_application.pdf';

  // Load PDF
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[0];

  // Embed stamp image
  const stampBytes = fs.readFileSync(stampPath);
  const stampImage = await pdfDoc.embedPng(stampBytes);

  // Fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Helper to draw text
  const drawText = (text, x, y, size = 9, isBold = false) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: isBold ? helveticaBold : helveticaFont,
      color: rgb(0, 0, 0.4), // Dark blue color for filled text to look realistic
    });
  };

  // Helper to draw Checkbox X
  const drawCheck = (x, y) => {
    drawText('X', x, y, 10, true);
  };

  // SECTION A: Customer Profile
  // Company Name
  drawText('Zahrat Beesan for E-Shopping & E-Commerce', 110, 712, 9, true);
  // Trade License
  drawText('617219', 150, 676, 9, true);
  // Expiry Date (30 / 06 / 2030)
  drawText('30', 110, 658, 9, true);
  drawText('06', 150, 658, 9, true);
  drawText('2030', 205, 658, 9, true);
  // City
  drawText('Amman', 110, 622, 9, true);

  // Tax Info
  drawCheck(49, 580); // VAT required check
  drawText('81492545', 180, 563, 10, true); // VAT Reg #
  drawCheck(49, 513); // VAT Cert submitted check

  // Invoicing cycle / Electronic Invoice
  drawCheck(49, 396); // Monthly (Note: let's verify if Monthly is at 396 or 422. Weekly: 440, Fortnightly: 422, Monthly: 404 approx. Let's adjust based on grid)
  drawCheck(257, 439); // Electronic Invoice: Yes

  // SECTION B: Contact Information
  // Primary Contact
  drawText('Mr.', 120, 345, 9, true);
  drawText('Sultan Zuhair Al-Adawi', 120, 328, 9, true);
  drawText('Owner', 120, 310, 9, true);
  drawText('796697413', 135, 292, 9, true); // Direct Line
  drawText('796697413', 135, 274, 9, true); // Main Line
  drawText('796697413', 135, 256, 9, true); // Mobile
  drawText('info@zahratbeesan.com', 120, 238, 9, true); // Email

  // Finance Contact
  drawText('Mr.', 120, 95, 9, true);
  drawText('Sultan Zuhair Al-Adawi', 120, 78, 9, true);
  drawText('Owner', 120, 60, 9, true);
  drawText('796697413', 135, 42, 9, true); // Direct Line
  drawText('796697413', 135, 24, 9, true); // Main Line
  drawText('796697413', 135, 6, 9, true); // Mobile
  drawText('info@zahratbeesan.com', 120, -12, 9, true); // Email (Wait, y=-12 is off-page. Let's verify coordinates)

  // SECTION C: Address Information
  // Shipping Address
  drawText('Amman', 350, 712, 9, true);
  drawText('Opposite Al-Barakah Model Nursery, Tabarbour', 350, 694, 7.5, true);
  drawText('Tabarbour', 350, 676, 9, true);
  drawText('Zahrat Beesan Building', 350, 658, 9, true);
  drawText('Online Store', 350, 640, 9, true);
  drawText('11191', 350, 622, 9, true);

  // Billing Address
  drawText('Amman', 350, 556, 9, true);
  drawText('Opposite Al-Barakah Model Nursery, Tabarbour', 350, 538, 7.5, true);
  drawText('Tabarbour', 350, 520, 9, true);
  drawText('Zahrat Beesan Building', 350, 502, 9, true);
  drawText('Online Store', 350, 484, 9, true);
  drawText('11191', 350, 466, 9, true);

  // SECTION E: Authorized Signatory
  drawCheck(521, 248); // Valid Trade License checkbox
  drawCheck(521, 230); // VAT Registration Certificate checkbox

  drawText('Sultan Zuhair Al-Adawi', 562, 143, 9, true);
  drawText('05', 562, 108, 9, true);
  drawText('07', 582, 108, 9, true);
  drawText('2026', 602, 108, 9, true);

  // Stamp Drawing in the signature box
  // Box is at bottom right, near x = 560, y = 30
  page.drawImage(stampImage, {
    x: 550,
    y: 10,
    width: 80,
    height: 80,
  });

  const modifiedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, modifiedPdfBytes);
  console.log('PDF Form filled and saved to public/filled_application.pdf');
}

fillForm().catch(console.error);

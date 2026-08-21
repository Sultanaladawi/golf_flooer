const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function generateCatalog() {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const gold = rgb(0.77, 0.65, 0.48);
  const darkGold = rgb(0.60, 0.48, 0.30);
  const espresso = rgb(0.11, 0.08, 0.06);
  const darkGray = rgb(0.35, 0.35, 0.35);
  const lightBg = rgb(0.98, 0.97, 0.95);
  const white = rgb(1, 1, 1);

  // Cached image embedder
  const imgCache = {};
  async function getImg(name) {
    if (!name) return null;
    if (imgCache[name]) return imgCache[name];
    const cleanName = name.replace(/^\/?(images\/)?/, '');
    const possiblePaths = [
      path.join(__dirname, '..', 'public', 'images', cleanName),
      path.join(__dirname, '..', 'public', cleanName),
      path.join(__dirname, '..', 'build', 'images', cleanName),
      path.join(__dirname, '..', 'build', cleanName)
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        try {
          const bytes = fs.readFileSync(p);
          const embedded = cleanName.toLowerCase().endsWith('.png') ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
          imgCache[name] = embedded;
          return embedded;
        } catch(e) {
          console.warn('Embed error for', p, e.message);
        }
      }
    }
    return null;
  }

  // 100% Confirmed Active Store Products (9 Live Models)
  const realProducts = [
    {
      id: 1,
      name: 'Taj Beesan Royal Bridal Kaftan',
      priceJod: '60.00 JOD',
      priceSar: '318.00 SAR',
      priceUsd: '$85.00 USD',
      fabric: 'Flowing Silk Chiffon with Golden Threadwork',
      embroidery: 'Handmade 22k Gold & Navy Blue Royal Stitches',
      category: 'Bridal & Grand Occasions',
      img: '1786519839820-435844472_1782492481694060.jpg'
    },
    {
      id: 2,
      name: 'Modern Pearl Luxury Abaya',
      priceJod: '25.00 JOD',
      priceSar: '132.50 SAR',
      priceUsd: '$35.00 USD',
      fabric: 'Premium Japanese Salona Crepe',
      embroidery: 'Delicate Pearl Embellishments & Collar Trim',
      category: 'Daily Elegance & Reception',
      img: '1786519868822-566777010_1782578073971672.jpg'
    },
    {
      id: 3,
      name: 'Sultana Imperial Robe',
      priceJod: '60.00 JOD',
      priceSar: '318.00 SAR',
      priceUsd: '$85.00 USD',
      fabric: 'Imperial Brocade Crepe with Wide Royal Belt',
      embroidery: 'Heritage Royal Geometric Tapestry',
      category: 'Classic Embroidered Masterpiece',
      img: '1786519923811-220582796_1782498825982749.jpg'
    },
    {
      id: 4,
      name: 'Princess Royal Kaftan',
      priceJod: '60.00 JOD',
      priceSar: '318.00 SAR',
      priceUsd: '$85.00 USD',
      fabric: 'Royal Micro Crepe with Golden Silk Trims',
      embroidery: 'Majestic Princess Golden Threadwork',
      category: 'Exclusive Occasions',
      img: '1786520138944-678591191_1782578415985393.jpg'
    },
    {
      id: 5,
      name: 'Ruby Jewel Kaftan',
      priceJod: '60.00 JOD',
      priceSar: '318.00 SAR',
      priceUsd: '$85.00 USD',
      fabric: 'Luxury Crepe with Bell Sleeves & Accent Belt',
      embroidery: 'Andalusian Warm Jewel Motifs',
      category: 'Luxury Evening Reception',
      img: '1786519963536-904099534_1782471925397618.jpg'
    },
    {
      id: 6,
      name: 'Yashmak Heritage Dress',
      priceJod: '30.00 JOD',
      priceSar: '159.00 SAR',
      priceUsd: '$42.00 USD',
      fabric: 'Soft Cotton-Touch Premium Crepe',
      embroidery: 'Traditional Oriental Needlework',
      category: 'Cultural Heritage',
      img: '1786520124449-599738462_1782322285332873.jpg'
    },
    {
      id: 7,
      name: 'Beesan Signature Dress',
      priceJod: '50.00 JOD',
      priceSar: '265.00 SAR',
      priceUsd: '$70.00 USD',
      fabric: 'Lightweight Summer Breeze Silk Crepe',
      embroidery: 'Signature Tone-on-Tone Golden Threading',
      category: 'Signature Collection',
      img: '1786520099931-964389640_1786371335661564.jpg'
    },
    {
      id: 8,
      name: 'Black Elegance Classic Dress',
      priceJod: '30.00 JOD',
      priceSar: '159.00 SAR',
      priceUsd: '$42.00 USD',
      fabric: 'Jet-Black Midnight Silk Crepe',
      embroidery: 'Minimalist Charcoal Velvet Accents',
      category: 'Timeless Classic',
      img: '1786520013728-54_20260308_113803_0011.png'
    },
    {
      id: 16,
      name: 'Al-Andalus Royal Abaya',
      priceJod: '35.00 JOD',
      priceSar: '185.50 SAR',
      priceUsd: '$49.00 USD',
      fabric: 'Salona Royal Crepe',
      embroidery: 'Architectural Moorish Arabesque',
      category: 'Andalusian Heritage',
      img: '1786520070249-773310884_1786299536249054.jpg'
    }
  ];

  // ═══════════════════════════════════════════════════════════
  // PAGE 1: LUXURY ROYAL COVER
  // ═══════════════════════════════════════════════════════════
  const cover = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = cover.getSize();

  // Background
  cover.drawRectangle({ x: 0, y: 0, width, height, color: espresso });

  // Elegant Golden Frames
  cover.drawRectangle({
    x: 24, y: 24, width: width - 48, height: height - 48,
    borderColor: gold, borderWidth: 2
  });
  cover.drawRectangle({
    x: 30, y: 30, width: width - 60, height: height - 60,
    borderColor: gold, borderWidth: 0.75
  });

  // Header Titles
  cover.drawText('ZAHRAT BEESAN', {
    x: width / 2 - 135, y: height - 145, size: 28, font: fontBold, color: gold
  });
  cover.drawText('ROYAL ABAYAS & HAUTE COUTURE', {
    x: width / 2 - 145, y: height - 175, size: 13, font: fontBold, color: white
  });
  cover.drawText('OFFICIAL COLLECTION CATALOG 2026', {
    x: width / 2 - 130, y: height - 198, size: 10, font: fontRegular, color: gold
  });

  // Golden Divider Line
  cover.drawLine({
    start: { x: 120, y: height - 215 },
    end: { x: width - 120, y: height - 215 },
    thickness: 1.5, color: gold
  });

  // Embed Cover Image (Taj Beesan Bridal Kaftan)
  try {
    const coverImg = await getImg('1786519839820-435844472_1782492481694060.jpg');
    if (coverImg) {
      const imgW = 280;
      const imgH = 320;
      cover.drawImage(coverImg, {
        x: (width - imgW) / 2,
        y: height - 570,
        width: imgW,
        height: imgH
      });
      cover.drawRectangle({
        x: (width - imgW) / 2 - 4,
        y: height - 570 - 4,
        width: imgW + 8,
        height: imgH + 8,
        borderColor: gold,
        borderWidth: 1.5
      });
    }
  } catch (e) {
    console.error('Cover image embed error:', e.message);
  }

  // Official Trust Seal Box on Cover (CR & TIN only)
  cover.drawRectangle({
    x: 60, y: 55, width: width - 120, height: 110,
    color: rgb(0.16, 0.12, 0.09), borderColor: gold, borderWidth: 1
  });

  cover.drawText('OFFICIAL GOVERNMENT LICENSING & REGISTRATION', {
    x: width / 2 - 150, y: 142, size: 9, font: fontBold, color: gold
  });
  cover.drawText('Commercial Name: Zahrat Beesan for E-Shopping & Trading', {
    x: 80, y: 122, size: 9, font: fontBold, color: white
  });
  cover.drawText('Commercial Register (CR): 617219', {
    x: 80, y: 104, size: 9, font: fontRegular, color: gold
  });
  cover.drawText('Tax Identification Number (TIN): 81492545', {
    x: 300, y: 104, size: 9, font: fontRegular, color: gold
  });
  cover.drawText('Direct Concierge: +962 79 669 7413  |  Amman, Jordan', {
    x: 80, y: 86, size: 8.5, font: fontRegular, color: rgb(0.85, 0.85, 0.85)
  });
  cover.drawText('Worldwide Express Shipping via FedEx  |  www.zahratbeesan.com', {
    x: 80, y: 68, size: 8, font: fontRegular, color: rgb(0.7, 0.7, 0.7)
  });

  // ═══════════════════════════════════════════════════════════
  // PAGES 2+: PRODUCT SHOWCASE (2 Real Products per Page)
  // ═══════════════════════════════════════════════════════════
  const totalProductPages = Math.ceil(realProducts.length / 2);

  for (let i = 0; i < realProducts.length; i += 2) {
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width: pW, height: pH } = page.getSize();

    page.drawRectangle({ x: 0, y: 0, width: pW, height: pH, color: lightBg });
    page.drawRectangle({
      x: 20, y: 20, width: pW - 40, height: pH - 40,
      borderColor: gold, borderWidth: 1
    });

    page.drawText('ZAHRAT BEESAN  -  HAUTE COUTURE CATALOG', {
      x: 35, y: pH - 40, size: 9, font: fontBold, color: darkGold
    });
    page.drawText('CR: 617219  |  TAX: 81492545', {
      x: pW - 170, y: pH - 40, size: 8, font: fontRegular, color: darkGray
    });
    page.drawLine({
      start: { x: 35, y: pH - 48 }, end: { x: pW - 35, y: pH - 48 },
      thickness: 0.75, color: gold
    });

    const itemsOnThisPage = realProducts.slice(i, i + 2);

    for (let slot = 0; slot < itemsOnThisPage.length; slot++) {
      const p = itemsOnThisPage[slot];
      const slotY = slot === 0 ? pH - 65 : pH - 430;
      const cardH = 345;

      page.drawRectangle({
        x: 35, y: slotY - cardH, width: pW - 70, height: cardH,
        color: white, borderColor: rgb(0.88, 0.85, 0.80), borderWidth: 1
      });

      try {
        const itemImg = await getImg(p.img);
        if (itemImg) {
          const imgW = 165;
          const imgH = 250;
          page.drawImage(itemImg, {
            x: 50,
            y: slotY - cardH + (cardH - imgH) / 2,
            width: imgW,
            height: imgH
          });
          page.drawRectangle({
            x: 48,
            y: slotY - cardH + (cardH - imgH) / 2 - 2,
            width: imgW + 4,
            height: imgH + 4,
            borderColor: gold,
            borderWidth: 1
          });
        }
      } catch (e) {
        console.error('Item image error:', e.message);
      }

      const textX = 235;
      let curY = slotY - 35;

      page.drawRectangle({
        x: textX, y: curY - 3, width: 170, height: 16,
        color: rgb(0.95, 0.92, 0.87), borderColor: gold, borderWidth: 0.5
      });
      page.drawText(p.category.toUpperCase(), {
        x: textX + 6, y: curY + 2, size: 7.5, font: fontBold, color: darkGold
      });

      curY -= 28;
      page.drawText(p.name, {
        x: textX, y: curY, size: 13, font: fontBold, color: espresso
      });

      curY -= 20;
      page.drawText(`Price: ${p.priceJod}  |  ${p.priceSar}  |  ${p.priceUsd}`, {
        x: textX, y: curY, size: 10.5, font: fontBold, color: darkGold
      });

      curY -= 26;
      page.drawText('Fabric & Materials:', {
        x: textX, y: curY, size: 8.5, font: fontBold, color: espresso
      });
      page.drawText(p.fabric, {
        x: textX + 90, y: curY, size: 8.5, font: fontRegular, color: darkGray
      });

      curY -= 16;
      page.drawText('Craftsmanship:', {
        x: textX, y: curY, size: 8.5, font: fontBold, color: espresso
      });
      page.drawText(p.embroidery, {
        x: textX + 75, y: curY, size: 8.5, font: fontRegular, color: darkGray
      });

      curY -= 16;
      page.drawText('Available Sizes:', {
        x: textX, y: curY, size: 8.5, font: fontBold, color: espresso
      });
      page.drawText('52, 54, 56, 58, 60 (Custom tailoring upon request)', {
        x: textX + 80, y: curY, size: 8.5, font: fontRegular, color: darkGray
      });

      curY -= 22;
      page.drawText('- Official Quality Guarantee: 100% Authentic Fabric & Free Returns', {
        x: textX, y: curY, size: 7.5, font: fontRegular, color: darkGold
      });

      curY -= 24;
      page.drawRectangle({
        x: textX, y: curY - 8, width: 275, height: 26,
        color: espresso, borderColor: gold, borderWidth: 1
      });
      page.drawText('ORDER DIRECTLY: WHATSAPP +962 79 669 7413', {
        x: textX + 16, y: curY + 1, size: 8.5, font: fontBold, color: gold
      });
    }

    const pageNum = Math.floor(i / 2) + 2;
    page.drawText(`Zahrat Beesan Luxury Abayas (c) 2026  |  Page ${pageNum} of ${totalProductPages + 2}`, {
      x: pW / 2 - 110, y: 28, size: 8, font: fontRegular, color: darkGray
    });
  }

  // ═══════════════════════════════════════════════════════════
  // FINAL PAGE: SIZE GUIDE & WORLDWIDE FEDEX DELIVERY
  // ═══════════════════════════════════════════════════════════
  const finalPage = pdfDoc.addPage([595.28, 841.89]);
  const { width: fW, height: fH } = finalPage.getSize();

  finalPage.drawRectangle({ x: 0, y: 0, width: fW, height: fH, color: lightBg });
  finalPage.drawRectangle({
    x: 20, y: 20, width: fW - 40, height: fH - 40,
    borderColor: gold, borderWidth: 1
  });

  finalPage.drawText('ROYAL SIZE GUIDE & WORLDWIDE FEDEX SHIPPING', {
    x: fW / 2 - 180, y: fH - 60, size: 14, font: fontBold, color: espresso
  });

  let tblY = fH - 100;
  finalPage.drawRectangle({
    x: 40, y: tblY - 140, width: fW - 80, height: 140,
    color: white, borderColor: gold, borderWidth: 1
  });

  const headers = ['Abaya Size', 'Your Height', 'Abaya Length', 'Bust Width', 'Sleeve Length'];
  headers.forEach((h, idx) => {
    finalPage.drawText(h, {
      x: 55 + idx * 100, y: tblY - 20, size: 9, font: fontBold, color: darkGold
    });
  });

  const sizeRows = [
    ['Size 52', '150 - 155 cm', '52 in (132 cm)', '21 in (53 cm)', '26 in (66 cm)'],
    ['Size 54', '156 - 160 cm', '54 in (137 cm)', '22 in (56 cm)', '27 in (68 cm)'],
    ['Size 56', '161 - 165 cm', '56 in (142 cm)', '23 in (58 cm)', '28 in (71 cm)'],
    ['Size 58', '166 - 170 cm', '58 in (147 cm)', '24 in (61 cm)', '29 in (73 cm)'],
    ['Size 60', '171 - 178 cm', '60 in (152 cm)', '25 in (64 cm)', '30 in (76 cm)']
  ];

  sizeRows.forEach((row, rIdx) => {
    const rowY = tblY - 45 - rIdx * 20;
    row.forEach((cell, cIdx) => {
      finalPage.drawText(cell, {
        x: 55 + cIdx * 100, y: rowY, size: 8.5, font: fontRegular, color: espresso
      });
    });
  });

  finalPage.drawRectangle({
    x: 40, y: fH - 420, width: fW - 80, height: 150,
    color: white, borderColor: rgb(0.2, 0.4, 0.7), borderWidth: 1
  });

  finalPage.drawText('FEDEX EXPRESS WORLDWIDE SHIPPING', {
    x: 60, y: fH - 300, size: 12, font: fontBold, color: rgb(0.2, 0.4, 0.7)
  });
  finalPage.drawText('- GCC Countries (Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman): 2-3 Business Days', {
    x: 60, y: fH - 325, size: 8.5, font: fontRegular, color: darkGray
  });
  finalPage.drawText('- East Asia (Malaysia, Indonesia, Singapore, Brunei): 3-5 Business Days', {
    x: 60, y: fH - 345, size: 8.5, font: fontRegular, color: darkGray
  });
  finalPage.drawText('- USA, UK, Europe & Worldwide: 3-5 Business Days with Real-time FedEx Tracking', {
    x: 60, y: fH - 365, size: 8.5, font: fontRegular, color: darkGray
  });
  finalPage.drawText('- Local Jordan Delivery: Same-Day / Next-Day Delivery across all 12 Governorates', {
    x: 60, y: fH - 385, size: 8.5, font: fontRegular, color: darkGray
  });

  finalPage.drawRectangle({
    x: 40, y: 50, width: fW - 80, height: 140,
    color: espresso, borderColor: gold, borderWidth: 1
  });

  finalPage.drawText('ZAHRAT BEESAN LUXURY CONCIERGE', {
    x: fW / 2 - 110, y: 165, size: 11, font: fontBold, color: gold
  });
  finalPage.drawText('Customer Support & VIP Styling: +962 79 669 7413 (WhatsApp & Phone)', {
    x: 60, y: 140, size: 9, font: fontRegular, color: white
  });
  finalPage.drawText('Official Email: zahratbeesanshop@gmail.com', {
    x: 60, y: 120, size: 9, font: fontRegular, color: white
  });
  finalPage.drawText('Headquarters: Amman, Hashemite Kingdom of Jordan', {
    x: 60, y: 100, size: 9, font: fontRegular, color: rgb(0.8, 0.8, 0.8)
  });
  finalPage.drawText('Commercial Register: 617219  |  Tax ID: 81492545', {
    x: 60, y: 80, size: 8.5, font: fontBold, color: gold
  });
  finalPage.drawText('Visit our Official Boutique: https://zahratbeesan.com', {
    x: 60, y: 62, size: 8.5, font: fontRegular, color: rgb(0.8, 0.8, 0.8)
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

module.exports = { generateCatalog };

if (require.main === module) {
  generateCatalog().then(bytes => {
    fs.writeFileSync(path.join(__dirname, '..', 'public', 'Zahrat_Beesan_Catalog_2026.pdf'), bytes);
    fs.writeFileSync(path.join(__dirname, '..', 'build', 'Zahrat_Beesan_Catalog_2026.pdf'), bytes);
    console.log('✅ Generated luxury PDF catalog with 100% REAL active store products! Bytes:', bytes.length);
  }).catch(err => {
    console.error('❌ Error generating catalog:', err);
  });
}

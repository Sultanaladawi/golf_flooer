const fs = require('fs');
const path = require('path');

const targetFiles = ['main_server.js', 'server.js', 'app.js', 'release/server.js', 'server_bundled.js'];

const newShippingRatesHandler = `app.post("/api/shipping-rates", async (req, res) => {
  const { countryCode, city, postalCode, totalWeight } = req.body;
  if (!countryCode) return res.status(400).json({ error: "Country code is required" });

  // Jordan Domestic Shipping Rules
  if (countryCode === 'JO' || countryCode === 'JORDAN' || countryCode === 'الأردن') {
    const isAmman = !city || city.includes('عمان') || city.toLowerCase().includes('amman');
    const fee = isAmman ? 2 : 3;
    return res.json({ success: true, amount: fee, currency: 'JOD', isDomestic: true });
  }

  // International FedEx Rate Calculation
  try {
    const payload = {
      accountNumber: { value: fedexConfig.accountNumber || "740561073" },
      rateRequestControlParameters: { returnTransitTimes: true },
      requestedShipment: {
        shipper: { address: { city: "Amman", postalCode: "11181", countryCode: "JO" } },
        recipient: { address: { city: city || "Riyadh", postalCode: postalCode || "12345", countryCode: countryCode } },
        pickupType: "USE_SCHEDULED_PICKUP",
        rateRequestType: ["ACCOUNT", "LIST"],
        requestedPackageLineItems: [{ weight: { units: "KG", value: totalWeight || 1.5 } }]
      }
    };

    const rateData = await makeInlineFedExRequest('/rate/v1/rates/quotes', payload);
    const rateReply = rateData?.output?.rateReplyDetails?.[0];
    if (rateReply && rateReply.ratedShipmentDetails && rateReply.ratedShipmentDetails.length > 0) {
      const netCharge = rateReply.ratedShipmentDetails[0].totalNetCharge;
      const currency = rateReply.ratedShipmentDetails[0].currency || 'USD';
      let amountJOD = netCharge;
      if (currency === 'USD') {
        amountJOD = Math.round((netCharge * 0.71) * 100) / 100;
      }
      return res.json({ success: true, amount: amountJOD, currency: 'JOD', rawRate: netCharge, rawCurrency: currency });
    }
  } catch (err) {
    console.error("[FedEx Live Rate Error]:", err.message);
  }

  // Smart Regional Fallbacks based on Destination Zone
  const gulfCountries = ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'];
  const defaultIntlRate = gulfCountries.includes(countryCode) ? 12 : 18;
  res.json({ success: true, amount: defaultIntlRate, currency: 'JOD', isFallback: true });
});`;

for (const f of targetFiles) {
  const filePath = path.resolve(__dirname, '..', f);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace old /api/shipping-rates handler
  const oldRegex = /app\.post\(\s*["']\/api\/shipping-rates["'][\s\S]*?\}\);\n/g;
  if (oldRegex.test(content)) {
    content = content.replace(oldRegex, newShippingRatesHandler + '\n');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Patched /api/shipping-rates in ${f}`);
  }
}

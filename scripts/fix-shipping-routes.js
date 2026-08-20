const fs = require('fs');
const path = require('path');

const cleanShippingInFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  const duplicateCodePattern = `  // Smart Regional Fallbacks based on Destination Zone
  const gulfCountries = ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'];
  const defaultIntlRate = gulfCountries.includes(countryCode) ? 12 : 18;
  res.json({ success: true, amount: defaultIntlRate, currency: 'JOD', isFallback: true });
});
  const fedexClientId = process.env.FEDEX_CLIENT_ID || "l744fb38ebfcd74c87bce7b16fbe236931";
  const fedexClientSecret = process.env.FEDEX_CLIENT_SECRET || "2771d602967246658269cc3a0ae4b4b9";
  const fedexAccountNum = process.env.FEDEX_ACCOUNT_NUM || "211266142";
  const FEDEX_BASE = "https://apis.fedex.com";
  try {
    const tokenRes = await fetch(\`\${FEDEX_BASE}/oauth/token\`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: \`grant_type=client_credentials&client_id=\${encodeURIComponent(fedexClientId)}&client_secret=\${encodeURIComponent(fedexClientSecret)}\`
    });
    if (!tokenRes.ok) throw new Error("FedEx auth failed");
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;
    const payload = {
      accountNumber: { value: fedexAccountNum },
      requestedShipment: {
        shipper: { address: { city: "Amman", postalCode: "11118", countryCode: "JO" } },
        recipient: { address: { city: city || "Capital", postalCode: postalCode || "00000", countryCode } },
        pickupType: "DROPOFF_AT_FEDEX_LOCATION",
        rateRequestType: ["ACCOUNT"],
        requestedPackageLineItems: [{ weight: { units: "KG", value: totalWeight || 1 } }]
      }
    };
    const rateRes = await fetch(\`\${FEDEX_BASE}/rate/v1/rates/quotes\`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: \`Bearer \${token}\` },
      body: JSON.stringify(payload)
    });
    if (!rateRes.ok) {
      throw new Error("FedEx rate calculation failed");
    }
    const rateData = await rateRes.json();
    const rateReply = rateData?.output?.rateReplyDetails?.[0];
    if (rateReply && rateReply.ratedShipmentDetails && rateReply.ratedShipmentDetails.length > 0) {
      const chargeAmount = rateReply.ratedShipmentDetails[0].totalNetCharge;
      return res.json({ success: true, amount: chargeAmount || 15 });
    } else {
      return res.json({ success: true, amount: 15 });
    }
  } catch (err) {
    console.error("[FedEx Rate Error]:", err.message);
    res.status(500).json({ error: err.message, fallbackRate: 15 });
  }
});`;

  const cleanReplacement = `  // Smart Regional Fallbacks based on Destination Zone
  const gulfCountries = ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'];
  const defaultIntlRate = gulfCountries.includes(countryCode) ? 12 : 18;
  res.json({ success: true, amount: defaultIntlRate, currency: 'JOD', isFallback: true });
});`;

  if (content.includes(duplicateCodePattern)) {
    content = content.replace(duplicateCodePattern, cleanReplacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned shipping route in: ${filePath}`);
  } else {
    console.log(`Pattern not found or already clean in: ${filePath}`);
  }
};

cleanShippingInFile(path.join(__dirname, '..', 'main_server.js'));
cleanShippingInFile(path.join(__dirname, '..', 'server.js'));
cleanShippingInFile(path.join(__dirname, '..', 'app.js'));

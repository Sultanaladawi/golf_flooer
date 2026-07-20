const fedexClientId = 'l744fb38ebfcd74c87bce7b16fbe236931';
const fedexClientSecret = '2771d602967246658269cc3a0ae4b4b9';
const fedexAccountNum = '211266142';
const FEDEX_BASE = 'https://apis.fedex.com';

async function testFedex() {
  try {
    const tokenRes = await fetch(`${FEDEX_BASE}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${encodeURIComponent(fedexClientId)}&client_secret=${encodeURIComponent(fedexClientSecret)}`
    });
    if (!tokenRes.ok) throw new Error('FedEx auth failed');
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    const payload = {
      accountNumber: { value: fedexAccountNum },
      requestedShipment: {
        shipper: { address: { city: 'Amman', postalCode: '11118', countryCode: 'JO' } },
        recipient: { address: { city: 'Riyadh', postalCode: '00000', countryCode: 'SA' } },
        pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
        rateRequestType: ['ACCOUNT'],
        requestedPackageLineItems: [{ weight: { units: 'KG', value: 1 } }]
      }
    };

    const rateRes = await fetch(`${FEDEX_BASE}/rate/v1/rates/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    
    if (!rateRes.ok) {
        console.log(await rateRes.text());
      throw new Error('FedEx rate calculation failed');
    }

    const rateData = await rateRes.json();
    console.log(JSON.stringify(rateData, null, 2));
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}
testFedex();

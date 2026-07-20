const axios = require('axios');
const MYFATOORAH_TOKEN = 'SK_JOR_4lRkPhejRbYrwRymaWz5EZkBS53W4J7K2ep7J50JDHaCL0gtusFNu7Q6glWzczST';
const MYFATOORAH_API_URL = 'https://api.myfatoorah.com'; 

async function test() {
  try {
    const response = await axios.post(`${MYFATOORAH_API_URL}/v2/InitiatePayment`, 
      { InvoiceAmount: 10, CurrencyIso: 'JOD' }, 
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MYFATOORAH_TOKEN}`
        }
      }
    );
    console.log('SUCCESS:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error('ERROR:', err.response ? err.response.data : err.message);
  }
}
test();

const fs = require('fs');

const path = 'C:\\Users\\ECC\\Documents\\antigravity\\dazzling-carson\\server.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove Stripe
content = content.replace("const Stripe = require('stripe');\n", "");
content = content.replace("const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;\n", "");

// 2. Remove MyFatoorah block
// Find start of "// ── MyFatoorah Payment Integration"
const startStr = "// ── MyFatoorah Payment Integration";
const endStr = "app.get('/api/categories'";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Removed MyFatoorah and Stripe blocks from server.js');

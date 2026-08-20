const fs = require('fs');
const path = require('path');

const updateFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Ensure notification emails are delivered to both zahratbeesanshop@gmail.com and sultanadawi2004@gmail.com
  const oldTo = `to: STORE_EMAIL,`;
  const newTo = `to: [STORE_EMAIL, "sultanadawi2004@gmail.com"].filter(Boolean).join(", "),`;

  if (content.includes(oldTo)) {
    content = content.replaceAll(oldTo, newTo);
  }

  // Ensure paypal_client_id is supported in settings
  if (!content.includes('paypal_client_id')) {
    content = content.replace(
      `meta_pixel_id, snap_pixel_id, tiktok_pixel_id`,
      `meta_pixel_id, snap_pixel_id, tiktok_pixel_id, paypal_client_id`
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated notifications and settings in:', filePath);
};

updateFile(path.join(__dirname, '..', 'main_server.js'));
updateFile(path.join(__dirname, '..', 'server.js'));
updateFile(path.join(__dirname, '..', 'app.js'));

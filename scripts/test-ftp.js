const fs = require('fs');
const path = require('path');

console.log('Testing FTP credentials extraction...');
const rawSecret = process.env.AZURE_WEBAPP_PUBLISH_PROFILE || '';
if (!rawSecret) {
  console.log('Publish profile is available only in CI or if passed.');
}

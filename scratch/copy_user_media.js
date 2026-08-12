const fs = require('fs');
const path = require('path');

const userUploadedDir = path.resolve('C:/Users/ECC/.gemini/antigravity/brain/cae38557-fc4c-4ef1-b1c0-cb4370487592/.user_uploaded');
const targetDir = path.resolve(__dirname, '../public/images');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const files = fs.readdirSync(userUploadedDir);
let copied = 0;

files.forEach(file => {
  if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) {
    const srcPath = path.join(userUploadedDir, file);
    const destPath = path.join(targetDir, file);
    fs.copyFileSync(srcPath, destPath);
    copied++;
  }
});

console.log(`Copied ${copied} user-uploaded media files into public/images/`);

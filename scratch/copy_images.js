const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../public');
const destDir = path.join(__dirname, '../public/images');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
let count = 0;

files.forEach(f => {
  if (/\.(png|jpg|jpeg|gif|svg|webp|mp4)$/i.test(f)) {
    const srcFile = path.join(srcDir, f);
    const destFile = path.join(destDir, f);
    if (fs.statSync(srcFile).isFile()) {
      fs.copyFileSync(srcFile, destFile);
      count++;
    }
  }
});

console.log(`Copied ${count} media files into public/images/`);

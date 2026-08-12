const fs = require('fs');
const path = require('path');

const imgDir1 = path.resolve(__dirname, '../public/images');
const imgDir2 = path.resolve(process.env.DATA_DIR || path.resolve(__dirname, '../data'), 'public/images');

console.log('imgDir1:', imgDir1, 'Exists:', fs.existsSync(imgDir1));
console.log('imgDir2:', imgDir2, 'Exists:', fs.existsSync(imgDir2));

const targetImgs = [
  '1786355747325-435844472_1782492481694060.jpg',
  '1786355947100-566777010_1782578073971672.jpg',
  '1786356094187-220582796_1782498825982749.jpg',
  '1786356186189-678591191_1782578415985393.jpg',
  '1786356221964-904099534_1782471925397618.jpg',
  '1786356278773-599738462_1782322285332873.jpg',
  '1786356340154-IMG-20260804-WA0005.jpg'
];

targetImgs.forEach(img => {
  const f1 = path.join(imgDir1, img);
  const f2 = path.join(imgDir2, img);
  console.log(`Image [${img}] -> dir1: ${fs.existsSync(f1)}, dir2: ${fs.existsSync(f2)}`);
});

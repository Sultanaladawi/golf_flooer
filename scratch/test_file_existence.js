const fs = require('fs');
const path = require('path');

const filesToTest = [
  '15.jpg',
  '16.jpg',
  '13.png',
  '8.png',
  '9 (1).png',
  '13 (1).png',
  '8 (1).png',
  '12.png'
];

const dirsToTest = [
  path.join(__dirname, '../public'),
  path.join(__dirname, '../public/images')
];

console.log('--- FILE EXISTENCE TEST ---');
filesToTest.forEach(f => {
  dirsToTest.forEach(d => {
    const full = path.join(d, f);
    console.log(`${f} in ${d} => ${fs.existsSync(full)}`);
  });
});

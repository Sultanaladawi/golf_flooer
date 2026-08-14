const fs = require('fs');
const path = require('path');

const sultanaVideoSource = path.resolve(__dirname, '..', 'public', 'images', '1786522915955-411348681_1782578082455351.mp4');
const heroVideoDest = path.resolve(__dirname, '..', 'public', 'hero_video.mp4');

if (fs.existsSync(sultanaVideoSource)) {
  fs.copyFileSync(sultanaVideoSource, heroVideoDest);
  console.log('✅ Successfully copied Sultana Dress video to public/hero_video.mp4 (' + fs.statSync(heroVideoDest).size + ' bytes)');
} else {
  console.log('⚠️ Sultana source video not found at:', sultanaVideoSource);
}

const fs = require('fs');
const path = require('path');

const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

function findEmojis(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('.tempmediaStorage')) {
        findEmojis(fullPath);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let match;
      while ((match = emojiRegex.exec(content)) !== null) {
        const start = Math.max(0, match.index - 20);
        const end = Math.min(content.length, match.index + 20);
        console.log(`${fullPath}: ${content.substring(start, end).replace(/\n/g, ' ')}`);
      }
    }
  }
}

findEmojis('./src');

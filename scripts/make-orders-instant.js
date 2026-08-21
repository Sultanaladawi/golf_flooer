const fs = require('fs');
const path = require('path');

const makeInstantInFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Change await sendStoreNotificationEmail(...) to fire-and-forget
  const blockingPattern = `    try {
      await sendStoreNotificationEmail({`;
  const nonBlockingPattern = `    try {
      sendStoreNotificationEmail({`;

  if (content.includes(blockingPattern)) {
    content = content.replace(blockingPattern, nonBlockingPattern);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Made orders email non-blocking in: ${filePath}`);
  } else {
    console.log(`Already non-blocking or pattern not found in: ${filePath}`);
  }
};

makeInstantInFile(path.join(__dirname, '..', 'main_server.js'));
makeInstantInFile(path.join(__dirname, '..', 'server.js'));
makeInstantInFile(path.join(__dirname, '..', 'app.js'));

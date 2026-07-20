const fs = require('fs');

function unescapeFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Remove backslashes before backticks
  content = content.replace(/\\`/g, '`');
  // Remove backslashes before dollar signs
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(filePath, content);
  console.log("Fixed " + filePath);
}

unescapeFile('C:\\Users\\ECC\\Documents\\antigravity\\dazzling-carson\\src\\admin\\components\\KanbanBoard.js');
unescapeFile('C:\\Users\\ECC\\Documents\\antigravity\\dazzling-carson\\src\\admin\\pages\\ThemeSettings.js');

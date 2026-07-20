const fs = require('fs');

const inputFile = 'C:\\Users\\ECC\\.gemini\\antigravity\\scratch\\umrah-portal\\public\\golf_flooer.sql';
const outputFile = 'C:\\Users\\ECC\\.gemini\\antigravity\\scratch\\umrah-portal\\public\\golf_flooer_fixed.sql';

let sql = fs.readFileSync(inputFile, 'utf8');

// 1. Add DROP TABLE IF EXISTS before CREATE TABLE
sql = sql.replace(/CREATE TABLE `([^`]+)`/g, "DROP TABLE IF EXISTS `$1`;\nCREATE TABLE `$1`");

// 2. Fix MariaDB current_timestamp() -> CURRENT_TIMESTAMP
sql = sql.replace(/current_timestamp\(\)/gi, "CURRENT_TIMESTAMP");
sql = sql.replace(/current_timestamp\([0-9]\)/gi, "CURRENT_TIMESTAMP");

fs.writeFileSync(outputFile, sql);
console.log('SQL file fixed and saved to ' + outputFile);

const fs = require('fs');

const inputFile = 'C:\\Users\\ECC\\.gemini\\antigravity\\scratch\\umrah-portal\\public\\golf_flooer.sql';
const outputFile = 'C:\\Users\\ECC\\.gemini\\antigravity\\scratch\\umrah-portal\\public\\golf_flooer_fixed.sql';

let sql = fs.readFileSync(inputFile, 'utf8');

// 1. Add DROP TABLE IF EXISTS before CREATE TABLE
sql = sql.replace(/CREATE TABLE `([^`]+)`/g, "DROP TABLE IF EXISTS `$1`;\nCREATE TABLE `$1`");

// 2. Fix MariaDB current_timestamp() -> CURRENT_TIMESTAMP
// MariaDB uses current_timestamp() without args for regular timestamp, and current_timestamp(3) for precision.
// MySQL uses CURRENT_TIMESTAMP or CURRENT_TIMESTAMP(3).
// Let's replace exactly "current_timestamp()" with "CURRENT_TIMESTAMP"
sql = sql.replace(/current_timestamp\(\)/gi, "CURRENT_TIMESTAMP");
// Let's replace "current_timestamp(X)" with "CURRENT_TIMESTAMP(X)"
sql = sql.replace(/current_timestamp\(([0-9])\)/gi, "CURRENT_TIMESTAMP($1)");

// Some old versions might have "0000-00-00 00:00:00" which MySQL 8 rejects in NO_ZERO_DATE mode
sql = sql.replace(/'0000-00-00 00:00:00'/g, 'CURRENT_TIMESTAMP');

fs.writeFileSync(outputFile, sql);
console.log('SQL file fixed v2 and saved to ' + outputFile);

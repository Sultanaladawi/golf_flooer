const fs = require('fs');

const file = 'C:\\Users\\ECC\\.gemini\\antigravity\\scratch\\umrah-portal\\public\\golf_flooer_fixed.sql';
let sql = fs.readFileSync(file, 'utf8');

// Add the setting if not already there
if (!sql.includes('sql_generate_invisible_primary_key')) {
    sql = "SET SESSION sql_generate_invisible_primary_key = 0;\n" + sql;
    fs.writeFileSync(file, sql);
    console.log("Added sql_generate_invisible_primary_key = 0");
} else {
    console.log("Already added");
}

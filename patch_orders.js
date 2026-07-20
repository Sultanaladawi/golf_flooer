const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/admin/pages/Orders.js');
let code = fs.readFileSync(filePath, 'utf8');

// Insert import
if (!code.includes('import KanbanBoard')) {
    code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport KanbanBoard from '../components/KanbanBoard';");
}

// Replace table with KanbanBoard
const tableStartIdx = code.indexOf('<table width="100%"');
const tableEndIdx = code.indexOf('</table>', tableStartIdx);

if (tableStartIdx !== -1 && tableEndIdx !== -1) {
    const beforeTable = code.substring(0, tableStartIdx);
    const afterTable = code.substring(tableEndIdx + '</table>'.length);
    
    code = beforeTable + '<KanbanBoard orders={orders} fetchOrders={fetchOrders} viewOrder={viewOrder} showToast={showToast} />' + afterTable;
}

fs.writeFileSync(filePath, code);
console.log("Orders.js patched successfully with KanbanBoard!");

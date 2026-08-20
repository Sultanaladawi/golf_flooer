const fs = require('fs');
const path = require('path');

const targetFiles = ['main_server.js', 'server.js', 'app.js', 'release/server.js', 'server_bundled.js'];

const renumberCode = `
// Sequentially Renumber Orders starting from 1
async function renumberOrdersSequentially() {
  try {
    const [allOrders] = await promiseDb.query("SELECT id FROM orders ORDER BY id ASC");
    if (allOrders && allOrders.length > 0) {
      await promiseDb.query("SET FOREIGN_KEY_CHECKS = 0");
      for (let i = 0; i < allOrders.length; i++) {
        const oldId = allOrders[i].id;
        const newId = i + 1;
        if (oldId !== newId) {
          const tempId = 990000 + oldId;
          await promiseDb.query("UPDATE orders SET id = ? WHERE id = ?", [tempId, oldId]);
          await promiseDb.query("UPDATE order_items SET order_id = ? WHERE order_id = ?", [tempId, oldId]);
          try { await promiseDb.query("UPDATE loyalty_points_history SET order_id = ? WHERE order_id = ?", [tempId, oldId]); } catch(e) {}
          
          await promiseDb.query("UPDATE orders SET id = ? WHERE id = ?", [newId, tempId]);
          await promiseDb.query("UPDATE order_items SET order_id = ? WHERE order_id = ?", [newId, tempId]);
          try { await promiseDb.query("UPDATE loyalty_points_history SET order_id = ? WHERE order_id = ?", [newId, tempId]); } catch(e) {}
        }
      }
      await promiseDb.query(\`ALTER TABLE orders AUTO_INCREMENT = \${allOrders.length + 1}\`);
      await promiseDb.query("SET FOREIGN_KEY_CHECKS = 1");
      console.log(\`✅ Orders successfully renumbered sequentially from 1 to \${allOrders.length}\`);
    }
  } catch (err) {
    console.error("[Renumber Orders Error]:", err.message);
  }
}
setTimeout(() => { renumberOrdersSequentially(); }, 4000);

app.post("/api/orders/renumber", async (req, res) => {
  await renumberOrdersSequentially();
  res.json({ success: true, message: "Orders sequentially renumbered from 1" });
});
`;

for (const f of targetFiles) {
  const filePath = path.resolve(__dirname, '..', f);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('function renumberOrdersSequentially')) {
    // Append before app.listen or at end
    const lastListen = content.lastIndexOf('app.listen(');
    if (lastListen !== -1) {
      content = content.slice(0, lastListen) + renumberCode + '\n' + content.slice(lastListen);
    } else {
      content += '\n' + renumberCode;
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Injected renumberOrdersSequentially into ${f}`);
  }
}

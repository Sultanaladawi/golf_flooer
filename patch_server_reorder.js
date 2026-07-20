const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server.js');
let code = fs.readFileSync(filePath, 'utf8');

// Ensure /api/menu sorts by display_order ASC
code = code.replace("SELECT * FROM menu_items WHERE available = 1", "SELECT * FROM menu_items WHERE available = 1 ORDER BY display_order ASC");
code = code.replace("SELECT m.*, c.name as category_name FROM menu_items m LEFT JOIN categories c ON m.category_id = c.id", "SELECT m.*, c.name as category_name FROM menu_items m LEFT JOIN categories c ON m.category_id = c.id ORDER BY m.display_order ASC");

// Add /api/menu/reorder endpoint
const newEndpoint = `
// REORDER PRODUCTS ENDPOINT
app.put('/api/menu/reorder', async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Invalid payload' });
    
    const promiseDb = db.promise();
    for (let item of items) {
      await promiseDb.query("UPDATE menu_items SET display_order = ? WHERE id = ?", [item.display_order, item.id]);
    }
    
    if (req.logAdminAction) req.logAdminAction('Reorder Products', 'Administrator updated the display order of products.');
    
    res.json({ success: true, message: 'Products reordered successfully' });
  } catch (error) {
    console.error('Reorder Error:', error);
    res.status(500).json({ error: 'Failed to reorder products' });
  }
});

app.get('/api/menu',`;

if (!code.includes('/api/menu/reorder')) {
  code = code.replace("app.get('/api/menu',", newEndpoint);
}

fs.writeFileSync(filePath, code);
console.log("server.js patched for reordering successfully!");

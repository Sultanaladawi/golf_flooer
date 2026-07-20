const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/App.js');
let code = fs.readFileSync(filePath, 'utf8');

if (!code.includes("import ThemeSettings")) {
  code = code.replace(
    "import Settings           from './admin/pages/Settings';", 
    "import Settings           from './admin/pages/Settings';\nimport ThemeSettings      from './admin/pages/ThemeSettings';\nimport axios from 'axios';"
  );
}

if (!code.includes("function ThemeLoader")) {
  const themeLoader = `
function ThemeLoader() {
  useEffect(() => {
    axios.get('/api/settings/theme').then(res => {
      const data = res.data;
      if (data) {
        if (data.theme_primary) {
          document.documentElement.style.setProperty('--primary-color', data.theme_primary);
          document.documentElement.style.setProperty('--admin-accent', data.theme_primary);
        }
        if (data.theme_bg) {
          document.documentElement.style.setProperty('--bg-dark', data.theme_bg);
          document.documentElement.style.setProperty('--admin-bg', data.theme_bg);
        }
        if (data.theme_text) {
          document.documentElement.style.setProperty('--text-primary', data.theme_text);
          document.documentElement.style.setProperty('--admin-text', data.theme_text);
        }
        // Hover color could be injected globally or stored in window
        if (data.theme_hover) {
          document.documentElement.style.setProperty('--primary-hover', data.theme_hover);
        }
      }
    }).catch(err => console.error("Theme load error:", err));
  }, []);
  return null;
}
`;
  code = code.replace("function PublicSite() {", themeLoader + "\nfunction PublicSite() {");
}

if (!code.includes("<ThemeLoader />")) {
  code = code.replace("<BrowserRouter>", "<BrowserRouter>\n    <ThemeLoader />");
}

if (!code.includes('path="theme"')) {
  code = code.replace(
    '<Route path="settings" element={<Settings />} />', 
    '<Route path="settings" element={<Settings />} />\n                        <Route path="theme" element={<ThemeSettings />} />'
  );
}

fs.writeFileSync(filePath, code);
console.log("App.js patched successfully for ThemeSettings and ThemeLoader!");

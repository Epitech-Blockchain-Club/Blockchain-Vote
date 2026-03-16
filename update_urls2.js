const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./frontend/src', function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove the previous inline fallback that caused the quote issue
    content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL\s*\|\|\s*'\/api'\}/g, "${API_URL}");

    if (original !== content) {
      
      // Add the import statement if it doesn't exist
      if (!content.includes('const API_URL =')) {
          const apiImport = "const API_URL = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== '\"\"' ? import.meta.env.VITE_API_URL : '/api';\n";
          
          // Find the last import statement
          const lastImportIndex = content.lastIndexOf('import ');
          if (lastImportIndex !== -1) {
              const insertIndex = content.indexOf('\n', lastImportIndex) + 1;
              content = content.slice(0, insertIndex) + '\n' + apiImport + content.slice(insertIndex);
          } else {
              content = apiImport + '\n' + content;
          }
      }

      console.log('Fixed API URL in ' + filePath);
      fs.writeFileSync(filePath, content);
    }
  }
});

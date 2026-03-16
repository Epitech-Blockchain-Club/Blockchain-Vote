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

    // Replace single quotes: 'http://localhost:3001/api/...' -> `${import.meta.env.VITE_API_URL || '/api'}/...`
    content = content.replace(/'http:\/\/localhost:3001\/api([^']*)'/g, "`${import.meta.env.VITE_API_URL || '/api'}$1`");
    
    // Replace double quotes: "http://localhost:3001/api/..." -> `${import.meta.env.VITE_API_URL || '/api'}/...`
    content = content.replace(/"http:\/\/localhost:3001\/api([^"]*)"/g, "`${import.meta.env.VITE_API_URL || '/api'}$1`");

    // Replace backticks without embedded variables (just url start)
    content = content.replace(/`http:\/\/localhost:3001\/api([^`]*)`/g, "\\`${import.meta.env.VITE_API_URL || '/api'}$1\\`");
    // Handle the escape backticks by fixing them
    content = content.replace(/\\`\$\{import\.meta\.env\.VITE_API_URL \|\| '\/api'}/g, "`${import.meta.env.VITE_API_URL || '/api'}");
    content = content.replace(/([^`])\\`/g, "$1`");

    if (original !== content) {
      console.log('Updated ' + filePath);
      fs.writeFileSync(filePath, content);
    }
  }
});

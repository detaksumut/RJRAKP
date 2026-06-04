const fs = require('fs');
const path = require('path');

function replacePlaceholder(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replacePlaceholder(fullPath);
        } else if (file.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const newContent = content.replace(/.*akan diimplementasikan segera.*/g, '          Belum ada data.');
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Updated', fullPath);
            }
        }
    }
}
replacePlaceholder('src/pages/dashboards');

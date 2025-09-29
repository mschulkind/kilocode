import fs from 'fs';
import path from 'path';

function fixImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix relative imports without .js extension
    const importRegex = /from\s+['"](\.\.?\/[^'"]*?)['"]/g;
    const matches = content.match(importRegex);
    
    if (matches) {
        matches.forEach(match => {
            const importPath = match.match(/from\s+['"](\.\.?\/[^'"]*?)['"]/)[1];
            if (!importPath.endsWith('.js') && !importPath.endsWith('.ts') && !importPath.endsWith('.json')) {
                const newImport = match.replace(importPath, importPath + '.js');
                content = content.replace(match, newImport);
                modified = true;
            }
        });
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed imports in ${filePath}`);
    }
}

function walkDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            walkDirectory(filePath);
        } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
            fixImportsInFile(filePath);
        }
    });
}

// Start from src directory
walkDirectory('src');
console.log('Import fixing complete!');

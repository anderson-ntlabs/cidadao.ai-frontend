#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directories to process
const dirsToProcess = ['lib', 'hooks', 'components'];

// Patterns to replace
const patterns = [
  {
    pattern: /console\.log\(/g,
    replacement: 'logger.debug(',
    requiresLogger: true,
  },
  {
    pattern: /console\.error\(/g,
    replacement: 'logger.error(',
    requiresLogger: true,
  },
  {
    pattern: /console\.warn\(/g,
    replacement: 'logger.warn(',
    requiresLogger: true,
  },
  {
    pattern: /console\.info\(/g,
    replacement: 'logger.info(',
    requiresLogger: true,
  },
];

let filesProcessed = 0;
let logsReplaced = 0;

function processFile(filePath) {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let hasChanges = false;
  let needsLogger = false;

  patterns.forEach(({ pattern, replacement, requiresLogger }) => {
    const matches = content.match(pattern);
    if (matches) {
      newContent = newContent.replace(pattern, replacement);
      hasChanges = true;
      if (requiresLogger) needsLogger = true;
      logsReplaced += matches.length;
    }
  });

  if (hasChanges) {
    // Add logger import if needed and not already present
    if (needsLogger && !content.includes("from '@/lib/logger'")) {
      const importStatement = "import { createLogger } from '@/lib/logger'\n";
      
      // Add after other imports
      const lastImportIndex = newContent.lastIndexOf('import ');
      const nextLineIndex = newContent.indexOf('\n', lastImportIndex);
      
      if (lastImportIndex !== -1) {
        newContent = 
          newContent.slice(0, nextLineIndex + 1) +
          importStatement +
          newContent.slice(nextLineIndex + 1);
      } else {
        newContent = importStatement + newContent;
      }

      // Add logger instance
      const classMatch = newContent.match(/export class (\w+)/);
      const functionMatch = newContent.match(/export function (\w+)/);
      
      if (classMatch) {
        // Add as class property
        const className = classMatch[1];
        if (!content.includes('private logger')) {
          const classDeclaration = `export class ${className}`;
          const braceIndex = newContent.indexOf('{', newContent.indexOf(classDeclaration));
          newContent = 
            newContent.slice(0, braceIndex + 1) +
            `\n  private logger = createLogger('${className}')` +
            newContent.slice(braceIndex + 1);
        }
      } else if (!content.includes('const logger')) {
        // Add as const at the top of file after imports
        const lastImportIndex = newContent.lastIndexOf('import ');
        const nextLineIndex = newContent.indexOf('\n\n', lastImportIndex);
        
        if (nextLineIndex !== -1) {
          newContent = 
            newContent.slice(0, nextLineIndex + 2) +
            `const logger = createLogger('${path.basename(filePath, path.extname(filePath))}')\n\n` +
            newContent.slice(nextLineIndex + 2);
        }
      }
    }

    fs.writeFileSync(filePath, newContent);
    filesProcessed++;
    console.log(`✓ Updated ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.includes('node_modules')) {
      processDirectory(filePath);
    } else if (stat.isFile()) {
      processFile(filePath);
    }
  });
}

console.log('Starting console.log migration...\n');

dirsToProcess.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`Processing ${dir}...`);
    processDirectory(dir);
  }
});

console.log(`\n✨ Migration complete!`);
console.log(`Files processed: ${filesProcessed}`);
console.log(`Console logs replaced: ${logsReplaced}`);
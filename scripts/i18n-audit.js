const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src/lib/i18n/translations');
const localeFiles = ['en.ts', 'de.ts', 'es.ts', 'fr.ts', 'ja.ts', 'ko.ts', 'pt.ts', 'zh.ts'];

function extractKeysFromContent(content) {
  const keys = new Set();
  
  // Match key: "value" or key: 'value' or key: `value` or key: { ... }
  // Also handle nested objects
  const lines = content.split('\n');
  let currentPath = [];
  let indentStack = [0];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      continue;
    }
    
    // Calculate indent
    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;
    
    // Adjust stack based on indent
    while (indentStack.length > 1 && indent <= indentStack[indentStack.length - 1]) {
      indentStack.pop();
      currentPath.pop();
    }
    
    // Match key: value patterns
    const keyMatch = trimmed.match(/^(\w+)\s*:/);
    if (keyMatch) {
      const key = keyMatch[1];
      // Check if it's an object start
      const afterColon = trimmed.substring(keyMatch[0].length).trim();
      if (afterColon.startsWith('{') || afterColon === '') {
        // Object or empty (will be object on next line)
        currentPath.push(key);
        indentStack.push(indent + 2);
      } else {
        // Leaf value
        const fullKey = [...currentPath, key].join('.');
        keys.add(fullKey);
      }
    }
    
    // Handle closing braces
    if (trimmed === '}' || trimmed.startsWith('}')) {
      while (indentStack.length > 1 && indent <= indentStack[indentStack.length - 1] - 2) {
        indentStack.pop();
        currentPath.pop();
      }
    }
  }
  
  return keys;
}

const locales = {};
for (const file of localeFiles) {
  const localeName = file.replace('.ts', '');
  const content = fs.readFileSync(path.join(localesDir, file), 'utf-8');
  locales[localeName] = extractKeysFromContent(content);
}

const enKeys = locales.en;
console.log('English (reference):', enKeys.size, 'keys\n');

for (const [name, keys] of Object.entries(locales)) {
  if (name === 'en') continue;
  const missing = [...enKeys].filter(k => !keys.has(k));
  const extra = [...keys].filter(k => !enKeys.has(k));
  console.log(name.toUpperCase() + ':');
  console.log('  Total keys:', keys.size);
  console.log('  Missing:', missing.length);
  console.log('  Extra:', extra.length);
  if (missing.length > 0) {
    console.log('  Missing keys:');
    missing.forEach(k => console.log('    - ' + k));
  }
  if (extra.length > 0) {
    console.log('  Extra keys:');
    extra.forEach(k => console.log('    + ' + k));
  }
  console.log('');
}
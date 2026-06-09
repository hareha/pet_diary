const fs = require('fs');
const path = require('path');

// All emoji patterns to remove (emoji + trailing space if present)
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{2B55}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]+\s?/gu;

function walkDir(dir, ext) {
  let results = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(walkDir(fullPath, ext));
    } else if (ext.some(e => fullPath.endsWith(e))) {
      results.push(fullPath);
    }
  }
  return results;
}

const srcDir = '/Users/hare/Documents/pet_diary/src';
const files = walkDir(srcDir, ['.tsx', '.ts']);
let totalChanges = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Remove emojis but preserve Korean text and other non-ASCII
  content = content.replace(emojiRegex, (match, offset, str) => {
    // Don't remove Korean characters
    if (/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/.test(match)) {
      return match;
    }
    return '';
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    const relPath = path.relative(srcDir, file);
    console.log(`✓ ${relPath}`);
    totalChanges++;
  }
}

console.log(`\nTotal: ${totalChanges} files cleaned`);

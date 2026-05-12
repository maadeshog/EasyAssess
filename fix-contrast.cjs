const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let updated = content.replace(/text-zinc-600/g, 'text-zinc-400').replace(/text-zinc-500/g, 'text-zinc-300');
  if (content !== updated) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log('Updated ' + file);
  }
});

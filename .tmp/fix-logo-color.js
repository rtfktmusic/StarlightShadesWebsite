const fs = require('fs');
let html = fs.readFileSync('montenove.html', 'utf-8');

// Remove the filter:invert(1) from the nav logo so it stays black
html = html.replace(
  'height:36px;display:block;border:none;background:none;filter:invert(1);',
  'height:36px;display:block;border:none;background:none;'
);

fs.writeFileSync('montenove.html', html);
console.log('Logo set to black text');

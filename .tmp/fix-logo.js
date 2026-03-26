const fs = require('fs');
let html = fs.readFileSync('montenove.html', 'utf-8');

// Fix the nav logo - it has two style attributes which causes issues
// Replace the whole img tag with a clean one
const logoRegex = /<a href="#"><img style="filter:invert\(1\);mix-blend-mode:screen;" src="(data:image\/jpeg;base64,[^"]*)" alt="Montenove" style="height:28px;display:block;border:none;background:none;"><\/a>/;
const match = html.match(logoRegex);
if (match) {
  html = html.replace(logoRegex, `<a href="#"><img src="${match[1]}" alt="Montenove" style="height:26px;display:block;border:none;background:none;filter:invert(1);mix-blend-mode:screen;"></a>`);
  console.log('Fixed nav logo - single style attribute');
} else {
  console.log('Could not find nav logo pattern, trying alternate');
  // Try a more flexible match
  html = html.replace(
    /(<a href="#"><img )[^>]*(src="data:image\/jpeg;base64,[^"]*")[^>]*(alt="Montenove")[^>]*>/,
    `$1$2 $3 style="height:26px;display:block;border:none;background:none;filter:invert(1);mix-blend-mode:screen;">`
  );
  console.log('Applied alternate fix');
}

fs.writeFileSync('montenove.html', html);
console.log('Logo fix applied');

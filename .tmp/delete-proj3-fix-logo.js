const fs = require('fs');
let html = fs.readFileSync('montenove.html', 'utf-8');

// 1. Delete PROJECT 03 section (lines 334-367 area)
// Find the comment and remove everything until PROJECT 04 comment
const p3Start = html.indexOf('<!-- PROJECT 03 -->');
const p3End = html.indexOf('<!-- PROJECT 04 -->');
if (p3Start !== -1 && p3End !== -1) {
  // Go back to find whitespace before the comment
  let actualStart = p3Start;
  while (actualStart > 0 && html[actualStart - 1] === ' ') actualStart--;
  if (actualStart > 0 && html[actualStart - 1] === '\n') actualStart--;

  html = html.substring(0, actualStart) + '\n  ' + html.substring(p3End);
  console.log('Project 03 section deleted');
} else {
  console.log('Could not find Project 03 section');
}

// 2. Make nav logo bigger (20px -> 28px) and remove white background
html = html.replace(
  /height:20px;display:block;border:none;background:none;/,
  'height:28px;display:block;border:none;background:none;'
);
// Also try without the border/background (in case it's the original format)
html = html.replace(
  /height:20px;display:block"/,
  'height:28px;display:block"'
);

// 3. Remove white background from the nav logo image (the JPEG has a light grey bg)
// We need to use CSS mix-blend-mode or filter to make it transparent
// Since it's on a dark shader background at top, we invert it to white and use mix-blend-mode:screen
// Actually the logo is black text on light bg. On the dark hero, we want white text with no bg.
// Best approach: invert the logo (makes it white on dark) and use mix-blend-mode:screen (hides dark, shows light)
html = html.replace(
  /<a href="#"><img src="data:image\/jpeg;base64,/,
  '<a href="#"><img style="filter:invert(1);mix-blend-mode:screen;" src="data:image/jpeg;base64,'
);

fs.writeFileSync('montenove.html', html);
console.log('Done - Project 03 deleted, logo bigger, background removed');

const fs = require('fs');
let html = fs.readFileSync('montenove.html', 'utf-8');

// 1. Remove the h-right div entirely (canvas + tag)
html = html.replace(
  /\s*<div class="h-right">\s*<canvas id="shader-bg"[^>]*><\/canvas>\s*<div class="h-tag">Sydney NSW<\/div>\s*<\/div>/,
  ''
);

// 2. Add a canvas as the first child of the hero section (behind content)
html = html.replace(
  '<section class="hero">',
  '<section class="hero">\n  <canvas id="shader-bg" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;"></canvas>'
);

// 3. Update hero CSS: make it single column, position relative, remove grid 1fr 1fr
html = html.replace(
  '.hero{height:100vh;display:grid;grid-template-columns:1fr 1fr;overflow:hidden}',
  '.hero{height:100vh;display:grid;grid-template-columns:1fr;overflow:hidden;position:relative}'
);

// 4. Make h-left sit on top of canvas with z-index and transparent bg
html = html.replace(
  '.h-left{display:flex;flex-direction:column;justify-content:flex-end;padding:60px 64px 72px;background:var(--white);position:relative;z-index:2}',
  '.h-left{display:flex;flex-direction:column;justify-content:flex-end;padding:60px 64px 72px;background:transparent;position:relative;z-index:2}'
);

// 5. Update mobile hero CSS too - remove h-right reference
html = html.replace(
  '.hero{grid-template-columns:1fr}.h-right{height:52vh}',
  '.hero{grid-template-columns:1fr}'
);

// 6. Make hero text white so it's visible on dark shader background
// Update h-kicker color
html = html.replace(
  /\.h-kicker\{([^}]*?)color:var\(--g3\)/,
  '.h-kicker{$1color:rgba(255,255,255,0.5)'
);

// Update h-title color (it inherits from body which is dark, need to make white)
html = html.replace(
  '.h-title{font-size:clamp(48px,5.8vw,78px);font-weight:800;line-height:.96;letter-spacing:-.035em;margin-bottom:36px;',
  '.h-title{font-size:clamp(48px,5.8vw,78px);font-weight:800;line-height:.96;letter-spacing:-.035em;margin-bottom:36px;color:#fff;'
);

// Update the italic "life." text
html = html.replace(
  /\.h-title i\{([^}]*?)color:var\(--g3\)/,
  '.h-title i{$1color:rgba(255,255,255,0.6)'
);

// Update h-desc (description paragraph)
html = html.replace(
  /\.h-desc\{([^}]*?)color:var\(--g3\)/,
  '.h-desc{$1color:rgba(255,255,255,0.6)'
);

// Update button styles - make "View Projects" white on dark
html = html.replace(
  /\.h-btn\{([^}]*?)background:var\(--black\);color:var\(--white\)/,
  '.h-btn{$1background:var(--white);color:var(--black)'
);

// Update outline button
html = html.replace(
  /\.h-btn-o\{([^}]*?)border:1\.5px solid var\(--g4\);color:var\(--black\)/,
  '.h-btn-o{$1border:1.5px solid rgba(255,255,255,0.3);color:#fff'
);

// Update stats text color
html = html.replace(
  /\.stat-num\{([^}]*?)color:var\(--black\)/,
  '.stat-num{$1color:#fff'
);
html = html.replace(
  /\.stat-label\{([^}]*?)color:var\(--g3\)/,
  '.stat-label{$1color:rgba(255,255,255,0.5)'
);

fs.writeFileSync('montenove.html', html);
console.log('Shader moved to hero background successfully');
console.log('File size:', (fs.statSync('montenove.html').size / 1024 / 1024).toFixed(2), 'MB');

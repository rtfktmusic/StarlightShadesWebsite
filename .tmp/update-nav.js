const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const files = [
  'home.html', 'about.html', 'roller-blinds.html', 'vertical-blinds.html',
  'curtains.html', 'plantation-shutters.html', 'awnings.html', 'automation.html',
  'indoor-blinds.html', 'outdoor-blinds.html', 'shutters.html'
];

files.forEach(file => {
  const fp = path.join(dir, file);
  if (!fs.existsSync(fp)) { console.log('SKIP (not found):', file); return; }
  let html = fs.readFileSync(fp, 'utf8');

  // 1. Add Gallery link to Indoor Blinds dropdown (if not already there)
  if (!html.includes('indoor-blinds-gallery.html')) {
    html = html.replace(
      /<a href="vertical-blinds\.html" class="block px-4 py-2 text-xs hover:bg-orange-50 hover:text-accent-dark">Vertical Blinds<\/a>\s*<\/div>/g,
      '<a href="vertical-blinds.html" class="block px-4 py-2 text-xs hover:bg-orange-50 hover:text-accent-dark">Vertical Blinds</a>\n            <a href="indoor-blinds-gallery.html" class="block px-4 py-2 text-xs hover:bg-orange-50 hover:text-accent-dark">Gallery</a>\n          </div>'
    );
  }

  // 2. Add Gallery link to Shutters dropdown (if not already there)
  if (!html.includes('shutters-gallery.html')) {
    html = html.replace(
      /<a href="plantation-shutters\.html" class="block px-4 py-2 text-xs hover:bg-orange-50 hover:text-accent-dark">Plantation Shutters<\/a>\s*<\/div>/g,
      '<a href="plantation-shutters.html" class="block px-4 py-2 text-xs hover:bg-orange-50 hover:text-accent-dark">Plantation Shutters</a>\n            <a href="shutters-gallery.html" class="block px-4 py-2 text-xs hover:bg-orange-50 hover:text-accent-dark">Gallery</a>\n          </div>'
    );
  }

  // 3. Add Gallery link to Outdoor Blinds dropdown (if not already there)
  if (!html.includes('outdoor-blinds-gallery.html')) {
    html = html.replace(
      /<a href="awnings\.html" class="block px-4 py-2 text-xs hover:bg-orange-50 hover:text-accent-dark">Awnings<\/a>\s*<\/div>/g,
      '<a href="awnings.html" class="block px-4 py-2 text-xs hover:bg-orange-50 hover:text-accent-dark">Awnings</a>\n            <a href="outdoor-blinds-gallery.html" class="block px-4 py-2 text-xs hover:bg-orange-50 hover:text-accent-dark">Gallery</a>\n          </div>'
    );
  }

  // 4. Convert Curtains plain link to dropdown (if it's still a plain link)
  if (!html.includes('curtains-gallery.html')) {
    const curtainsPlainLink = /<a href="curtains\.html" class="hover:text-accent-dark transition-colors">Curtains<\/a>/;
    if (curtainsPlainLink.test(html)) {
      html = html.replace(curtainsPlainLink,
        '<div class="relative nav-dropdown">\n' +
        '          <button class="hover:text-accent-dark transition-colors flex items-center gap-1">Curtains <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg></button>\n' +
        '          <div class="dropdown-menu absolute top-full left-0 bg-white shadow-lg rounded mt-1 py-1 w-40 z-50">\n' +
        '            <a href="curtains.html" class="block px-4 py-2 text-xs hover:bg-orange-50 hover:text-accent-dark">Curtains</a>\n' +
        '            <a href="curtains-gallery.html" class="block px-4 py-2 text-xs hover:bg-orange-50 hover:text-accent-dark">Gallery</a>\n' +
        '          </div>\n' +
        '        </div>'
      );
    }
  }

  fs.writeFileSync(fp, html, 'utf8');
  console.log('UPDATED:', file);
});

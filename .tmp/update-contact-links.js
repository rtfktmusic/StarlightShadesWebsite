const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const files = [
  'home.html', 'about.html', 'roller-blinds.html', 'vertical-blinds.html',
  'curtains.html', 'plantation-shutters.html', 'awnings.html', 'automation.html',
  'indoor-blinds.html', 'outdoor-blinds.html', 'shutters.html',
  'indoor-blinds-gallery.html', 'curtains-gallery.html', 'shutters-gallery.html', 'outdoor-blinds-gallery.html'
];

files.forEach(file => {
  const fp = path.join(dir, file);
  if (!fs.existsSync(fp)) { console.log('SKIP:', file); return; }
  let html = fs.readFileSync(fp, 'utf8');
  let changed = false;

  // Update nav CTA button: href="#contact" -> href="contact.html"
  const navCta = /(<a href=")#contact(" class="bg-accent text-white text-sm font-semibold px-5 py-2\.5 rounded-full)/g;
  if (navCta.test(html)) {
    html = html.replace(navCta, '$1contact.html$2');
    changed = true;
  }

  // Update floating chat button: href="#contact" -> href="contact.html"
  const chatBtn = /(<a href=")#contact(" class="fixed bottom-6 right-6 bg-accent)/g;
  if (chatBtn.test(html)) {
    html = html.replace(chatBtn, '$1contact.html$2');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fp, html, 'utf8');
    console.log('UPDATED:', file);
  } else {
    console.log('NO CHANGE:', file);
  }
});

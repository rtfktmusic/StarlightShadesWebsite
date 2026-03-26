const fs = require('fs');
let html = fs.readFileSync('montenove.html', 'utf-8');
const logoB64 = fs.readFileSync('.tmp/logo-b64.txt', 'utf-8').trim();

// 1. Replace logo image with new one (same height, no background/border)
const oldLogoRegex = /<a href="#"><img src="data:image\/png;base64,[^"]*" alt="Montenove" style="height:20px;display:block"><\/a>/;
html = html.replace(oldLogoRegex, `<a href="#"><img src="data:image/jpeg;base64,${logoB64}" alt="Montenove" style="height:20px;display:block;border:none;background:none;"></a>`);

// 2. Update nav CSS - transparent by default, hidden at top, visible on scroll down
// Replace existing nav style
html = html.replace(
  'nav{position:fixed;top:0;left:0;right:0;z-index:400;display:flex;justify-content:space-between;align-items:center;padding:28px 60px;background:rgba(249,249,249,.92);backdrop-filter:blur(18px);border-bottom:1px solid transparent;transition:border-color .3s}',
  'nav{position:fixed;top:0;left:0;right:0;z-index:400;display:flex;justify-content:space-between;align-items:center;padding:28px 60px;background:transparent;backdrop-filter:none;border-bottom:1px solid transparent;transition:transform .4s ease,background .4s ease,backdrop-filter .4s ease;transform:translateY(0)}'
);

// 3. Add nav scrolled class and hide logic via style tag
// Add CSS for .nav-scrolled and .nav-hidden states
const navStyles = `
nav.nav-scrolled{background:rgba(249,249,249,.92);backdrop-filter:blur(18px)}
nav.nav-hidden{transform:translateY(-100%)}
`;

// Insert after the existing nav style line
html = html.replace(
  'nav.nav-scrolled{background:rgba(249,249,249,.92);backdrop-filter:blur(18px)}',
  ''
); // clean up if re-run

html = html.replace(
  'nav.nav-hidden{transform:translateY(-100%)}',
  ''
); // clean up if re-run

// Add the new styles before </style>
html = html.replace('</style>', navStyles + '</style>');

// 4. Add scroll detection script before </body>
const scrollScript = `
<script>
(function(){
  var nav = document.getElementById('nav');
  var lastY = 0;
  var ticking = false;

  function onScroll(){
    var y = window.pageYOffset || document.documentElement.scrollTop;

    if(y <= 80){
      // At top - transparent, visible
      nav.classList.remove('nav-scrolled');
      nav.classList.remove('nav-hidden');
    } else if(y > lastY && y > 200){
      // Scrolling down past 200px - hide
      nav.classList.add('nav-hidden');
      nav.classList.remove('nav-scrolled');
    } else if(y < lastY){
      // Scrolling up - show with background
      nav.classList.remove('nav-hidden');
      nav.classList.add('nav-scrolled');
    }

    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', function(){
    if(!ticking){
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  });
})();
</script>`;

html = html.replace('</body>', scrollScript + '\n</body>');

// 5. Change email
html = html.replace('Jad@montenove.com.au', 'jad@montenove.au');

fs.writeFileSync('montenove.html', html);
console.log('Nav, logo, and email updated successfully');

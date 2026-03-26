const fs = require('fs');
let html = fs.readFileSync('montenove.html', 'utf-8');
const logoB64 = fs.readFileSync('.tmp/logo2-b64.txt', 'utf-8').trim();

// 1. Replace nav logo with new PNG (transparent bg, so no need for mix-blend-mode)
// Current size is 26px, 40% bigger = ~36px
html = html.replace(
  /<a href="#"><img src="data:image\/jpeg;base64,[^"]*" alt="Montenove" style="[^"]*"><\/a>/,
  `<a href="#"><img src="data:image/png;base64,${logoB64}" alt="Montenove" style="height:36px;display:block;border:none;background:none;filter:invert(1);"></a>`
);

// 2. Fix scroll behavior - show nav on scroll down AND up, hide only at top
// Remove old scroll script
html = html.replace(
  /\n<script>\n\(function\(\)\{\n  var nav = document\.getElementById\('nav'\);\n  var lastY = 0;\n  var ticking = false;\n\n  function onScroll\(\)\{[\s\S]*?\}\n\}\)\(\);\n<\/script>/,
  ''
);

// Add new scroll script
const scrollScript = `
<script>
(function(){
  var nav = document.getElementById('nav');
  var ticking = false;

  function onScroll(){
    var y = window.pageYOffset || document.documentElement.scrollTop;

    if(y <= 80){
      // At top - transparent, no background
      nav.classList.remove('nav-scrolled');
      nav.classList.remove('nav-hidden');
    } else {
      // Scrolled past top - show with background
      nav.classList.add('nav-scrolled');
      nav.classList.remove('nav-hidden');
    }

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

// 3. Make footer Montenove logo link to top
// Find the footer logo and wrap/update its link
html = html.replace(
  /<div class="f-logo"><img/,
  '<div class="f-logo"><a href="#" onclick="window.scrollTo({top:0,behavior:\'smooth\'});return false;"><img'
);
// Close the anchor tag after the img
html = html.replace(
  /(<div class="f-logo"><a[^>]*><img[^>]*>)/,
  '$1</a>'
);

fs.writeFileSync('montenove.html', html);
console.log('Logo, nav scroll, and footer link updated');

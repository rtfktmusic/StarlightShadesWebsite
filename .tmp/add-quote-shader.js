const fs = require('fs');
let html = fs.readFileSync('montenove.html', 'utf-8');

// 1. Add position:relative to .quote so canvas can sit behind content
html = html.replace(
  '.quote{background:var(--black);padding:110px 80px;display:flex;align-items:center;justify-content:center;text-align:center}',
  '.quote{background:var(--black);padding:110px 80px;display:flex;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden}'
);

// 2. Add z-index to .q-inner so it sits above the canvas
html = html.replace(
  '<div class="q-inner rv on">',
  '<div class="q-inner rv on" style="position:relative;z-index:2;">'
);

// 3. Add a second canvas inside the quote section
html = html.replace(
  '<div class="quote">',
  '<div class="quote">\n  <canvas id="shader-bg2" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;"></canvas>'
);

// 4. Add the second shader init script - find the existing })(); closing and add after it
// We'll add a second IIFE that targets shader-bg2
const secondShader = `
<script>
(function(){
  var canvas = document.getElementById('shader-bg2');
  if(!canvas) return;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  var fragShader = [
    'uniform float uTime;',
    'uniform vec2 uResolution;',
    'varying vec2 vUv;',
    '',
    'vec3 mod289v3(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}',
    'vec2 mod289v2(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}',
    'vec3 permute(vec3 x){return mod289v3(((x*34.0)+1.0)*x);}',
    '',
    'float snoise(vec2 v){',
    '  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);',
    '  vec2 i=floor(v+dot(v,C.yy));',
    '  vec2 x0=v-i+dot(i,C.xx);',
    '  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);',
    '  vec4 x12=x0.xyxy+C.xxzz;',
    '  x12.xy-=i1;',
    '  i=mod289v2(i);',
    '  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));',
    '  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);',
    '  m=m*m;m=m*m;',
    '  vec3 x=2.0*fract(p*C.www)-1.0;',
    '  vec3 h=abs(x)-0.5;',
    '  vec3 ox=floor(x+0.5);',
    '  vec3 a0=x-ox;',
    '  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);',
    '  vec3 g;',
    '  g.x=a0.x*x0.x+h.x*x0.y;',
    '  g.yz=a0.yz*x12.xz+h.yz*x12.yw;',
    '  return 130.0*dot(m,g);',
    '}',
    '',
    'void main(){',
    '  vec2 uv=vUv;',
    '  float t=uTime*0.35;',
    '',
    '  float warpX=snoise(uv*1.5+vec2(t*0.2,-t*0.15))*0.15;',
    '  float warpY=snoise(uv*1.5+vec2(-t*0.18,t*0.22)+50.0)*0.15;',
    '  vec2 warped=uv+vec2(warpX,warpY);',
    '',
    '  float sweep=snoise(vec2(warped.x*0.6-warped.y*0.9+t*0.4, warped.y*0.5+warped.x*0.3+t*0.35))*1.0;',
    '  sweep+=snoise(vec2(warped.x*1.2+t*0.3, warped.y*0.8-t*0.35))*0.5;',
    '',
    '  float broad=snoise(vec2(warped.x*0.4+t*0.25, warped.y*0.5-t*0.2))*0.8;',
    '  broad+=snoise(vec2(warped.x*0.25-t*0.22, warped.y*0.35+t*0.28))*0.6;',
    '',
    '  float flow=snoise(vec2(warped.x*0.7+warped.y*0.5+t*0.45, warped.y*0.6-warped.x*0.3+t*0.3))*0.4;',
    '',
    '  float detail=snoise(warped*2.5+vec2(t*0.35,-t*0.25))*0.12;',
    '',
    '  float noise=sweep+broad+flow+detail;',
    '',
    '  float blend=smoothstep(-1.8,1.8,noise);',
    '',
    '  vec3 black=vec3(0.0,0.0,0.0);',
    '  vec3 darkGray=vec3(0.12,0.12,0.12);',
    '  vec3 midGray=vec3(0.38,0.38,0.38);',
    '  vec3 gray=vec3(0.55,0.55,0.55);',
    '  vec3 lightGray=vec3(0.72,0.72,0.72);',
    '  vec3 white=vec3(0.92,0.92,0.92);',
    '',
    '  vec3 color=mix(black,darkGray,smoothstep(0.0,0.15,blend));',
    '  color=mix(color,midGray,smoothstep(0.15,0.35,blend));',
    '  color=mix(color,gray,smoothstep(0.3,0.5,blend));',
    '  color=mix(color,lightGray,smoothstep(0.5,0.65,blend));',
    '  color=mix(color,white,smoothstep(0.65,0.85,blend));',
    '',
    '  gl_FragColor=vec4(color,1.0);',
    '}'
  ].join('\\n');

  var vertShader = [
    'varying vec2 vUv;',
    'void main(){',
    '  vUv=uv;',
    '  gl_Position=vec4(position,1.0);',
    '}'
  ].join('\\n');

  var uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2() }
  };

  var material = new THREE.ShaderMaterial({
    vertexShader: vertShader,
    fragmentShader: fragShader,
    uniforms: uniforms
  });

  var geometry = new THREE.PlaneGeometry(2, 2);
  scene.add(new THREE.Mesh(geometry, material));

  function resize(){
    var w = canvas.parentElement.offsetWidth;
    var h = canvas.parentElement.offsetHeight;
    renderer.setSize(w, h);
    uniforms.uResolution.value.set(w, h);
  }

  function animate(time){
    uniforms.uTime.value = time * 0.001;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(animate);
})();
</script>`;

// Insert the second shader script right before </body>
html = html.replace('</body>', secondShader + '\n</body>');

fs.writeFileSync('montenove.html', html);
console.log('Quote section shader added successfully');

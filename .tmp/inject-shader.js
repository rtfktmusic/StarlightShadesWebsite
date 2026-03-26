const fs = require('fs');
let html = fs.readFileSync('montenove.html', 'utf-8');

const shaderScript = `
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script>
<script>
(function(){
  var canvas = document.getElementById('shader-bg');
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
    '  float t=uTime*0.15;',
    '  float n1=snoise(uv*2.0+vec2(t*0.4,t*0.3))*0.5;',
    '  float n2=snoise(uv*3.5+vec2(-t*0.3,t*0.5))*0.35;',
    '  float n3=snoise(uv*5.0+vec2(t*0.2,-t*0.4))*0.25;',
    '  float n4=snoise(uv*1.2+vec2(t*0.15,t*0.1))*0.6;',
    '  float noise=n1+n2+n3+n4;',
    '  vec3 c1=vec3(0.0,0.0,0.0);',
    '  vec3 c2=vec3(0.102,0.102,0.102);',
    '  vec3 c3=vec3(0.2,0.2,0.2);',
    '  vec3 c4=vec3(0.95,0.95,0.95);',
    '  float blend=noise*0.5+0.5;',
    '  vec3 color=mix(c1,c2,smoothstep(0.0,0.35,blend));',
    '  color=mix(color,c3,smoothstep(0.3,0.6,blend));',
    '  color=mix(color,c4,smoothstep(0.75,1.0,blend)*0.15);',
    '  float vig=1.0-length((uv-0.5)*1.2)*0.3;',
    '  color*=vig;',
    '  float hl=snoise(uv*1.8+vec2(t*0.25,-t*0.15));',
    '  color+=vec3(1.0)*smoothstep(0.6,0.9,hl)*0.06;',
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
<\/script>`;

// First, restore from the original if the previous inject was corrupted
// Remove any previously injected shader scripts
html = html.replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js[\s\S]*?<\/script>\s*<\/body>/, '</body>');

html = html.replace('</body>', shaderScript + '\n</body>');
fs.writeFileSync('montenove.html', html);
console.log('Shader script added successfully');
console.log('File size:', (fs.statSync('montenove.html').size / 1024 / 1024).toFixed(2), 'MB');

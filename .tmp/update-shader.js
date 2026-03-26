const fs = require('fs');
let html = fs.readFileSync('montenove.html', 'utf-8');

// Replace the existing shader script with an updated one matching the reference pattern
const oldShaderStart = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js">';
const oldShaderEnd = '})();\n</script>';

const startIdx = html.indexOf(oldShaderStart);
const endIdx = html.indexOf(oldShaderEnd, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.log('Could not find shader script block');
  process.exit(1);
}

const before = html.substring(0, startIdx);
const after = html.substring(endIdx + oldShaderEnd.length);

const newShader = `<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
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
    '  float t=uTime*0.12;',
    '',
    '  // Large sweeping diagonal flow - matching reference pattern',
    '  float sweep=snoise(vec2(uv.x*0.8-uv.y*1.2+t*0.3, uv.y*0.6+uv.x*0.4+t*0.2))*1.0;',
    '  sweep+=snoise(vec2(uv.x*1.5+t*0.15, uv.y*1.0-t*0.25))*0.5;',
    '',
    '  // Broad flowing shapes',
    '  float broad=snoise(vec2(uv.x*0.5+t*0.1, uv.y*0.7-t*0.08))*0.8;',
    '  broad+=snoise(vec2(uv.x*0.3-t*0.12, uv.y*0.4+t*0.15))*0.6;',
    '',
    '  // Fine detail layer',
    '  float detail=snoise(uv*3.0+vec2(t*0.2,-t*0.15))*0.15;',
    '',
    '  float noise=sweep+broad+detail;',
    '',
    '  // Normalize to 0-1 range with wider spread',
    '  float blend=smoothstep(-1.8,1.8,noise);',
    '',
    '  // Color mixing: heavy black and white with smooth transition',
    '  vec3 black=vec3(0.0,0.0,0.0);',
    '  vec3 darkGray=vec3(0.08,0.08,0.08);',
    '  vec3 midGray=vec3(0.35,0.35,0.35);',
    '  vec3 lightGray=vec3(0.7,0.7,0.7);',
    '  vec3 white=vec3(0.92,0.92,0.92);',
    '',
    '  vec3 color=mix(black,darkGray,smoothstep(0.0,0.2,blend));',
    '  color=mix(color,midGray,smoothstep(0.2,0.45,blend));',
    '  color=mix(color,lightGray,smoothstep(0.45,0.65,blend));',
    '  color=mix(color,white,smoothstep(0.6,0.85,blend));',
    '',
    '  // Subtle warm tint in the light areas',
    '  color=mix(color,vec3(0.95,0.93,0.9),smoothstep(0.7,1.0,blend)*0.15);',
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

html = before + newShader + after;
fs.writeFileSync('montenove.html', html);
console.log('Shader updated successfully');
console.log('File size:', (fs.statSync('montenove.html').size / 1024 / 1024).toFixed(2), 'MB');

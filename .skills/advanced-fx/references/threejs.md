# Three.js Patterns

CDN: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`

## 1. Minimal Scene Scaffold

Every Three.js scene starts here. Don't skip any step.

```js
(function() {
  // 1. Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
  document.body.prepend(renderer.domElement);

  // 2. Scene + Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // 3. Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  // 4. Add your objects here
  // ...

  // 5. Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // 6. Animation loop
  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    // update objects here using t
    renderer.render(scene, camera);
  })();
})();
```

## 2. Floating Particle Cloud

3,000 particles drifting in 3D space. Responds to mouse rotation.

```js
// Inside the scaffold above, replace step 4:

const count = 3000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(count * 3);
for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 12;
}
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
  color: 0x6366f1,  // use your accent color
  size: 0.025,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.7,
});
const particles = new THREE.Points(geometry, material);
scene.add(particles);

// Mouse interaction
let mx = 0, my = 0;
document.addEventListener('mousemove', e => {
  mx = (e.clientX / window.innerWidth  - 0.5) * 2;
  my = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

// In animate loop:
// particles.rotation.y = t * 0.04 + mx * 0.3;
// particles.rotation.x = t * 0.02 + my * 0.2;
```

## 3. Icosphere / Wireframe Globe

A slow-rotating geometric object — great for hero backgrounds of dev tools.

```js
const geo = new THREE.IcosahedronGeometry(2, 1);
const mat = new THREE.MeshStandardMaterial({
  color: 0x4f46e5,
  wireframe: true,
  transparent: true,
  opacity: 0.15,
});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

// Solid inner sphere (glowing core)
const core = new THREE.Mesh(
  new THREE.SphereGeometry(1.8, 32, 32),
  new THREE.MeshStandardMaterial({
    color: 0x1e1b4b,
    transparent: true,
    opacity: 0.9,
  })
);
scene.add(core);

// In animate loop:
// mesh.rotation.y = t * 0.08;
// mesh.rotation.x = t * 0.04;
```

## 4. Shader Background (noise gradient)

The most impressive background: procedural shader animation. No geometry — just a full-screen quad with a custom fragment shader.

```js
const shaderGeo = new THREE.PlaneGeometry(2, 2);
const shaderMat = new THREE.ShaderMaterial({
  uniforms: {
    uTime:       { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uColor1:     { value: new THREE.Color(0x0d0b1e) },
    uColor2:     { value: new THREE.Color(0x1a0a3d) },
    uAccent:     { value: new THREE.Color(0x4f46e5) },
  },
  vertexShader: `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uAccent;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1,0)), f.x),
        mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
        f.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0; float a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p = p * 2.0 + 1.7;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uResolution.xy;
      vec2 p = uv * 3.0;

      float n = fbm(p + uTime * 0.06);
      float n2 = fbm(p * 1.5 - uTime * 0.04 + vec2(3.2, 1.8));

      vec3 col = mix(uColor1, uColor2, n);
      col = mix(col, uAccent * 0.3, n2 * 0.4);

      // Vignette
      float d = length(uv - 0.5);
      col *= 1.0 - d * 1.2;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
  depthWrite: false,
});

const quad = new THREE.Mesh(shaderGeo, shaderMat);
scene.add(quad);

// In animate loop: shaderMat.uniforms.uTime.value = t;
// In resize: shaderMat.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
```

## 5. Mouse-Following 3D Object

The object rotates to "look at" the cursor smoothly.

```js
let targetRX = 0, targetRY = 0;
document.addEventListener('mousemove', e => {
  targetRY = (e.clientX / window.innerWidth  - 0.5) * Math.PI * 0.5;
  targetRX = (e.clientY / window.innerHeight - 0.5) * Math.PI * 0.3;
}, { passive: true });

// In animate loop (lerp for smoothness):
// mesh.rotation.y += (targetRY - mesh.rotation.y) * 0.05;
// mesh.rotation.x += (targetRX - mesh.rotation.x) * 0.05;
```

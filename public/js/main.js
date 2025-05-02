/* -----------------------------------------------------------
 *  THREE-JS 3-D MODEL LOADER  •  ES-module + import-map
 *  Three r157  •  OrbitControls  •  GLB (no external buffers)
 * --------------------------------------------------------- */

import * as THREE        from 'three';
import { OrbitControls } from 'three/examples/controls/OrbitControls.js';
import { GLTFLoader }    from 'three/examples/loaders/GLTFLoader.js';

console.log('🟢 JS module loaded');

/* Renderer */
const canvas   = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

/* Scene & Camera */
const scene  = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

/* OrbitControls */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* Lighting */
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(5, 10, 7.5);
scene.add(dir);

/* Load GLB model */
let mixer;
const loader = new GLTFLoader();

loader.load(
  'truffle-man.glb',               // <-- your .glb filename
  (gltf) => {
    console.log('✅ GLTF/GLB loaded');
    const model = gltf.scene;
    scene.add(model);

    // Auto-frame camera
    const box    = new THREE.Box3().setFromObject(model);
    const size   = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    camera.position.copy(center).add(new THREE.Vector3(0, size * 0.5, size));
    camera.near = size / 100;
    camera.far  = size * 100;
    camera.updateProjectionMatrix();
    camera.lookAt(center);

    // Play animations
    if (gltf.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach(clip => mixer.clipAction(clip).play());
    }
  },
  (xhr) => console.log(`Loading: ${(xhr.loaded / xhr.total * 100).toFixed(1)}%`),
  (err) => console.error('GLTF loading error:', err)
);

/* Handle resize */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* Render loop */
const clock = new THREE.Clock();
(function animate() {
  requestAnimationFrame(animate);
  if (mixer) mixer.update(clock.getDelta());
  controls.update();
  renderer.render(scene, camera);
})();

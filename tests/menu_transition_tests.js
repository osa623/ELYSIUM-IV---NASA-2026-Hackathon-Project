const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
let passed = 0;
function check(label, condition) {
  assert.ok(condition, label);
  passed += 1;
  console.log(`PASS | ${label}`);
}
const image = path.join(root, 'public/assets/images/Astronaut and Rover at Martian Sunset.png');
const menu = fs.readFileSync(path.join(root, 'src/components/menu/MainMenu.tsx'), 'utf8');
const menuCss = fs.readFileSync(path.join(root, 'src/components/menu/MainMenu.css'), 'utf8');
const transition = fs.readFileSync(path.join(root, 'src/components/loading/TransitionLoadingScreen.tsx'), 'utf8');
const assets = fs.readFileSync(path.join(root, 'src/core/AssetLoading.ts'), 'utf8');
check('the requested full-screen menu image exists', fs.statSync(image).size > 0);
check('main menu uses the supplied image as a cover background', menuCss.includes('Astronaut%20and%20Rover%20at%20Martian%20Sunset.png') && menuCss.includes('center/cover'));
check('main menu no longer creates a canvas globe or fallback Mars sphere', !menu.includes('new THREE.WebGLRenderer') && !menu.includes('clonePreparedModel("/assets/models/mars.glb")') && !menu.includes('SphereGeometry'));
check('transition loading screen renders the existing Mars model', transition.includes('clonePreparedModel("/assets/models/mars.glb")'));
check('Mars model is prepared by the asset loader before transitions', assets.includes('model.transition-mars') && assets.includes('"/assets/models/mars.glb"'));
console.log(`RESULT | ${passed}/5 menu and transition cases passed`);

const assert = require('node:assert/strict');
const THREE = require('three');
const { MissionManager } = require('../dist/core/MissionManager.js');
const {
  advanceNighttimeGameplayClock,
  createMasterTerrainLightClusters,
  isMasterTerrainNighttimeEligible,
  NIGHTTIME_DURATION_SECONDS,
  setTerrainNightLightsEnabled
} = require('../dist/core/MasterTerrainEnvironment.js');

const base = new MissionManager().getState();
function stateFor(sol) { return { ...structuredClone(base), currentDay: sol }; }
let executed = 0;
function check(name, fn) { fn(); executed += 1; console.log(`PASS ${name}`); }

check('SOL 1 uses the daytime environment', () => assert.equal(isMasterTerrainNighttimeEligible(stateFor(1), false), false));
check('SOL 2 starts in the nighttime environment before its tasks are complete', () => assert.equal(isMasterTerrainNighttimeEligible(stateFor(2), false), true));
check('SOL 3 returns to the daytime environment', () => assert.equal(isMasterTerrainNighttimeEligible(stateFor(3), false), false));
check('Mission transition temporarily disables the nighttime environment', () => assert.equal(isMasterTerrainNighttimeEligible(stateFor(2), true), false));
check('Unauthorized mission numbers cannot enable nighttime', () => assert.equal(isMasterTerrainNighttimeEligible(stateFor(4), false), false));
check('Active gameplay time advances the Sol 2 clock', () => assert.deepEqual(advanceNighttimeGameplayClock(30, 0.5, false), { elapsedSeconds: 30.5, expired: false }));
check('Paused time does not advance the night clock', () => assert.deepEqual(advanceNighttimeGameplayClock(30, 900, true), { elapsedSeconds: 30, expired: false }));
check('Night clock expires at its configured boundary', () => assert.deepEqual(advanceNighttimeGameplayClock(NIGHTTIME_DURATION_SECONDS - 1, 1, false), { elapsedSeconds: NIGHTTIME_DURATION_SECONDS, expired: true }));
check('Invalid timer delta is ignored', () => assert.deepEqual(advanceNighttimeGameplayClock(30, Number.NaN, false), { elapsedSeconds: 30, expired: false }));
check('Authored terrain markers create and toggle light clusters without duplicates', () => {
  const terrain = new THREE.Group();
  const panel = new THREE.Group(); panel.name = 'Light_Panel'; terrain.add(panel);
  const marker = new THREE.Group(); marker.name = 'reallight01'; marker.position.set(2, 20, 3); panel.add(marker);
  const habitat = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 10), new THREE.MeshBasicMaterial()); habitat.name = 'Habitat_Zone'; habitat.position.set(0, 2, 0); terrain.add(habitat);
  const owner = new THREE.Group(); terrain.add(owner); terrain.updateWorldMatrix(true, true);
  const first = createMasterTerrainLightClusters(terrain, owner);
  assert.equal(first.lights.length, 1);
  assert.equal(first.lights[0].visible, false);
  assert.ok(first.lights[0].target.getWorldPosition(new THREE.Vector3()).y < marker.getWorldPosition(new THREE.Vector3()).y);
  setTerrainNightLightsEnabled(first, true);
  assert.equal(first.lights[0].visible, true);
  const second = createMasterTerrainLightClusters(terrain, owner);
  let markers = 0; terrain.traverse(node => { if (node.name.endsWith('_NightSpot')) markers += 1; });
  assert.equal(second.lights.length, 1);
  assert.equal(markers, 1);
  habitat.geometry.dispose(); habitat.material.dispose();
});

console.log(`RESULT ${executed} executed, ${executed} passed, 0 failed`);

const assert = require("node:assert/strict");
const storage = new Map();
global.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key),
  clear: () => storage.clear()
};

const { DAYS_CONFIG, MissionManager } = require("../dist/core/MissionManager.js");
const { REQUIRED_ASSETS } = require("../dist/core/AssetLoading.js");
const { Sol01MissionManager } = require("../dist/missions/SOL_01/Sol01MissionManager.js");
const { Sol02MissionManager } = require("../dist/missions/SOL_02/Sol02MissionManager.js");
const { Sol03MissionManager } = require("../dist/missions/SOL_03/Sol03MissionManager.js");

assert.deepEqual(Object.keys(DAYS_CONFIG).map(Number), [1, 2, 3], "only the three authorized missions are registered");
assert.deepEqual(REQUIRED_ASSETS.map(asset => asset.path).filter(path => /SOL_0[1-3]_Terrain\.glb$/.test(path)), [
  "/assets/models/ELYSIUM_IV_SOL_01_Terrain.glb",
  "/assets/models/ELYSIUM_IV_SOL_02_Terrain.glb",
  "/assets/models/ELYSIUM_IV_SOL_03_Terrain.glb"
], "the required terrain manifest contains exactly Sol 1–3");

storage.set("phobosia_mission_progress_v4", JSON.stringify({ currentDay: 4, completedStepIds: [] }));
assert.equal(new MissionManager().getState().currentDay, 1, "an out-of-scope saved Sol is rejected and starts at Sol 1");
storage.clear();

const sol1 = new Sol01MissionManager();
sol1.resetMission();
assert.equal(sol1.onPlayerEnterRover(), true);
assert.equal(sol1.saveInitialMissionLog("Initial mission log."), true);
assert.equal(sol1.saveEnvironmentObservation("Atmosphere checked."), true);
assert.equal(sol1.confirmToolChecklist(sol1.toolChecklist.map(tool => tool.id)), true);
assert.equal(sol1.saveResourceObservation("Water and nutrition checked."), true);
assert.equal(sol1.onReach2ndCheckpoint(), true);
assert.equal(sol1.saveSecondObservationLog("Second observation."), true);
assert.equal(sol1.onReachFinishingPoint(), true);
assert.equal(sol1.sol01Completed, true, "Sol 1 marks complete after the required sequence");

const sol2 = new Sol02MissionManager();
sol2.resetMission();
assert.equal(sol2.onCompleteSol02(), false, "Sol 2 cannot complete before its sample and report tasks");
assert.equal(sol2.onPlayerEnterRover(), true);
assert.equal(sol2.onReviewPreviousRecords(), true);
assert.equal(sol2.confirmBotanInspection("BOTAN status checked."), true);
assert.equal(sol2.saveNightEnvironmentObservation("Night environment checked."), true);
assert.equal(sol2.confirmToolChecklist(sol2.toolChecklist.map(tool => tool.id)), true);
assert.equal(sol2.onReachCheckpoint(), true);
assert.equal(sol2.collectSoilSample({ researcher_notes: "Sample observations recorded." }), true);
assert.equal(sol2.onReturnToRoverWithSample(), true);
assert.equal(sol2.confirmSampleTransferToRack(), true);
assert.equal(sol2.saveScientificReport("Soil analysis limitations and findings recorded."), true);
assert.equal(sol2.onReachFinishingPoint(), true);
assert.equal(sol2.onCompleteSol02(), true, "Sol 2 completes after all twelve ordered tasks");
assert.equal(sol2.completedTaskIds.size, 12);

const sol3 = new Sol03MissionManager();
assert.equal(sol3.canCompleteJourney(), false, "Complete Journey remains locked before its tasks, photos, and reports");
assert.equal(sol3.completeJourney(), false, "incomplete Sol 3 cannot complete the campaign");
assert.equal(sol3.onPlayerEnterRover(), true);
assert.equal(sol3.onReviewPreviousRecords(), true);
assert.equal(sol3.confirmWaterNutrition("Water and nutrition inspected."), true);
assert.equal(sol3.saveEnvironmentObservation("Environment and oxygen checked."), true);
assert.equal(sol3.confirmToolChecklist(sol3.toolChecklist.map(tool => tool.id)), true);
assert.equal(sol3.onReachCheckpoint(), true);
assert.equal(sol3.onExitCameraCheckPhotos(4), true);
assert.equal(sol3.onReturnToRover(), true);
assert.equal(sol3.onReviewPhotoGallery(), true);
assert.equal(sol3.saveResearchLog({ heading: "Ridge review", mountainObservations: "Terrain profile recorded.", photoReferences: "Four saved observations.", mountainHeading: "North", temperature: "-40 C", environmentalConditions: "Clear", researcherNotes: "Limits recorded." }), true);
assert.equal(sol3.onReachFinishingPoint(), true);
assert.equal(sol3.saveFinalReport({ heading: "Expedition summary", executiveSummary: "Three Sol mission record.", sol01Evaluation: "Complete", sol02Evaluation: "Complete", sol03Evaluation: "Complete", recommendations: "Continue observations." }), true);
assert.equal(sol3.confirmFinalWater("No anomaly."), true);
assert.equal(sol3.confirmFinalEnvironment("No anomaly."), true);
assert.equal(sol3.confirmFinalTools(), true);
sol3.cachedPhotos = Array.from({ length: 4 }, (_, index) => ({ id: `test-photo-${index}` }));
assert.equal(sol3.canCompleteJourney(), true, "All fifteen Sol 3 tasks, four photos, and final records unlock completion");
assert.equal(sol3.completeJourney(), true, "Sol 3 completes the three-Sol journey");
assert.equal(sol3.expeditionCompleted, true);

console.log("Three-Sol scope and progression guard checks passed.");

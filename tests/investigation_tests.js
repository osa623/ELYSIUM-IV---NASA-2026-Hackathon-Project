const assert = require('node:assert/strict');
const storage = new Map();
global.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key)
};

const { MissionManager, DAYS_CONFIG, MASTER_TERRAIN_TARGETS, SOL2_INVESTIGATION_RULES } = require('../dist/core/MissionManager.js');
const { SOL3_TRAINING_DATASETS } = require('../dist/systems/investigation/InvestigationCatalog.js');
const manager = new MissionManager();
manager.resetProgress();

DAYS_CONFIG[1].steps.forEach(step => assert.equal(manager.completeStep(step.stepId), true));
assert.equal(manager.advanceDay(true).newDay, 2);
assert.equal(manager.canRestAndAdvance().canAdvance, false, 'Sol 2 cannot advance without its records');
assert.equal(manager.submitInvestigation({ taskId: 'SOL04_MISSION_CONTEXT', evidenceReferences: [], classification: 'context_reviewed', rationale: 'Out of scope task', procedureChecks: [] }).success, false, 'Sol 4 tasks are rejected');
for (const step of DAYS_CONFIG[2].steps) assert.equal(manager.completeStep(step.stepId), true);

for (const taskId of Object.keys(SOL2_INVESTIGATION_RULES)) {
  const rule = SOL2_INVESTIGATION_RULES[taskId];
  assert(rule, `Sol 2 task has an authoritative rule: ${taskId}`);
  const result = manager.submitInvestigation({
    taskId,
    evidenceReferences: rule.logIds.slice(0, 1),
    classification: 'insufficient_evidence',
    rationale: 'Reference limits and observation timing are incomplete.',
    limitations: ['Source values are unavailable or simulated.'],
    procedureChecks: Array.from({ length: rule.procedureCount }, (_, index) => `${taskId}:${index}`)
  });
  assert.equal(result.success, true, result.message);
}
const readinessRefs = manager.getInvestigationRecords().map(record => record.id);
assert.equal(manager.submitInvestigation({
  taskId: 'SOL02_READINESS_ASSESSMENT', evidenceReferences: readinessRefs,
  classification: 'undetermined', rationale: 'Evidence limits prevent a readiness decision.',
  limitations: ['Approved system reference limits are not provided.'], procedureChecks: []
}).success, true);
assert.equal(manager.advanceDay(true).newDay, 3);

const submit3 = (taskId, evidenceReferences, extra = {}) => manager.submitInvestigation({
  taskId, evidenceReferences, classification: 'insufficient_evidence',
  rationale: 'Use only the limited simulated mission metadata.',
  limitations: ['No external scientific measurements are included.'],
  procedureChecks: [`${taskId}:0`, `${taskId}:1`], ...extra
});
assert.equal(submit3('SOL03_MISSION_CONTEXT', ['SOL03-MISSION-CONTEXT']).success, true);
assert.equal(submit3('SOL03_OBSERVATION_SITE_REVIEW', MASTER_TERRAIN_TARGETS.slice(0, 2).map(target => `TARGET:${target.id}`)).success, false);
assert.equal(submit3('SOL03_OBSERVATION_SITE_REVIEW', MASTER_TERRAIN_TARGETS.map(target => `TARGET:${target.id}`)).success, true);
assert.equal(submit3('SOL03_SYSTEM_CONSTRAINTS', ['SOL03-COMMS-SYSTEMS']).success, true);
const target = MASTER_TERRAIN_TARGETS[0];
assert.equal(submit3('SOL03_SELECT_TARGET', [], { selectedTargetId: target.id, scientificQuestion: 'Which profile merits a future observation?' }).success, true);
const datasetId = SOL3_TRAINING_DATASETS[0].id;
assert.equal(submit3('SOL03_SELECT_DATASET', [`DATASET:${datasetId}`], { datasetId }).success, true);
const sol3Records = manager.getInvestigationRecords().filter(record => record.taskId.startsWith('SOL03_'));
assert.equal(manager.submitInvestigation({
  taskId: 'SOL03_SUBMIT_TARGET_RECORD', evidenceReferences: sol3Records.map(record => record.id),
  classification: 'proposal_submitted', rationale: 'A cautious proposal using available training metadata.',
  limitations: ['Metadata only; no validated terrain measurements.'], procedureChecks: [],
  selectedTargetId: target.id, datasetId, scientificQuestion: 'What context should a future observation examine?'
}).success, true);
assert.equal(manager.getSelectedSiteId(), target.id);
assert.equal(manager.advanceDay(true).success, false, 'Sol 3 is terminal; no Sol 4 progression exists');

console.log('Sol 2 and Sol 3 investigation validation checks passed.');

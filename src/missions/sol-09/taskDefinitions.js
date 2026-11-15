"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitialSol09Progress = exports.SOL09_TASKS = void 0;
exports.SOL09_TASKS = [
    { stepId: "SOL09_TASK_01", label: "Inspect Habitat Water and Nutrient Reserves", trigger: "HAB_WATER_NUTRITION_01" },
    { stepId: "SOL09_TASK_02", label: "Review the Sol 6 Cultivation Experiment", trigger: "LAB_CULTIVATION_01" },
    { stepId: "SOL09_TASK_03", label: "Inspect Cultivation Rack 01", trigger: "LAB_CULTIVATION_01" },
    { stepId: "SOL09_TASK_04", label: "Inspect Cultivation Rack 02", trigger: "LAB_CULTIVATION_01" },
    { stepId: "SOL09_TASK_05", label: "Diagnose the Main Water Supply", trigger: "Engineering_LifeSupport_Trigger" },
    { stepId: "SOL09_TASK_06", label: "Assess Main Water Supply Restoration", trigger: "Engineering_LifeSupport_Trigger" },
    { stepId: "SOL09_TASK_07", label: "Verify Irrigation for Both Racks", trigger: "LAB_CULTIVATION_01" },
    { stepId: "SOL09_TASK_08", label: "Verify Nutrient Distribution", trigger: "LAB_CULTIVATION_01" },
    { stepId: "SOL09_TASK_09", label: "Review Cultivation and Water-System Evidence", trigger: "LAB_CULTIVATION_01" },
    { stepId: "SOL09_TASK_10", label: "Submit the Sol 9 Report", trigger: "MC_MAIN_01" }
];
const createInitialSol09Progress = () => ({
    started: false,
    evidence: {},
    racks: {
        rack01: { inspection: null, irrigationResult: "not_tested", irrigationRecord: null },
        rack02: { inspection: null, irrigationResult: "not_tested", irrigationRecord: null }
    },
    water: { diagnosis: null, mainSupplyStatus: "unknown", restoration: null },
    nutrientVerification: null,
    report: null
});
exports.createInitialSol09Progress = createInitialSol09Progress;

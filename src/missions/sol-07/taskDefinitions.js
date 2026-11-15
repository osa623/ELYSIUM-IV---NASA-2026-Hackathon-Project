"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitialSol7Progress = exports.SOL07_TASKS = void 0;
/** Sol 7 dust-storm assessment tasks. Scene destinations reuse existing trigger mappings. */
exports.SOL07_TASKS = [
    { stepId: "SOL07_HABITAT_STORM_ALERT", label: "Review and acknowledge Dust Storm Alert", description: "Review the Habitat safety alert and acknowledge the temporary outdoor restriction.", targetTrigger: "HAB_MONITOR_01" },
    { stepId: "SOL07_MISSION_CONTROL_SYSTEMS", label: "Assess Mission Control systems", description: "Review power, communications, navigation and active warnings; classify unavailable and simulated data.", targetTrigger: "MC_SYSTEMS_01" },
    { stepId: "SOL07_CENTRAL_HUB_STATUS", label: "Assess Central Hub outpost status", description: "Review section availability and power distribution without changing it.", targetTrigger: "Module_Status_Display" },
    { stepId: "SOL07_VERIFY_EVA_LOCKDOWN", label: "Verify Airlock EVA lockdown", description: "Verify the storm restriction through the shared EVA access policy.", targetTrigger: "Airlock_Control_Console_Trigger" },
    { stepId: "SOL07_RESEARCH_POWER", label: "Assess research and cultivation power", description: "Review science power and the existing Sol 6 cultivation record without altering it.", targetTrigger: "LAB_RESEARCH_MONITORING_01" },
    { stepId: "SOL07_ENGINEERING_POWER", label: "Assess Engineering power systems", description: "Read the existing power-unit front-end and record the nine required power fields.", targetTrigger: "Engineering_PowerUnit_Trigger" },
    { stepId: "SOL07_SUBMIT_STORM_REPORT", label: "Submit impact report and end storm", description: "Submit a validated report covering Tasks 1–6. Successful validation ends the Sol 7 storm.", targetTrigger: "MC_NAVIGATION_01" }
];
const createInitialSol7Progress = () => ({ alertAcknowledged: false, reviewedScreens: [], screenReviewNotes: {}, assessments: {}, powerAssessment: null, report: null, stormEnded: false });
exports.createInitialSol7Progress = createInitialSol7Progress;

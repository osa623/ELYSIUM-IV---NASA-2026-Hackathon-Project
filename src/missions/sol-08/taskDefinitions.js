"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOL08_PUZZLE_CONNECTIONS = exports.createInitialSol08Progress = exports.SOL08_TASKS = void 0;
exports.validateSol08Connections = validateSol08Connections;
exports.SOL08_TASKS = [
    { stepId: "SOL08_REVIEW_POWER_FAILURE_ALERT", label: "Review critical power failure alert", trigger: "HAB_MONITOR_01" },
    { stepId: "SOL08_INSPECT_ENGINEERING_POWER_UNIT", label: "Inspect Engineering Power Unit", trigger: "Engineering_PowerUnit_Trigger" },
    { stepId: "SOL08_INSPECT_COMMUNICATION_FAILURE", label: "Inspect communication failure", trigger: "MC_SYSTEMS_01" },
    { stepId: "SOL08_PREPARE_EVA", label: "Prepare EVA suit", trigger: "Mars_Observation_Preparation_Trigger" },
    { stepId: "SOL08_REPAIR_SOLAR_PANEL_A", label: "Repair Solar Panel A", trigger: "PowerUnit_A" },
    { stepId: "SOL08_REPAIR_SOLAR_PANEL_B", label: "Repair Solar Panel B", trigger: "PowerUnit_B" },
    { stepId: "SOL08_REPAIR_MAIN_SOLAR_CONNECTION", label: "Repair main solar connection", trigger: "PowerUnit_AB_Main" },
    { stepId: "SOL08_RESTORE_MAIN_POWER_SUPPLY", label: "Restore main power supply", trigger: "Engineering_PowerUnit_Trigger" },
    { stepId: "SOL08_VERIFY_POWER_RECOVERY", label: "Verify outpost power recovery", trigger: "Engineering_PowerUnit_Trigger" },
    { stepId: "SOL08_REPAIR_OUTDOOR_COMMUNICATION", label: "Restore outdoor communication", trigger: "Commuication_fix_Trigger" },
    { stepId: "SOL08_VERIFY_AND_REPORT_RECOVERY", label: "Verify and report recovery", trigger: "MC_MAIN_01" }
];
const createInitialSol08Progress = () => ({
    started: false, powerFailureActive: false, communicationFailureActive: false,
    reservePowerPercent: 20, reservePowerSource: "Gameplay simulation: approximately 20% reserve; no verified source value persisted.",
    repairs: {}, powerAlertAcknowledged: false, powerUnitInspected: false, communicationDiagnosed: false,
    evaPrepared: false, mainPowerRestored: false, powerRecoveryVerified: false, communicationOnline: false, report: null
});
exports.createInitialSol08Progress = createInitialSol08Progress;
exports.SOL08_PUZZLE_CONNECTIONS = {
    SOL08_PANEL_A_CIRCUIT_REPAIR: [
        { source: "PANEL_A_POS", destination: "REGULATOR_A_POS" },
        { source: "PANEL_A_NEG", destination: "REGULATOR_A_NEG" },
        { source: "REGULATOR_A_OUT_POS", destination: "BUS_A_POS" },
        { source: "REGULATOR_A_OUT_NEG", destination: "BUS_A_NEG" }
    ],
    SOL08_PANEL_B_CIRCUIT_REPAIR: [
        { source: "PANEL_B_POS", destination: "REGULATOR_B_POS" },
        { source: "PANEL_B_NEG", destination: "REGULATOR_B_NEG" },
        { source: "REGULATOR_B_OUT_POS", destination: "BUS_B_POS" },
        { source: "REGULATOR_B_OUT_NEG", destination: "BUS_B_NEG" }
    ],
    SOL08_MAIN_POWER_ROUTING_REPAIR: [
        { source: "PANEL_A_POS", destination: "MAIN_JUNCTION_A_POS" },
        { source: "PANEL_A_NEG", destination: "MAIN_JUNCTION_A_NEG" },
        { source: "PANEL_B_POS", destination: "MAIN_JUNCTION_B_POS" },
        { source: "PANEL_B_NEG", destination: "MAIN_JUNCTION_B_NEG" },
        { source: "MAIN_JUNCTION_OUT_POS", destination: "DISTRIBUTION_BUS_POS" },
        { source: "MAIN_JUNCTION_OUT_NEG", destination: "DISTRIBUTION_BUS_NEG" }
    ]
};
function validateSol08Connections(puzzleId, connections) {
    const expected = exports.SOL08_PUZZLE_CONNECTIONS[puzzleId];
    if (!expected || connections.length !== expected.length)
        return false;
    const seenSources = new Set();
    const seenDestinations = new Set();
    for (const edge of connections) {
        if (!edge || seenSources.has(edge.source) || seenDestinations.has(edge.destination))
            return false;
        seenSources.add(edge.source);
        seenDestinations.add(edge.destination);
        if (!expected.some(correct => correct.source === edge.source && correct.destination === edge.destination))
            return false;
    }
    return expected.every(edge => connections.some(candidate => candidate.source === edge.source && candidate.destination === edge.destination));
}

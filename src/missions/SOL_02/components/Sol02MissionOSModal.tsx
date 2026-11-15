"use client";

import React, { useState } from "react";
import { Sol02MissionManager, type Sol02MissionLog } from "../Sol02MissionManager";

interface Props {
  manager?: Sol02MissionManager;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

type TabType = "tasks" | "sol01_records" | "telemetry" | "soil_analysis" | "logs";

export function Sol02MissionOSModal({ manager, onClose, onSaveSuccess }: Props) {
  const mgr = manager || Sol02MissionManager.getInstance();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (mgr.currentTaskId === "SOL02_TASK_02") return "sol01_records";
    if (mgr.currentTaskId === "SOL02_TASK_10" || mgr.imagesUnlocked) return "soil_analysis";
    return "tasks";
  });

  const tasks = mgr.getTasks();
  const currentTask = mgr.getCurrentTask();
  const telemetry = mgr.getTelemetry();
  const sol01Data = mgr.getSol01PreviousRecords();

  const [researcherNotes, setResearcherNotes] = useState(
    "Spectrometry indicates dry ferric silicate regolith with low hygroscopic moisture (2.4%). Perchlorates and subzero exposure require conditioning. Recommended for controlled experiments in two habitat test units."
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleReviewSol01 = () => {
    mgr.onReviewPreviousRecords();
    setFeedback("SOL 01 mission records and baselines reviewed! Task 02 completed.");
    onSaveSuccess?.();
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveScientificReport = () => {
    mgr.saveScientificReport(researcherNotes);
    setFeedback("Final Scientific Analysis Report saved to mission logs! Task 10 completed.");
    onSaveSuccess?.();
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleConfirmSampleTransfer = () => {
    if (!mgr.soilSample) {
      setFeedback("No soil sample is recorded yet. Collect the sample at the investigation site first.");
      return;
    }
    if (mgr.confirmSampleTransferToRack()) {
      setFeedback("Soil sample confirmed in the tools rack. Mission task 09 completed; continue to soil analysis.");
      onSaveSuccess?.();
    }
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 pointer-events-auto"
    >
      <div className="w-full max-w-5xl h-[700px] flex flex-col rounded-xl border border-[#38d4f0]/40 bg-[#08121c] shadow-[0_24px_90px_rgba(0,0,0,0.9)] text-[#dce8ee] overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center border-b border-[#38d4f0]/20 px-6 py-4 bg-[#0a1824]">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#38d4f0] shadow-[0_0_10px_#38d4f0]" />
            <div>
              <div className="text-[10px] font-mono font-bold tracking-[0.16em] text-[#e88747]">
                ELYSIUM IV · OPERATING SYSTEM · SOL 02
              </div>
              <h1 className="text-lg font-bold font-kdam-thmor-pro text-white leading-tight">
                Daytime Soil Investigation & Scientific OS
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-[#8faec0]">
              PROFILE: <strong className="text-[#38d4f0] uppercase">{mgr.telemetryProfile}</strong>
            </span>
            <button
              onClick={onClose}
              className="rounded border border-[#3c596b] bg-[#102230] px-3.5 py-1.5 text-xs font-bold text-[#b4d2e0] hover:text-white hover:border-[#38d4f0] transition-colors"
            >
              Exit Terminal [ESC]
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex flex-1 min-h-0">
          {/* Navigation Sidebar */}
          <nav className="w-60 border-r border-[#38d4f0]/15 bg-[#091520] p-3 flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex items-center gap-2.5 w-full rounded-lg px-3.5 py-3 text-left text-xs font-bold font-mono transition-all ${
                activeTab === "tasks"
                  ? "bg-[#102e42] text-[#38d4f0] border border-[#38d4f0]/40 shadow-[0_0_15px_rgba(56,212,240,0.15)]"
                  : "text-[#8faec0] hover:bg-[#0c1c28] hover:text-white"
              }`}
            >
              <span className="text-sm">📋</span> Mission Tasks ({mgr.completedTaskIds.size}/{tasks.length})
            </button>

            <button
              onClick={() => setActiveTab("sol01_records")}
              className={`flex items-center justify-between w-full rounded-lg px-3.5 py-3 text-left text-xs font-bold font-mono transition-all ${
                activeTab === "sol01_records"
                  ? "bg-[#102e42] text-[#38d4f0] border border-[#38d4f0]/40 shadow-[0_0_15px_rgba(56,212,240,0.15)]"
                  : "text-[#8faec0] hover:bg-[#0c1c28] hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-sm">📁</span> SOL 01 Records
              </span>
              {!mgr.isTaskComplete("SOL02_TASK_02") && (
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#f0a04b] text-[#07131e]">
                  NEW
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("soil_analysis")}
              className={`flex items-center justify-between w-full rounded-lg px-3.5 py-3 text-left text-xs font-bold font-mono transition-all ${
                activeTab === "soil_analysis"
                  ? "bg-[#102e42] text-[#38d4f0] border border-[#38d4f0]/40 shadow-[0_0_15px_rgba(56,212,240,0.15)]"
                  : "text-[#8faec0] hover:bg-[#0c1c28] hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-sm">🔬</span> Soil & Imaging
              </span>
              {mgr.imagesUnlocked ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#52d9a3] text-[#07131e]">
                  UNLOCKED
                </span>
              ) : (
                <span className="text-xs text-[#7190a0]">🔒</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("telemetry")}
              className={`flex items-center gap-2.5 w-full rounded-lg px-3.5 py-3 text-left text-xs font-bold font-mono transition-all ${
                activeTab === "telemetry"
                  ? "bg-[#102e42] text-[#38d4f0] border border-[#38d4f0]/40 shadow-[0_0_15px_rgba(56,212,240,0.15)]"
                  : "text-[#8faec0] hover:bg-[#0c1c28] hover:text-white"
              }`}
            >
              <span className="text-sm">📊</span> Daytime Telemetry
            </button>

            <button
              onClick={() => setActiveTab("logs")}
              className={`flex items-center gap-2.5 w-full rounded-lg px-3.5 py-3 text-left text-xs font-bold font-mono transition-all ${
                activeTab === "logs"
                  ? "bg-[#102e42] text-[#38d4f0] border border-[#38d4f0]/40 shadow-[0_0_15px_rgba(56,212,240,0.15)]"
                  : "text-[#8faec0] hover:bg-[#0c1c28] hover:text-white"
              }`}
            >
              <span className="text-sm">📑</span> Mission Logs ({mgr.missionLogs.length})
            </button>
          </nav>

          {/* Main Tab Panel */}
          <main className="flex-1 bg-[#061019] p-6 overflow-y-auto">
            {feedback && (
              <div className="mb-4 rounded-lg border border-[#52d9a3]/40 bg-[#092218] p-3 text-sm font-mono text-[#52d9a3] flex items-center gap-2">
                <span>✓</span> {feedback}
              </div>
            )}

            {/* TAB 1: Tasks */}
            {activeTab === "tasks" && (
              <div className="space-y-4">
                <div className="rounded-lg border border-[#38d4f0]/30 bg-[#091a26] p-4">
                  <div className="text-[11px] font-mono font-bold text-[#e88747]">
                    ACTIVE OBJECTIVE
                  </div>
                  <h3 className="text-lg font-bold font-kdam-thmor-pro text-white mt-0.5">
                    {currentTask?.title}
                  </h3>
                  <p className="text-xs font-mono text-[#a5c3d1] mt-1 leading-relaxed">
                    {currentTask?.description}
                  </p>
                  {mgr.currentTaskId === "SOL02_TASK_09" && (
                    <button
                      onClick={handleConfirmSampleTransfer}
                      disabled={!mgr.soilSample}
                      className="mt-4 rounded-lg border border-[#f0a04b] bg-[#2d1b0f] px-4 py-2.5 text-xs font-bold font-mono text-[#f0a04b] hover:bg-[#f0a04b] hover:text-[#07131e] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Confirm Soil Sample in Tools Rack
                    </button>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-xs font-mono">
                    <span className="text-[#8faec0]">
                      WAYPOINT: <strong className="text-[#38d4f0]">{mgr.getActiveDestination()}</strong>
                    </span>
                    <span className="text-[#8faec0]">
                      PROGRESS: <strong className="text-white">{mgr.completedTaskIds.size} / {tasks.length}</strong>
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-[#8faec0] uppercase tracking-wider mb-2">
                    Mission Sequence
                  </div>
                  {tasks.map((task: any, index: number) => {
                    const isDone = mgr.isTaskComplete(task.id);
                    const isCurrent = task.id === mgr.currentTaskId;
                    return (
                      <div
                        key={task.id}
                        className={`flex items-start justify-between p-3.5 rounded-lg border transition-all ${
                          isDone
                            ? "border-[#52d9a3]/30 bg-[#081f1a]"
                            : isCurrent
                            ? "border-[#38d4f0]/70 bg-[#0a2333]"
                            : "border-[#152a38] bg-[#07131e] opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center text-xs font-mono font-bold ${
                              isDone
                                ? "bg-[#52d9a3] text-[#07131e]"
                                : isCurrent
                                ? "bg-[#38d4f0] text-[#07131e]"
                                : "bg-[#1f3f52] text-[#7190a0]"
                            }`}
                          >
                            {isDone ? "✓" : index + 1}
                          </span>
                          <div>
                            <div className="text-xs font-bold font-mono text-white">
                              {task.title}
                            </div>
                            <div className="text-[11px] font-mono text-[#7190a0] mt-0.5">
                              {task.description}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-1 rounded ${
                            isDone
                              ? "bg-[#52d9a3]/20 text-[#52d9a3]"
                              : isCurrent
                              ? "bg-[#38d4f0]/20 text-[#38d4f0]"
                              : "text-[#7190a0]"
                          }`}
                        >
                          {isDone ? "COMPLETED" : isCurrent ? "IN PROGRESS" : "PENDING"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: SOL 01 Historical Records */}
            {activeTab === "sol01_records" && (
              <div className="space-y-5">
                <div className="flex justify-between items-center rounded-lg border border-[#38d4f0]/30 bg-[#091a26] p-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#e88747]">
                      HISTORICAL FLIGHT TELEMETRY
                    </span>
                    <h3 className="text-base font-bold font-kdam-thmor-pro text-white mt-0.5">
                      SOL 01 Reconnaissance & Baseline Logs
                    </h3>
                    <p className="text-xs font-mono text-[#a5c3d1] mt-0.5">
                      Persisted records retrieved from storage namespace: elysium_iv
                    </p>
                  </div>
                  {!mgr.isTaskComplete("SOL02_TASK_02") && (
                    <button
                      onClick={handleReviewSol01}
                      className="rounded-lg border border-[#38d4f0] bg-[#12364a] px-4 py-2 text-xs font-bold font-mono text-[#38d4f0] hover:bg-[#38d4f0] hover:text-[#07131e] transition-all"
                    >
                      Audit & Verify SOL 01 Records
                    </button>
                  )}
                </div>

                {sol01Data ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[#0b1b26] p-3 rounded-lg border border-[#1f3f52]">
                        <div className="text-[10px] font-mono text-[#8faec0]">SOL 01 STATUS</div>
                        <div className="text-base font-bold font-mono text-[#52d9a3] mt-1">
                          {sol01Data.sol01Completed ? "MISSION ACCOMPLISHED" : "LOGS RECORDED"}
                        </div>
                      </div>
                      <div className="bg-[#0b1b26] p-3 rounded-lg border border-[#1f3f52]">
                        <div className="text-[10px] font-mono text-[#8faec0]">TASKS COMPLETED</div>
                        <div className="text-base font-bold font-mono text-[#38d4f0] mt-1">
                          {sol01Data.completedTaskIds?.length || 8} / 8 VERIFIED
                        </div>
                      </div>
                      <div className="bg-[#0b1b26] p-3 rounded-lg border border-[#1f3f52]">
                        <div className="text-[10px] font-mono text-[#8faec0]">LOG ENTRIES</div>
                        <div className="text-base font-bold font-mono text-white mt-1">
                          {sol01Data.missionLogs?.length || 0} FILED RECORDS
                        </div>
                      </div>
                    </div>

                    {/* SOL 01 Logs list */}
                    <div className="space-y-2.5">
                      <div className="text-xs font-mono font-bold text-[#8faec0]">
                        AUDITED MISSION LOG ENTRIES:
                      </div>
                      {sol01Data.missionLogs && sol01Data.missionLogs.length > 0 ? (
                        sol01Data.missionLogs.map((log: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-[#0a1824] p-3 rounded-lg border border-[#183648] text-xs font-mono"
                          >
                            <div className="flex justify-between text-[#8faec0] mb-1">
                              <span className="font-bold text-[#f0a04b]">{log.log_type}</span>
                              <span className="text-[#52d9a3]">
                                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "SOL 01"}
                              </span>
                            </div>
                            <div className="text-white leading-relaxed">{log.user_entry}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs font-mono text-[#7190a0] italic">
                          No SOL 01 logs found in storage.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-[#f0a04b]/30 bg-[#1c1208] p-4 text-xs font-mono text-[#f0a04b]">
                    No SOL 01 save data found in local storage. Ready to proceed with baseline initializations.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Daytime Telemetry */}
            {activeTab === "telemetry" && (
              <div className="space-y-5">
                <div className="text-xs font-mono font-bold text-[#8faec0] uppercase tracking-wider">
                  Martian Surface Daytime Atmospheric Telemetry
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#0b1c28] p-4 rounded-lg border border-[#1f3f52]">
                    <div className="text-[10px] font-mono text-[#8faec0]">SURFACE TEMP</div>
                    <div className="text-2xl font-bold font-mono text-[#f0a04b] mt-1">
                      {telemetry.environment.temperature_celsius} °C
                    </div>
                  </div>
                  <div className="bg-[#0b1c28] p-4 rounded-lg border border-[#1f3f52]">
                    <div className="text-[10px] font-mono text-[#8faec0]">BAROMETRIC PRESSURE</div>
                    <div className="text-2xl font-bold font-mono text-[#38d4f0] mt-1">
                      {telemetry.environment.pressure_mbar} mbar
                    </div>
                  </div>
                  <div className="bg-[#0b1c28] p-4 rounded-lg border border-[#1f3f52]">
                    <div className="text-[10px] font-mono text-[#8faec0]">WIND VELOCITY</div>
                    <div className="text-2xl font-bold font-mono text-[#52d9a3] mt-1">
                      {telemetry.environment.wind_speed_m_s} m/s
                    </div>
                    <div className="text-[10px] text-[#7190a0]">Vector: {telemetry.environment.wind_direction}</div>
                  </div>
                </div>

                <div className="text-xs font-mono font-bold text-[#8faec0] uppercase tracking-wider mt-6">
                  Cabin Environmental Life Support
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-[#0b1c28] p-3 rounded-lg border border-[#1f3f52]">
                    <div className="text-[10px] font-mono text-[#8faec0]">CABIN O2</div>
                    <div className="text-xl font-bold font-mono text-[#38d4f0] mt-1">
                      {telemetry.cabin.oxygen_percent} %
                    </div>
                  </div>
                  <div className="bg-[#0b1c28] p-3 rounded-lg border border-[#1f3f52]">
                    <div className="text-[10px] font-mono text-[#8faec0]">BATTERY RESERVE</div>
                    <div className="text-xl font-bold font-mono text-[#f0a04b] mt-1">
                      {telemetry.cabin.battery_percent} %
                    </div>
                  </div>
                  <div className="bg-[#0b1c28] p-3 rounded-lg border border-[#1f3f52]">
                    <div className="text-[10px] font-mono text-[#8faec0]">POTABLE WATER</div>
                    <div className="text-xl font-bold font-mono text-[#38d4f0] mt-1">
                      {telemetry.resources.water_liters} L
                    </div>
                  </div>
                  <div className="bg-[#0b1c28] p-3 rounded-lg border border-[#1f3f52]">
                    <div className="text-[10px] font-mono text-[#8faec0]">BOTAN NUTRIENTS</div>
                    <div className="text-xl font-bold font-mono text-[#52d9a3] mt-1">
                      {telemetry.resources.nutrient_percent} %
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Soil Analysis & Scientific Images */}
            {activeTab === "soil_analysis" && (
              <div className="space-y-6">
                {!mgr.imagesUnlocked ? (
                  <div className="rounded-xl border border-[#f0a04b]/40 bg-[#14120f] p-8 text-center space-y-3">
                    <span className="text-4xl">🔒</span>
                    <h3 className="text-lg font-bold font-kdam-thmor-pro text-white">
                      Automated Spectrometry & Imagery Sealed
                    </h3>
                    <p className="text-xs font-mono text-[#a5c3d1] max-w-lg mx-auto leading-relaxed">
                      Collect Martian soil sample at the investigation waypoint, return to the rover, and place the sample in the Tools Rack to initiate automated chemical profiling and unlock high-resolution false-color imagery.
                    </p>
                    <div className="inline-block px-3 py-1 rounded bg-[#2b1f13] border border-[#f0a04b]/40 text-[#f0a04b] text-xs font-mono">
                      STATUS: AWAITING SAMPLE TRANSFER TO RACK
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Unlocked Scientific Images Gallery */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-mono font-bold text-[#52d9a3] flex items-center gap-2">
                          <span>✓</span> UNLOCKED SCIENTIFIC SAMPLE IMAGERY (3 CHANNELS)
                        </span>
                        <span className="text-[10px] font-mono text-[#8faec0]">
                          Target 03 · Elysium Depression SMR
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-lg border border-[#1f3f52] bg-[#0c1b26] p-2 overflow-hidden group">
                          <div className="h-44 w-full bg-black rounded overflow-hidden relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/assets/images/Selected_Missions/target_03/a_wide_high_resolution_false_color_thermal_infrar.png"
                              alt="Thermal Infrared False Color"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="mt-2 text-[11px] font-mono font-bold text-white">
                            Thermal Infrared False-Color
                          </div>
                          <div className="text-[10px] font-mono text-[#7190a0]">
                            Thermal inertia & heat capacity overview
                          </div>
                        </div>

                        <div className="rounded-lg border border-[#1f3f52] bg-[#0c1b26] p-2 overflow-hidden group">
                          <div className="h-44 w-full bg-black rounded overflow-hidden relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/assets/images/Selected_Missions/target_03/bandw.png"
                              alt="Granular Morphology"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="mt-2 text-[11px] font-mono font-bold text-white">
                            Micro-Morphology (B&W)
                          </div>
                          <div className="text-[10px] font-mono text-[#7190a0]">
                            Sub-millimeter granular structure & sorting
                          </div>
                        </div>

                        <div className="rounded-lg border border-[#1f3f52] bg-[#0c1b26] p-2 overflow-hidden group">
                          <div className="h-44 w-full bg-black rounded overflow-hidden relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="/assets/images/Selected_Missions/target_03/Cratered Rust Plains of Elysium-2.png"
                              alt="Cratered Rust Plains"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="mt-2 text-[11px] font-mono font-bold text-white">
                            Field Traverse Geologic Context
                          </div>
                          <div className="text-[10px] font-mono text-[#7190a0]">
                            Cratered Rust Plain basin reference
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Automated Soil Analysis Results */}
                    <div className="rounded-lg border border-[#38d4f0]/30 bg-[#0a1824] p-4 space-y-3">
                      <div className="flex justify-between items-center border-b border-[#38d4f0]/20 pb-2">
                        <span className="text-xs font-mono font-bold text-[#38d4f0]">
                          AUTOMATED SPECTROMETRY PROFILING
                        </span>
                        <span className="text-[10px] font-mono text-[#52d9a3]">
                          ANALYSIS CONFIDENCE: 98.6%
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-3 text-xs font-mono">
                        <div className="bg-[#061019] p-2.5 rounded border border-[#183648]">
                          <span className="text-[10px] text-[#7190a0]">MOISTURE CONTENT</span>
                          <div className="text-white font-bold mt-0.5">2.4 % (Dry Regolith)</div>
                        </div>
                        <div className="bg-[#061019] p-2.5 rounded border border-[#183648]">
                          <span className="text-[10px] text-[#7190a0]">SAMPLE TEMPERATURE</span>
                          <div className="text-[#f0a04b] font-bold mt-0.5">-76.5 °C</div>
                        </div>
                        <div className="bg-[#061019] p-2.5 rounded border border-[#183648]">
                          <span className="text-[10px] text-[#7190a0]">PARTICLE GRAIN SIZE</span>
                          <div className="text-[#38d4f0] font-bold mt-0.5">0.35 mm</div>
                        </div>
                        <div className="bg-[#061019] p-2.5 rounded border border-[#183648]">
                          <span className="text-[10px] text-[#7190a0]">ORGANIC INDICATOR</span>
                          <div className="text-[#52d9a3] font-bold mt-0.5">Below Detection Limit</div>
                        </div>
                      </div>

                      <div className="rounded border border-[#52d9a3]/30 bg-[#092218] p-3 text-xs font-mono">
                        <div className="text-[#52d9a3] font-bold mb-1">
                          HABITAT GROWING SUITABILITY ASSESSMENT:
                        </div>
                        <div className="text-[#d8f2e7] leading-relaxed">
                          Status: <strong>REQUIRES PROCESSING</strong>. Unprocessed direct planting is not viable. Sample is suitable for controlled soil conditioning experiments in <strong>2 designated habitat test units</strong>.
                        </div>
                      </div>
                    </div>

                    {/* Scientific Report Saving */}
                    <div>
                      <label className="block text-xs font-mono text-[#8faec0] mb-2">
                        PRINCIPAL RESEARCHER SCIENTIFIC REPORT & RECOMENDATIONS:
                      </label>
                      <textarea
                        rows={3}
                        value={researcherNotes}
                        onChange={e => setResearcherNotes(e.target.value)}
                        className="w-full rounded-lg border border-[#1f3f52] bg-[#0c1b26] p-3 text-xs font-mono text-[#dbe8ee] focus:border-[#38d4f0] focus:outline-none resize-none leading-relaxed"
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={handleSaveScientificReport}
                          className="flex items-center gap-2 rounded-lg border border-[#38d4f0] bg-[#12364a] px-5 py-2.5 text-xs font-bold font-mono text-[#38d4f0] hover:bg-[#38d4f0] hover:text-[#07131e] transition-all shadow-[0_0_15px_rgba(56,212,240,0.25)]"
                        >
                          <span>💾</span> Save Final Scientific Analysis Report
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: Mission Logs */}
            {activeTab === "logs" && (
              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-[#8faec0] uppercase tracking-wider mb-2">
                  SOL 02 Activity Log Ledger
                </div>
                {mgr.missionLogs.length > 0 ? (
                  mgr.missionLogs.map((log: Sol02MissionLog, idx: number) => (
                    <div
                      key={idx}
                      className="bg-[#0a1824] p-3.5 rounded-lg border border-[#183648] text-xs font-mono space-y-1"
                    >
                      <div className="flex justify-between items-center text-[#8faec0]">
                        <span className="font-bold text-[#f0a04b]">{log.log_type}</span>
                        <span className="text-[#52d9a3]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#7190a0]">LOC: {log.location}</div>
                      <div className="text-white pt-1 leading-relaxed">{log.user_entry}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs font-mono text-[#7190a0] italic">
                    No SOL 02 logs saved yet. Complete mission tasks to populate ledger.
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

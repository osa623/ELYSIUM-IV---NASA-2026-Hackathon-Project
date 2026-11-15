"use client";

import React, { useState } from "react";
import { Sol01MissionManager, type Sol01MissionLog } from "../Sol01MissionManager";

interface Props {
  manager?: Sol01MissionManager;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

type TabType = "tasks" | "logging" | "telemetry";

export function Sol01MissionOSModal({ manager, onClose, onSaveSuccess }: Props) {
  const mgr = manager || Sol01MissionManager.getInstance();
  const [activeTab, setActiveTab] = useState<TabType>(
    mgr.currentTaskId === "SOL01_TASK_02" || mgr.currentTaskId === "SOL01_TASK_07"
      ? "logging"
      : "tasks"
  );
  const tasks = mgr.getTasks();
  const currentTask = mgr.getCurrentTask();
  const telemetry = mgr.getTelemetry();

  // Logging state
  const isTask2 = mgr.currentTaskId === "SOL01_TASK_02";
  const isTask7 = mgr.currentTaskId === "SOL01_TASK_07";

  const [initialLogText, setInitialLogText] = useState(
    "All primary rover life-support subsystems initialized. Surface temperature -58°C, atmospheric pressure 6.4 mbar nominal. Ready to commence field exploration."
  );
  const [secondLogText, setSecondLogText] = useState(
    "Reached 2ndCheckpoint on Elysium plain traverse. External temperature dropped to -66°C, wind gusts reaching 6.1 m/s. Chassis and wheel assemblies holding nominal stability."
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSaveInitialLog = () => {
    mgr.saveInitialMissionLog(initialLogText);
    setFeedback("Initial Mission Log successfully saved! Task 02 completed.");
    onSaveSuccess?.();
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveSecondLog = () => {
    mgr.saveSecondObservationLog(secondLogText);
    setFeedback("Second Observation Log saved! Task 07 completed.");
    onSaveSuccess?.();
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 pointer-events-auto"
    >
      <div className="w-full max-w-4xl h-[650px] flex flex-col rounded-xl border border-[#38d4f0]/40 bg-[#08121c] shadow-[0_24px_90px_rgba(0,0,0,0.9)] text-[#dce8ee] overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center border-b border-[#38d4f0]/20 px-6 py-4 bg-[#0a1824]">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#38d4f0] shadow-[0_0_10px_#38d4f0]" />
            <div>
              <div className="text-[10px] font-mono font-bold tracking-[0.16em] text-[#e88747]">
                ELYSIUM IV · OPERATING SYSTEM · SOL 01
              </div>
              <h1 className="text-lg font-bold font-kdam-thmor-pro text-white leading-tight">
                Terrain Rover Central Operating Console
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
          <nav className="w-56 border-r border-[#38d4f0]/15 bg-[#091520] p-3 flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex items-center gap-2.5 w-full rounded-lg px-3.5 py-3 text-left text-xs font-bold font-mono transition-all ${
                activeTab === "tasks"
                  ? "bg-[#142e40] text-[#38d4f0] border border-[#38d4f0]/40 shadow-sm"
                  : "text-[#8faec0] hover:bg-[#0d1d2a] hover:text-white"
              }`}
            >
              <span>📋</span> Mission Checklist ({mgr.completedTaskIds.size}/8)
            </button>

            <button
              onClick={() => setActiveTab("logging")}
              className={`flex items-center gap-2.5 w-full rounded-lg px-3.5 py-3 text-left text-xs font-bold font-mono transition-all ${
                activeTab === "logging"
                  ? "bg-[#142e40] text-[#38d4f0] border border-[#38d4f0]/40 shadow-sm"
                  : "text-[#8faec0] hover:bg-[#0d1d2a] hover:text-white"
              }`}
            >
              <span>📝</span> Mission Logs ({mgr.missionLogs.length})
            </button>

            <button
              onClick={() => setActiveTab("telemetry")}
              className={`flex items-center gap-2.5 w-full rounded-lg px-3.5 py-3 text-left text-xs font-bold font-mono transition-all ${
                activeTab === "telemetry"
                  ? "bg-[#142e40] text-[#38d4f0] border border-[#38d4f0]/40 shadow-sm"
                  : "text-[#8faec0] hover:bg-[#0d1d2a] hover:text-white"
              }`}
            >
              <span>📊</span> Subsystem Telemetry
            </button>

            <div className="mt-auto p-3 rounded-lg border border-[#1f3849] bg-[#07111a] text-[11px] text-[#7ea0b2]">
              <div className="text-[10px] font-mono text-[#e88747] font-bold">STATION</div>
              <p className="mt-1">Elysium Rover #04</p>
              <p className="text-[10px] text-[#52d9a3] mt-0.5">● Connected</p>
            </div>
          </nav>

          {/* Main Body */}
          <main className="flex-1 p-6 overflow-y-auto bg-[#07121b]">
            {feedback && (
              <div className="mb-4 rounded-lg border border-[#52d9a3]/50 bg-[#0d2a20] p-3 text-xs font-mono font-bold text-[#52d9a3]">
                {feedback}
              </div>
            )}

            {/* TAB 1: MISSION TASKS */}
            {activeTab === "tasks" && (
              <div>
                <header className="mb-4">
                  <h2 className="text-lg font-bold font-kdam-thmor-pro text-white">
                    SOL 01 — Mission Objectives & Task Sequence
                  </h2>
                  <p className="text-xs text-[#8aaab8]">
                    Follow each task in sequence. Tasks require specific interaction confirmations and logs to complete.
                  </p>
                </header>

                <div className="space-y-2.5">
                  {tasks.map(t => {
                    const isDone = mgr.completedTaskIds.has(t.id);
                    const isCurrent = mgr.currentTaskId === t.id;
                    return (
                      <div
                        key={t.id}
                        className={`rounded-lg border p-3.5 transition-all ${
                          isDone
                            ? "border-[#52d9a3]/40 bg-[#0b211d]/40"
                            : isCurrent
                            ? "border-[#38d4f0] bg-[#102738] shadow-[0_0_15px_rgba(56,212,240,0.15)]"
                            : "border-[#1b3444] bg-[#091722]/50 opacity-70"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                              isDone
                                ? "bg-[#52d9a3]/20 text-[#52d9a3]"
                                : isCurrent
                                ? "bg-[#38d4f0]/20 text-[#38d4f0]"
                                : "bg-[#162734] text-[#718b9c]"
                            }`}>
                              {isDone ? "✓ COMPLETED" : isCurrent ? "▶ CURRENT" : `TASK 0${t.order}`}
                            </span>
                            <span className="font-bold text-sm text-[#e6f1f5]">{t.title}</span>
                          </div>
                          <span className="text-[11px] font-mono text-[#8faec0]">
                            Trigger: <code className="text-[#38d4f0]">{t.trigger}</code>
                          </span>
                        </div>
                        <p className="text-xs text-[#9eb6c4] pl-2">{t.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: MISSION LOGGING */}
            {activeTab === "logging" && (
              <div>
                <header className="mb-5">
                  <h2 className="text-lg font-bold font-kdam-thmor-pro text-white">
                    Mission Log Recording & Archival
                  </h2>
                  <p className="text-xs text-[#8aaab8]">
                    Saved logs are permanently catalogued in the ELYSIUM IV mission archive.
                  </p>
                </header>

                {/* Task 02 Active Form */}
                {isTask2 && (
                  <div className="rounded-xl border border-[#38d4f0] bg-[#0c2232] p-5 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-[#e88747]">
                        REQUIRED MISSION LOG · TASK 02
                      </span>
                      <span className="text-[10px] font-mono text-[#38d4f0]">INITIAL SURFACE ASSESSMENT</span>
                    </div>
                    <label className="block text-xs text-[#9fb8c7] mb-2">
                      Enter the initial mission log entry to establish mission readiness:
                    </label>
                    <textarea
                      value={initialLogText}
                      onChange={e => setInitialLogText(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-[#23485e] bg-[#081622] p-3 text-sm text-[#e6f1f5] outline-none focus:border-[#38d4f0]"
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={handleSaveInitialLog}
                        className="rounded bg-[#d8763b] hover:bg-[#e88747] px-5 py-2 text-xs font-bold text-black uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Save Initial Mission Log
                      </button>
                    </div>
                  </div>
                )}

                {/* Task 07 Active Form */}
                {isTask7 && (
                  <div className="rounded-xl border border-[#38d4f0] bg-[#0c2232] p-5 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-[#e88747]">
                        REQUIRED MISSION LOG · TASK 07
                      </span>
                      <span className="text-[10px] font-mono text-[#38d4f0]">SECOND CHECKPOINT OBSERVATION</span>
                    </div>
                    <label className="block text-xs text-[#9fb8c7] mb-2">
                      Record checkpoint 02 environmental readings & surface traversal findings:
                    </label>
                    <textarea
                      value={secondLogText}
                      onChange={e => setSecondLogText(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-[#23485e] bg-[#081622] p-3 text-sm text-[#e6f1f5] outline-none focus:border-[#38d4f0]"
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={handleSaveSecondLog}
                        className="rounded bg-[#d8763b] hover:bg-[#e88747] px-5 py-2 text-xs font-bold text-black uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Save Second Observation Log
                      </button>
                    </div>
                  </div>
                )}

                {/* Saved Log History */}
                <div>
                  <h3 className="text-sm font-bold font-mono text-[#8faec0] mb-3 uppercase tracking-wider">
                    Permanent Mission Log Archive ({mgr.missionLogs.length} Records)
                  </h3>
                  {mgr.missionLogs.length === 0 ? (
                    <div className="rounded-lg border border-[#1b3444] bg-[#08141f] p-6 text-center text-xs text-[#6e8a99]">
                      No logs saved yet. Access Main_Screen_Trigger to record initial log.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mgr.missionLogs.map(log => (
                        <div key={log.log_id} className="rounded-lg border border-[#234559] bg-[#091b28] p-4 text-xs">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono font-bold text-[#38d4f0]">{log.log_type}</span>
                            <span className="text-[11px] font-mono text-[#7495a6]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-[#d8eaf2] text-sm mb-2">{log.user_entry}</p>
                          <div className="flex justify-between items-center text-[10px] font-mono text-[#7495a6] pt-2 border-t border-[#1b384a]">
                            <span>ID: {log.log_id}</span>
                            <span>LOC: {log.location}</span>
                            <span className="text-[#52d9a3]">✓ PERMANENTLY ARCHIVED</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: SUBSYSTEM TELEMETRY */}
            {activeTab === "telemetry" && (
              <div>
                <header className="mb-5">
                  <h2 className="text-lg font-bold font-kdam-thmor-pro text-white">
                    Rover Central Subsystems Telemetry
                  </h2>
                  <p className="text-xs text-[#8aaab8]">
                    Live synchronized readings across interior computer screens, resource monitors, and small gauges.
                  </p>
                </header>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="rounded-lg border border-[#1d3c4e] bg-[#0b1d2a] p-3.5">
                    <span className="text-[10px] font-mono text-[#7ea1b3]">CABIN OXYGEN</span>
                    <div className="text-2xl font-bold font-mono text-[#38d4f0] mt-1">{telemetry.cabin.oxygen_percentage} %</div>
                  </div>
                  <div className="rounded-lg border border-[#1d3c4e] bg-[#0b1d2a] p-3.5">
                    <span className="text-[10px] font-mono text-[#7ea1b3]">AIR FILTER</span>
                    <div className="text-2xl font-bold font-mono text-[#52d9a3] mt-1">{telemetry.cabin.air_filter_percentage} %</div>
                  </div>
                  <div className="rounded-lg border border-[#1d3c4e] bg-[#0b1d2a] p-3.5">
                    <span className="text-[10px] font-mono text-[#7ea1b3]">CABIN BATTERY</span>
                    <div className="text-2xl font-bold font-mono text-[#f0a04b] mt-1">{telemetry.cabin.battery_percentage} %</div>
                  </div>
                  <div className="rounded-lg border border-[#1d3c4e] bg-[#0b1d2a] p-3.5">
                    <span className="text-[10px] font-mono text-[#7ea1b3]">CABIN PRESSURE</span>
                    <div className="text-2xl font-bold font-mono text-[#38d4f0] mt-1">{telemetry.cabin.pressure_kpa} kPa</div>
                  </div>
                  <div className="rounded-lg border border-[#1d3c4e] bg-[#0b1d2a] p-3.5">
                    <span className="text-[10px] font-mono text-[#7ea1b3]">CABIN CO2</span>
                    <div className="text-2xl font-bold font-mono text-[#52d9a3] mt-1">{telemetry.cabin.co2_percentage} %</div>
                  </div>
                  <div className="rounded-lg border border-[#1d3c4e] bg-[#0b1d2a] p-3.5">
                    <span className="text-[10px] font-mono text-[#7ea1b3]">CABIN TEMPERATURE</span>
                    <div className="text-2xl font-bold font-mono text-[#f0a04b] mt-1">{telemetry.cabin.temperature_celsius} °C</div>
                  </div>
                  <div className="rounded-lg border border-[#1d3c4e] bg-[#0b1d2a] p-3.5">
                    <span className="text-[10px] font-mono text-[#7ea1b3]">POTABLE WATER</span>
                    <div className="text-2xl font-bold font-mono text-[#38d4f0] mt-1">{telemetry.resources.water_liters} L</div>
                  </div>
                  <div className="rounded-lg border border-[#1d3c4e] bg-[#0b1d2a] p-3.5">
                    <span className="text-[10px] font-mono text-[#7ea1b3]">NUTRIENT SUPPLY</span>
                    <div className="text-2xl font-bold font-mono text-[#52d9a3] mt-1">{telemetry.resources.nutrient_supply_percentage} %</div>
                  </div>
                  <div className="rounded-lg border border-[#1d3c4e] bg-[#0b1d2a] p-3.5">
                    <span className="text-[10px] font-mono text-[#7ea1b3]">SYSTEM STATUS</span>
                    <div className="text-2xl font-bold font-mono text-[#52d9a3] mt-1">{telemetry.cabin.system_status}</div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

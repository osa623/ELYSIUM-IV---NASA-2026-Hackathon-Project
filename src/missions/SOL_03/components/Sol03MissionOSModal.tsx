"use client";

import React, { useState, useEffect } from "react";
import { Sol03MissionManager, type Sol03ResearchLog, type Sol03FinalReport } from "../Sol03MissionManager";
import { type Sol03PhotoRecord } from "../services/PhotoStorage";

interface Props {
  manager?: Sol03MissionManager;
  onClose: () => void;
  onSaveSuccess?: () => void;
  onCompleteJourney?: () => void;
}

type TabType = "tasks" | "history" | "telemetry" | "gallery" | "research" | "final_report";

export function Sol03MissionOSModal({ manager, onClose, onSaveSuccess, onCompleteJourney }: Props) {
  const mgr = manager || Sol03MissionManager.getInstance();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (mgr.currentTaskId === "SOL03_TASK_02") return "history";
    if (mgr.currentTaskId === "SOL03_TASK_09") return "gallery";
    if (mgr.currentTaskId === "SOL03_TASK_10") return "research";
    if (mgr.currentTaskId === "SOL03_TASK_12" || mgr.currentTaskId === "SOL03_TASK_16") return "final_report";
    return "tasks";
  });

  const [photos, setPhotos] = useState<Sol03PhotoRecord[]>(mgr.cachedPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<Sol03PhotoRecord | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Research log state
  const [researchHeading, setResearchHeading] = useState(
    mgr.researchLog?.heading || "Highland Ridgeway Stratigraphy & Geomorphology Survey"
  );
  const [researchObservations, setResearchObservations] = useState(
    mgr.researchLog?.mountainObservations ||
      "Panoramic optical survey across the Elysium Mons ridgeway reveals stratified basaltic flows and aeolian megaripples. Significant iron oxide weathering evident along ancient fluvial outflow channels."
  );
  const [researchNotes, setResearchNotes] = useState(
    mgr.researchLog?.researcherNotes ||
      "Photographic evidence collected at Sol3_Checkpoint confirms lack of active mass wasting. Slope stability acceptable for future rover traverse routes."
  );

  // Final report state
  const [reportHeading, setReportHeading] = useState(
    mgr.finalReport?.heading || "ELYSIUM IV EXPEDITION CONSOLIDATED SCIENTIFIC DOSSIER"
  );
  const [reportSummary, setReportSummary] = useState(
    mgr.finalReport?.executiveSummary ||
      "Three-sol autonomous Martian surface expedition successfully completed across the Elysium Planitia and highland flanks. Traverse encompasses initial terrain navigation, nocturnal soil mineralogy, and high-altitude photography."
  );

  useEffect(() => {
    void mgr.refreshPhotos().then(p => {
      setPhotos(p);
      if (p.length > 0 && !selectedPhoto) setSelectedPhoto(p[0]);
    });
  }, [mgr]);

  const tasks = mgr.getTasks();
  const telemetry = mgr.getTelemetry();
  const sol01Data = mgr.getSol01PreviousRecords();
  const sol02Data = mgr.getSol02PreviousRecords();

  const handleReviewHistory = () => {
    mgr.onReviewPreviousRecords();
    setFeedback("SOL 01 and SOL 02 historical records verified. Task 02 completed.");
    onSaveSuccess?.();
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveResearchLog = () => {
    const photoRefs = photos.map(p => `IMG_${p.id.slice(-6)}`).join(", ");
    const log: Sol03ResearchLog = {
      heading: researchHeading,
      mountainObservations: researchObservations,
      photoReferences: photoRefs || "4 Captured Highland Photographs",
      mountainHeading: "340° NNW",
      temperature: `${telemetry.environment.temperature_celsius}°C`,
      environmentalConditions: `Pressure ${telemetry.environment.pressure_mbar} mbar, Wind ${telemetry.environment.wind_speed_m_s} m/s`,
      researcherNotes: researchNotes,
      savedAt: new Date().toISOString()
    };
    mgr.saveResearchLog(log);
    setFeedback("Mountain Research Log successfully compiled and saved. Task 10 completed.");
    onSaveSuccess?.();
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveFinalReport = () => {
    const report: Sol03FinalReport = {
      heading: reportHeading,
      executiveSummary: reportSummary,
      sol01Evaluation: "SOL 01: Traverse verified across southern basalt plains. Habitat and life support systems verified.",
      sol02Evaluation: "SOL 02: Nocturnal soil sampling achieved. Fe-Mg silicate matrix with dry ferric regolith confirmed.",
      sol03Evaluation: "SOL 03: Highland ascent achieved. Mountain photography catalogued and resource depletion audited.",
      recommendations: "Authorize return phase and transmit consolidated telemetry dossier to Mission Control.",
      savedAt: new Date().toISOString()
    };
    mgr.saveFinalReport(report);
    setFeedback("Consolidated Expedition Final Report compiled and stored. Task 12 completed.");
    onSaveSuccess?.();
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCompleteJourneyClick = () => {
    if (mgr.canCompleteJourney()) {
      mgr.completeJourney();
      onSaveSuccess?.();
      onCompleteJourney?.();
    }
  };

  const canComplete = mgr.canCompleteJourney();

  return (
    <div
      onClick={e => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 pointer-events-auto"
    >
      <div className="w-full max-w-5xl h-[720px] flex flex-col rounded-xl border border-[#38d4f0]/40 bg-[#08121c] shadow-[0_24px_90px_rgba(0,0,0,0.9)] text-[#dce8ee] overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center border-b border-[#38d4f0]/20 px-6 py-4 bg-[#0a1824]">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#e88747] shadow-[0_0_10px_#e88747]" />
            <div>
              <div className="text-[10px] font-mono font-bold tracking-[0.16em] text-[#38d4f0]">
                ELYSIUM IV · EXPEDITION OPERATING SYSTEM · SOL 03
              </div>
              <h1 className="text-lg font-bold font-kdam-thmor-pro text-white leading-tight">
                Highland Ascent, Mountain Photography & Final Report
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-[#8faec0]">
              STAGE: <strong className="text-[#e88747] uppercase">{mgr.telemetryProfile}</strong>
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
          <nav className="w-64 border-r border-[#38d4f0]/15 bg-[#091520] p-3 flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex items-center gap-2.5 w-full rounded-lg px-3.5 py-2.5 text-left text-xs font-bold font-mono transition-all ${
                activeTab === "tasks"
                  ? "bg-[#102e42] text-[#38d4f0] border border-[#38d4f0]/40 shadow-[0_0_15px_rgba(56,212,240,0.15)]"
                  : "text-[#8faec0] hover:bg-[#0c1c28] hover:text-white"
              }`}
            >
              <span>📋</span> Mission Tasks ({mgr.completedTaskIds.size}/{tasks.length})
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2.5 w-full rounded-lg px-3.5 py-2.5 text-left text-xs font-bold font-mono transition-all ${
                activeTab === "history"
                  ? "bg-[#102e42] text-[#38d4f0] border border-[#38d4f0]/40 shadow-[0_0_15px_rgba(56,212,240,0.15)]"
                  : "text-[#8faec0] hover:bg-[#0c1c28] hover:text-white"
              }`}
            >
              <span>📂</span> SOL 01/02 History
            </button>

            <button
              onClick={() => setActiveTab("telemetry")}
              className={`flex items-center gap-2.5 w-full rounded-lg px-3.5 py-2.5 text-left text-xs font-bold font-mono transition-all ${
                activeTab === "telemetry"
                  ? "bg-[#102e42] text-[#38d4f0] border border-[#38d4f0]/40 shadow-[0_0_15px_rgba(56,212,240,0.15)]"
                  : "text-[#8faec0] hover:bg-[#0c1c28] hover:text-white"
              }`}
            >
              <span>📡</span> Highland Telemetry
            </button>

            <button
              onClick={() => {
                setActiveTab("gallery");
                mgr.onReviewPhotoGallery();
              }}
              className={`flex items-center justify-between w-full rounded-lg px-3.5 py-2.5 text-left text-xs font-bold font-mono transition-all ${
                activeTab === "gallery"
                  ? "bg-[#102e42] text-[#38d4f0] border border-[#38d4f0]/40 shadow-[0_0_15px_rgba(56,212,240,0.15)]"
                  : "text-[#8faec0] hover:bg-[#0c1c28] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span>📷</span> Mountain Gallery
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${photos.length >= 4 ? "bg-emerald-900/60 text-emerald-400 border border-emerald-500/40" : "bg-amber-900/60 text-amber-400 border border-amber-500/40"}`}>
                {photos.length}/4+
              </span>
            </button>

            <button
              onClick={() => setActiveTab("research")}
              className={`flex items-center gap-2.5 w-full rounded-lg px-3.5 py-2.5 text-left text-xs font-bold font-mono transition-all ${
                activeTab === "research"
                  ? "bg-[#102e42] text-[#38d4f0] border border-[#38d4f0]/40 shadow-[0_0_15px_rgba(56,212,240,0.15)]"
                  : "text-[#8faec0] hover:bg-[#0c1c28] hover:text-white"
              }`}
            >
              <span>🔬</span> Research Log
            </button>

            <button
              onClick={() => setActiveTab("final_report")}
              className={`flex items-center gap-2.5 w-full rounded-lg px-3.5 py-2.5 text-left text-xs font-bold font-mono transition-all ${
                activeTab === "final_report"
                  ? "bg-[#102e42] text-[#38d4f0] border border-[#38d4f0]/40 shadow-[0_0_15px_rgba(56,212,240,0.15)]"
                  : "text-[#8faec0] hover:bg-[#0c1c28] hover:text-white"
              }`}
            >
              <span>📑</span> Final Report
            </button>

            <div className="mt-auto border-t border-[#38d4f0]/20 pt-3">
              <button
                onClick={handleCompleteJourneyClick}
                disabled={!canComplete}
                className={`w-full py-3 px-4 rounded-lg font-mono font-bold text-xs tracking-wider uppercase transition-all shadow-lg ${
                  canComplete
                    ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-black border border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.5)] cursor-pointer animate-pulse"
                    : "bg-[#0b1722] text-[#486372] border border-[#1b3345] cursor-not-allowed"
                }`}
              >
                ★ COMPLETE JOURNEY ★
              </button>
              <div className="text-[10px] text-center font-mono text-[#5c7a8a] mt-1.5">
                {canComplete ? "All Sol 1–3 criteria met. Departure ready." : `Pending: ${mgr.completedTaskIds.size}/16 tasks · ${photos.length}/4 photos`}
              </div>
            </div>
          </nav>

          {/* Main Display Area */}
          <main className="flex-1 overflow-y-auto p-6 bg-[#08121c]/95">
            {feedback && (
              <div className="mb-4 rounded-lg border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs font-mono text-emerald-300 shadow-md">
                ✓ {feedback}
              </div>
            )}

            {/* TAB: TASKS */}
            {activeTab === "tasks" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#38d4f0]/20 pb-3">
                  <div>
                    <h2 className="text-sm font-mono font-bold tracking-wider text-[#38d4f0]">
                      SOL 03 MISSION TASK MANIFEST
                    </h2>
                    <p className="text-xs text-[#8faec0] mt-0.5">
                      Highland ascent sequence and culminating expedition milestones.
                    </p>
                  </div>
                  <span className="font-mono text-xs text-[#e88747]">
                    PROGRESS: {mgr.completedTaskIds.size} / {tasks.length} ({Math.round((mgr.completedTaskIds.size / tasks.length) * 100)}%)
                  </span>
                </div>

                <div className="space-y-2">
                  {tasks.map(task => {
                    const isDone = mgr.completedTaskIds.has(task.id);
                    const isCurrent = mgr.currentTaskId === task.id;
                    return (
                      <div
                        key={task.id}
                        className={`rounded-lg border p-3.5 flex items-start gap-3 transition-colors ${
                          isDone
                            ? "border-emerald-500/30 bg-[#081f18]/60 text-emerald-200"
                            : isCurrent
                            ? "border-[#38d4f0]/60 bg-[#0f2a3a]/80 text-white shadow-[0_0_15px_rgba(56,212,240,0.15)]"
                            : "border-[#1b3445]/60 bg-[#0a1824]/40 text-[#718d9c]"
                        }`}
                      >
                        <span className="text-base mt-0.5">
                          {isDone ? "✅" : isCurrent ? "⚡" : "⏳"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold font-mono tracking-wide">
                              {task.id}: {task.title}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase">
                              {isDone ? "COMPLETED" : isCurrent ? "IN PROGRESS" : "PENDING"}
                            </span>
                          </div>
                          <p className="text-xs mt-1 text-[#a5c4d4] leading-relaxed">
                            {task.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: HISTORY */}
            {activeTab === "history" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-[#38d4f0]/20 pb-3">
                  <div>
                    <h2 className="text-sm font-mono font-bold tracking-wider text-[#38d4f0]">
                      HISTORICAL MISSION DOSSIER · SOL 01 & SOL 02
                    </h2>
                    <p className="text-xs text-[#8faec0] mt-0.5">
                      Review previous exploration logs and telemetry baselines before highland ascent.
                    </p>
                  </div>
                  {mgr.currentTaskId === "SOL03_TASK_02" && (
                    <button
                      onClick={handleReviewHistory}
                      className="rounded-lg border border-[#38d4f0] bg-[#102e42] px-4 py-2 text-xs font-bold font-mono text-[#38d4f0] hover:bg-[#38d4f0] hover:text-black transition-colors"
                    >
                      Audit & Confirm SOL 01/02 Records
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#38d4f0]/20 bg-[#0a1824] p-4">
                    <div className="text-xs font-bold font-mono text-[#e88747] mb-2">
                      SOL 01 · ELYSIUM PLAIN TRAVERSE
                    </div>
                    <div className="space-y-1.5 text-xs text-[#a5c4d4] font-mono">
                      <div>Status: <span className="text-emerald-400">Validated</span></div>
                      <div>Terrain: Elysium Planitia Basalt Dunes</div>
                      <div>Water Level Baseline: 80% (200L)</div>
                      <div>Surface Pressure: 6.1 mbar · Temp: -63°C</div>
                      <div>Waypoints: Spawning Point → 2ndCheckpoint → Finish</div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#38d4f0]/20 bg-[#0a1824] p-4">
                    <div className="text-xs font-bold font-mono text-[#e88747] mb-2">
                      SOL 02 · NOCTURNAL SOIL INVESTIGATION
                    </div>
                    <div className="space-y-1.5 text-xs text-[#a5c4d4] font-mono">
                      <div>Status: <span className="text-emerald-400">Validated</span></div>
                      <div>Night Condition: -78°C · Wind 7.4 m/s NE</div>
                      <div>Water Level: 70% (175L)</div>
                      <div>Soil Analysis: Ferric Silicate matrix with dry regolith</div>
                      <div>Specimen: Soil Core Sample #SOL02-S1 Archived</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TELEMETRY */}
            {activeTab === "telemetry" && (
              <div className="space-y-5">
                <div className="border-b border-[#38d4f0]/20 pb-3">
                  <h2 className="text-sm font-mono font-bold tracking-wider text-[#38d4f0]">
                    HIGHLAND TELEMETRY SENSORS & CABIN LIFE SUPPORT
                  </h2>
                  <p className="text-xs text-[#8faec0] mt-0.5">
                    Live telemetry profile: <span className="text-white font-mono">{mgr.telemetryProfile}</span>
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl border border-[#38d4f0]/20 bg-[#0a1824] p-4">
                    <div className="text-xs font-bold font-mono text-[#38d4f0] mb-2">ENVIRONMENT</div>
                    <div className="space-y-2 text-xs font-mono text-[#a5c4d4]">
                      <div className="flex justify-between"><span>Temperature</span><span className="text-white">{telemetry.environment.temperature_celsius}°C</span></div>
                      <div className="flex justify-between"><span>Pressure</span><span className="text-white">{telemetry.environment.pressure_mbar} mbar</span></div>
                      <div className="flex justify-between"><span>Wind</span><span className="text-white">{telemetry.environment.wind_speed_m_s} m/s {telemetry.environment.wind_direction}</span></div>
                      <div className="flex justify-between"><span>Atmosphere CO2</span><span className="text-white">{telemetry.environment.co2_percent}%</span></div>
                      <div className="flex justify-between"><span>Dust Visibility</span><span className="text-emerald-400">{telemetry.environment.dust_visibility}</span></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#38d4f0]/20 bg-[#0a1824] p-4">
                    <div className="text-xs font-bold font-mono text-[#38d4f0] mb-2">CABIN LIFE SUPPORT</div>
                    <div className="space-y-2 text-xs font-mono text-[#a5c4d4]">
                      <div className="flex justify-between"><span>Cabin O2</span><span className="text-emerald-400">{telemetry.cabin.oxygen_percent}%</span></div>
                      <div className="flex justify-between"><span>Air Filter</span><span className="text-white">{telemetry.cabin.air_filter_percent}%</span></div>
                      <div className="flex justify-between"><span>Cabin Pressure</span><span className="text-white">{telemetry.cabin.cabin_pressure_kpa} kPa</span></div>
                      <div className="flex justify-between"><span>Battery Level</span><span className="text-white">{telemetry.cabin.battery_percent}%</span></div>
                      <div className="flex justify-between"><span>Cabin Temp</span><span className="text-white">{telemetry.cabin.cabin_temperature_celsius}°C</span></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#38d4f0]/20 bg-[#0a1824] p-4">
                    <div className="text-xs font-bold font-mono text-[#38d4f0] mb-2">RESOURCE RESERVES</div>
                    <div className="space-y-2 text-xs font-mono text-[#a5c4d4]">
                      <div className="flex justify-between"><span>Water Reserve</span><span className="text-amber-400 font-bold">{telemetry.resources.water_percent}% ({telemetry.resources.water_liters}L)</span></div>
                      <div className="flex justify-between"><span>Nutrient Reserve</span><span className="text-white">{telemetry.resources.nutrient_percent}%</span></div>
                      <div className="flex justify-between"><span>Depletion Rate</span><span className="text-amber-300">Nominal (-4% / Sol)</span></div>
                      <div className="flex justify-between"><span>System Status</span><span className="text-emerald-400">{telemetry.resources.status}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: GALLERY */}
            {activeTab === "gallery" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#38d4f0]/20 pb-3">
                  <div>
                    <h2 className="text-sm font-mono font-bold tracking-wider text-[#38d4f0]">
                      EVA MOUNTAIN PHOTOGRAPHY CATALOGUE
                    </h2>
                    <p className="text-xs text-[#8faec0] mt-0.5">
                      Photographs captured during EVA at Sol3_Checkpoint viewpoint. Minimum quota: 4 photos.
                    </p>
                  </div>
                  <div className="font-mono text-xs">
                    STORED: <strong className={photos.length >= 4 ? "text-emerald-400" : "text-amber-400"}>{photos.length} / 6</strong> (Quota: {photos.length >= 4 ? "MET ✓" : "DEFICIT"})
                  </div>
                </div>

                {photos.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#38d4f0]/30 p-12 text-center text-[#7c9bb0]">
                    <div className="text-3xl mb-2">📷</div>
                    <div className="font-mono text-sm font-bold text-[#b4d2e0]">No Photographs Captured Yet</div>
                    <p className="text-xs mt-1">Drive to Sol3_Checkpoint, exit the rover on foot, and press E to activate the EVA camera.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {photos.map((photo, idx) => (
                      <div
                        key={photo.id}
                        onClick={() => setSelectedPhoto(photo)}
                        className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all ${
                          selectedPhoto?.id === photo.id
                            ? "border-[#38d4f0] shadow-[0_0_20px_rgba(56,212,240,0.3)] ring-1 ring-[#38d4f0]"
                            : "border-[#1b3445] hover:border-[#38d4f0]/60"
                        }`}
                      >
                        <div className="aspect-[4/3] bg-[#050b11]">
                          <img
                            src={photo.dataUrl}
                            alt={photo.caption}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2.5 bg-[#0a1824] border-t border-[#1b3445] text-xs font-mono">
                          <div className="flex justify-between items-center text-[10px] text-[#38d4f0]">
                            <span>PHOTO #{idx + 1}</span>
                            <span>{photo.heading}</span>
                          </div>
                          <div className="text-white truncate font-sans text-xs mt-0.5">{photo.caption}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: RESEARCH */}
            {activeTab === "research" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#38d4f0]/20 pb-3">
                  <div>
                    <h2 className="text-sm font-mono font-bold tracking-wider text-[#38d4f0]">
                      HIGHLAND MOUNTAIN RESEARCH LOG
                    </h2>
                    <p className="text-xs text-[#8faec0] mt-0.5">
                      Synthesize mountain survey observations, photographic references, and geology.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveResearchLog}
                    className="rounded-lg border border-[#38d4f0] bg-[#102e42] px-4 py-2 text-xs font-bold font-mono text-[#38d4f0] hover:bg-[#38d4f0] hover:text-black transition-colors"
                  >
                    Save Research Log [Task 10]
                  </button>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="block text-[#8faec0] mb-1">LOG HEADING</label>
                    <input
                      type="text"
                      value={researchHeading}
                      onChange={e => setResearchHeading(e.target.value)}
                      className="w-full rounded-lg border border-[#1b3445] bg-[#0a1824] p-2.5 text-white focus:border-[#38d4f0] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8faec0] mb-1">GEOLOGICAL & MOUNTAIN OBSERVATIONS</label>
                    <textarea
                      rows={3}
                      value={researchObservations}
                      onChange={e => setResearchObservations(e.target.value)}
                      className="w-full rounded-lg border border-[#1b3445] bg-[#0a1824] p-2.5 text-white focus:border-[#38d4f0] focus:outline-none font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8faec0] mb-1">RESEARCHER INTERPRETATION & NOTES</label>
                    <textarea
                      rows={3}
                      value={researchNotes}
                      onChange={e => setResearchNotes(e.target.value)}
                      className="w-full rounded-lg border border-[#1b3445] bg-[#0a1824] p-2.5 text-white focus:border-[#38d4f0] focus:outline-none font-sans"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: FINAL REPORT */}
            {activeTab === "final_report" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#38d4f0]/20 pb-3">
                  <div>
                    <h2 className="text-sm font-mono font-bold tracking-wider text-[#38d4f0]">
                      CONSOLIDATED EXPEDITION FINAL REPORT
                    </h2>
                    <p className="text-xs text-[#8faec0] mt-0.5">
                      Synthesize all 3 Sols into the official mission culmination dossier.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveFinalReport}
                    className="rounded-lg border border-[#38d4f0] bg-[#102e42] px-4 py-2 text-xs font-bold font-mono text-[#38d4f0] hover:bg-[#38d4f0] hover:text-black transition-colors"
                  >
                    Compile Final Report [Task 12]
                  </button>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="block text-[#8faec0] mb-1">REPORT TITLE</label>
                    <input
                      type="text"
                      value={reportHeading}
                      onChange={e => setReportHeading(e.target.value)}
                      className="w-full rounded-lg border border-[#1b3445] bg-[#0a1824] p-2.5 text-white focus:border-[#38d4f0] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8faec0] mb-1">EXECUTIVE SUMMARY</label>
                    <textarea
                      rows={4}
                      value={reportSummary}
                      onChange={e => setReportSummary(e.target.value)}
                      className="w-full rounded-lg border border-[#1b3445] bg-[#0a1824] p-2.5 text-white focus:border-[#38d4f0] focus:outline-none font-sans"
                    />
                  </div>

                  <div className="rounded-xl border border-emerald-500/30 bg-[#081e18]/40 p-4 space-y-2">
                    <div className="text-emerald-400 font-bold">THREE-SOL MILESTONE SUMMARY</div>
                    <div className="text-[#a5c4d4] font-sans text-xs space-y-1">
                      <div>• <strong>SOL 01:</strong> 8 tasks completed. Plains traverse, checkpoint telemetry, vehicle systems confirmed.</div>
                      <div>• <strong>SOL 02:</strong> 12 tasks completed. Nocturnal soil investigation, core sampling, sample bay transfer.</div>
                      <div>• <strong>SOL 03:</strong> Highland ascent, 4+ mountain EVA photographs, final environmental audits.</div>
                    </div>
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

"use client";

import React, { useState } from "react";
import { Sol03MissionManager } from "../Sol03MissionManager";

interface Props {
  manager?: Sol03MissionManager;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

export function Sol03WaterModal({ manager, onClose, onSaveSuccess }: Props) {
  const mgr = manager || Sol03MissionManager.getInstance();
  const isFinalInspection = mgr.currentTaskId === "SOL03_TASK_13" || mgr.completedTaskIds.has("SOL03_TASK_11");

  const [notes, setNotes] = useState(
    isFinalInspection
      ? "End-of-mission life-support depletion confirmed at 36% (90L). All primary systems remain nominally pressurized with zero micro-leaks."
      : "Highland ascent baseline verified. Water reserve at 40% (100L). Nutrient concentrate stable at 45%."
  );
  const [anomaly, setAnomaly] = useState("None. Nominal resource depletion across 3 Sols.");
  const [saved, setSaved] = useState(false);

  const waterPercent = isFinalInspection ? 36 : 40;
  const waterLiters = isFinalInspection ? 90 : 100;
  const nutrientPercent = isFinalInspection ? 40 : 45;

  const handleConfirm = () => {
    if (isFinalInspection) {
      mgr.confirmFinalWater(anomaly);
    } else {
      mgr.confirmWaterNutrition(notes);
    }
    setSaved(true);
    onSaveSuccess?.();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 pointer-events-auto"
    >
      <div className="w-full max-w-xl rounded-xl border border-[#38d4f0]/40 bg-[#08121c] shadow-[0_20px_80px_rgba(0,0,0,0.85)] text-[#dce8ee] overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center border-b border-[#38d4f0]/20 px-6 py-4 bg-[#0a1824]">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#38d4f0] shadow-[0_0_10px_#38d4f0]" />
            <div>
              <div className="text-[10px] font-mono font-bold tracking-[0.16em] text-[#e88747]">
                ELYSIUM IV · LIFE SUPPORT DISPENSER · SOL 03
              </div>
              <h2 className="text-base font-bold font-kdam-thmor-pro text-white leading-tight">
                {isFinalInspection ? "Final Water & Resource Audit" : "Water & Nutrient Supply Inspection"}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded border border-[#3c596b] bg-[#102230] px-3 py-1 text-xs font-bold text-[#b4d2e0] hover:text-white hover:border-[#38d4f0] transition-colors"
          >
            [ESC]
          </button>
        </header>

        {/* Content */}
        <div className="p-6 space-y-5">
          {saved && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs font-mono text-emerald-300">
              ✓ Life support resource status saved to mission records!
            </div>
          )}

          {/* Gauges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#38d4f0]/25 bg-[#0a1824] p-4 text-center">
              <div className="text-[10px] font-mono text-[#8faec0] uppercase tracking-wider">Water Reserve</div>
              <div className="text-3xl font-bold font-mono text-amber-400 mt-1">{waterPercent}%</div>
              <div className="text-xs text-[#a5c4d4] font-mono mt-0.5">{waterLiters} Liters Remaining</div>
              <div className="text-[9px] text-[#e88747] font-mono mt-2">SOL 01: 80% → SOL 02: 70% → SOL 03: {waterPercent}%</div>
            </div>

            <div className="rounded-xl border border-[#38d4f0]/25 bg-[#0a1824] p-4 text-center">
              <div className="text-[10px] font-mono text-[#8faec0] uppercase tracking-wider">Nutrient Concentrate</div>
              <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">{nutrientPercent}%</div>
              <div className="text-xs text-[#a5c4d4] font-mono mt-0.5">Automated Dispenser Active</div>
              <div className="text-[9px] text-emerald-400 font-mono mt-2">Flow Rate: Nominal</div>
            </div>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {isFinalInspection ? (
              <div>
                <label className="block text-[#8faec0] mb-1">ANOMALY OR CONSUMPTION NOTES</label>
                <input
                  type="text"
                  value={anomaly}
                  onChange={e => setAnomaly(e.target.value)}
                  className="w-full rounded-lg border border-[#1b3445] bg-[#0a1824] p-2.5 text-white focus:border-[#38d4f0] focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-[#8faec0] mb-1">INSPECTION OBSERVATION ENTRY</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-[#1b3445] bg-[#0a1824] p-2.5 text-white focus:border-[#38d4f0] focus:outline-none font-sans"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-[#3c596b] bg-[#102230] px-4 py-2 text-xs font-bold text-[#b4d2e0] hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="rounded-lg border border-[#38d4f0] bg-[#102e42] px-6 py-2 text-xs font-bold font-mono text-[#38d4f0] hover:bg-[#38d4f0] hover:text-black transition-colors"
            >
              {isFinalInspection ? "Confirm Final Water Telemetry [Task 13]" : "Save Water Observation [Task 03]"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

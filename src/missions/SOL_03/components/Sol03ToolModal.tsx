"use client";

import React, { useState } from "react";
import { Sol03MissionManager } from "../Sol03MissionManager";

interface Props {
  manager?: Sol03MissionManager;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

export function Sol03ToolModal({ manager, onClose, onSaveSuccess }: Props) {
  const mgr = manager || Sol03MissionManager.getInstance();
  const isFinalInspection = mgr.currentTaskId === "SOL03_TASK_15" || mgr.completedTaskIds.has("SOL03_TASK_11");

  const [confirmedIds, setConfirmedIds] = useState<string[]>(() =>
    mgr.toolChecklist.map(t => t.id)
  );
  const [saved, setSaved] = useState(false);

  const toggleTool = (id: string) => {
    setConfirmedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    if (isFinalInspection) {
      mgr.confirmFinalTools();
    } else {
      mgr.confirmToolChecklist(confirmedIds);
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
                ELYSIUM IV · SCIENTIFIC TOOLS LOCKER · SOL 03
              </div>
              <h2 className="text-base font-bold font-kdam-thmor-pro text-white leading-tight">
                {isFinalInspection ? "Final Equipment Inventory Lockdown" : "Optical & LiDAR Tools Calibration"}
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
              ✓ Equipment inventory verified and confirmed in mission log!
            </div>
          )}

          <p className="text-xs text-[#a5c4d4] font-mono leading-relaxed">
            {isFinalInspection
              ? "Confirm all scientific instruments and camera sensors are accounted for and secured in the equipment bay."
              : "Verify that optical survey imaging sensors, ranging LiDAR, and camera optics are calibrated for mountain survey."}
          </p>

          <div className="space-y-2">
            {mgr.toolChecklist.map(tool => {
              const isChecked = confirmedIds.includes(tool.id);
              return (
                <div
                  key={tool.id}
                  onClick={() => toggleTool(tool.id)}
                  className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isChecked
                      ? "border-emerald-500/40 bg-[#081e18]/70 text-emerald-200"
                      : "border-[#1b3445] bg-[#0a1824] text-[#718d9c] hover:border-[#38d4f0]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{isChecked ? "☑" : "☐"}</span>
                    <span className="text-xs font-mono font-bold">{tool.label}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${isChecked ? "bg-emerald-900/60 text-emerald-300" : "bg-neutral-800 text-neutral-400"}`}>
                    {isChecked ? "CALIBRATED & SECURE" : "UNCHECKED"}
                  </span>
                </div>
              );
            })}
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
              {isFinalInspection ? "Confirm Tool Lockdown [Task 15]" : "Confirm Tools Checklist [Task 05]"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

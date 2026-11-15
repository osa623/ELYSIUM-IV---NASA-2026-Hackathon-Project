"use client";

import React, { useState } from "react";
import { Sol03MissionManager } from "../Sol03MissionManager";

interface Props {
  manager?: Sol03MissionManager;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

export function Sol03EnvironmentModal({ manager, onClose, onSaveSuccess }: Props) {
  const mgr = manager || Sol03MissionManager.getInstance();
  const isFinalInspection = mgr.currentTaskId === "SOL03_TASK_14" || mgr.completedTaskIds.has("SOL03_TASK_11");

  const [notes, setNotes] = useState(
    isFinalInspection
      ? "Terminal highland plateau environmental telemetry confirmed. Atmospheric pressure 6.8 mbar, surface temp -54°C, dust optical depth nominal. Conditions stable for mission conclusion."
      : "Highland daytime atmosphere recorded. Temperature -54°C with low dust optical depth. Direct sunlight provides optimal solar array replenishment."
  );
  const [anomaly, setAnomaly] = useState("None. Atmospheric baseline matches high-altitude Elysium parameters.");
  const [saved, setSaved] = useState(false);

  const telemetry = mgr.getTelemetry();

  const handleConfirm = () => {
    if (isFinalInspection) {
      mgr.confirmFinalEnvironment(anomaly);
    } else {
      mgr.saveEnvironmentObservation(notes);
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
                ELYSIUM IV · ENVIRONMENT CONSOLE · SOL 03
              </div>
              <h2 className="text-base font-bold font-kdam-thmor-pro text-white leading-tight">
                {isFinalInspection ? "Final Environmental Telemetry Verification" : "Daytime Highland Atmosphere Check"}
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
              ✓ Environmental telemetry verified and saved to mission logs!
            </div>
          )}

          {/* Sensor Readouts */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#38d4f0]/25 bg-[#0a1824] p-3 text-center">
              <div className="text-[10px] font-mono text-[#8faec0] uppercase">SURFACE TEMP</div>
              <div className="text-2xl font-bold font-mono text-[#38d4f0] mt-1">{telemetry.environment.temperature_celsius}°C</div>
              <div className="text-[10px] text-[#a5c4d4] font-mono mt-0.5">Daytime Highland</div>
            </div>

            <div className="rounded-xl border border-[#38d4f0]/25 bg-[#0a1824] p-3 text-center">
              <div className="text-[10px] font-mono text-[#8faec0] uppercase">PRESSURE</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">{telemetry.environment.pressure_mbar} mbar</div>
              <div className="text-[10px] text-[#a5c4d4] font-mono mt-0.5">Atmospheric</div>
            </div>

            <div className="rounded-xl border border-[#38d4f0]/25 bg-[#0a1824] p-3 text-center">
              <div className="text-[10px] font-mono text-[#8faec0] uppercase">WIND SPEED</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{telemetry.environment.wind_speed_m_s} m/s</div>
              <div className="text-[10px] text-[#a5c4d4] font-mono mt-0.5">{telemetry.environment.wind_direction}</div>
            </div>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {isFinalInspection ? (
              <div>
                <label className="block text-[#8faec0] mb-1">FINAL VERIFICATION & ANOMALY ASSESSMENT</label>
                <input
                  type="text"
                  value={anomaly}
                  onChange={e => setAnomaly(e.target.value)}
                  className="w-full rounded-lg border border-[#1b3445] bg-[#0a1824] p-2.5 text-white focus:border-[#38d4f0] focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-[#8faec0] mb-1">SCIENTIFIC OBSERVATION LOG</label>
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
              {isFinalInspection ? "Confirm Final Environment [Task 14]" : "Save Environment Observation [Task 04]"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

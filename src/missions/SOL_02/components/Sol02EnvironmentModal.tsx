"use client";

import React, { useState } from "react";
import { Sol02MissionManager } from "../Sol02MissionManager";

interface Props {
  manager?: Sol02MissionManager;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

export function Sol02EnvironmentModal({ manager, onClose, onSaveSuccess }: Props) {
  const mgr = manager || Sol02MissionManager.getInstance();
  const telemetry = mgr.getTelemetry();
  const [notes, setNotes] = useState(
    mgr.environmentObservation?.notes ||
    "Night-time Martian surface conditions recorded: Ambient temperature dropped to -78°C with moderate surface wind at 7.4 m/s NE. Sensor array operational."
  );
  const [saved, setSaved] = useState(mgr.isTaskComplete("SOL02_TASK_04"));

  const handleSave = () => {
    mgr.saveNightEnvironmentObservation(notes);
    setSaved(true);
    onSaveSuccess?.();
    setTimeout(onClose, 500);
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 pointer-events-auto"
    >
      <div className="w-full max-w-2xl rounded-xl border border-[#38d4f0]/40 bg-[#07131e] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.85)] text-[#dbe8ee]">
        <header className="flex justify-between items-center border-b border-[#38d4f0]/20 pb-4 mb-5">
          <div>
            <div className="text-[10px] font-mono font-bold tracking-[0.16em] text-[#e88747]">
              ELYSIUM IV · NIGHT SENSOR ARRAY · SOL 02
            </div>
            <h2 className="text-xl font-bold font-kdam-thmor-pro text-white mt-1">
              Night-time Martian Environment Inspection
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded border border-[#3c596b] bg-[#0d1d28] px-3 py-1.5 text-xs text-[#a5c3d1] hover:text-white hover:border-[#38d4f0]"
          >
            Close · ESC
          </button>
        </header>

        {/* Telemetry Sensor Readout Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-lg border border-[#1f3f52] bg-[#0c1b26] p-3.5">
            <span className="text-[11px] font-mono text-[#8faec0]">SURFACE TEMPERATURE</span>
            <div className="text-2xl font-bold font-mono text-[#f0a04b] mt-1">
              {telemetry.environment.temperature_celsius} °C
            </div>
            <span className="text-[10px] text-[#7190a0]">Nocturnal radiational cooling</span>
          </div>

          <div className="rounded-lg border border-[#1f3f52] bg-[#0c1b26] p-3.5">
            <span className="text-[11px] font-mono text-[#8faec0]">SURFACE PRESSURE</span>
            <div className="text-2xl font-bold font-mono text-[#38d4f0] mt-1">
              {telemetry.environment.pressure_mbar} mbar
            </div>
            <span className="text-[10px] text-[#7190a0]">Atmospheric barometer</span>
          </div>

          <div className="rounded-lg border border-[#1f3f52] bg-[#0c1b26] p-3.5">
            <span className="text-[11px] font-mono text-[#8faec0]">WIND VELOCITY & VECTOR</span>
            <div className="text-2xl font-bold font-mono text-[#52d9a3] mt-1">
              {telemetry.environment.wind_speed_m_s} m/s
            </div>
            <span className="text-[10px] text-[#7190a0]">Direction: {telemetry.environment.wind_direction}</span>
          </div>

          <div className="rounded-lg border border-[#1f3f52] bg-[#0c1b26] p-3.5">
            <span className="text-[11px] font-mono text-[#8faec0]">ATMOSPHERIC CO2 & VISIBILITY</span>
            <div className="text-2xl font-bold font-mono text-[#e8c56c] mt-1">
              {telemetry.environment.co2_percent} %
            </div>
            <span className="text-[10px] text-[#7190a0]">Visibility: {telemetry.environment.dust_visibility} (~1.8 km)</span>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="block text-xs font-mono text-[#8faec0] mb-2">
            RESEARCHER NOCTURNAL OBSERVATION ENTRY:
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[#1f3f52] bg-[#0c1b26] p-3 text-xs font-mono text-[#dbe8ee] focus:border-[#38d4f0] focus:outline-none resize-none leading-relaxed"
          />
        </div>

        <footer className="flex justify-between items-center border-t border-[#38d4f0]/20 pt-4">
          <span className="text-[11px] font-mono text-[#8faec0]">
            STATUS:{" "}
            <strong className={saved ? "text-[#52d9a3]" : "text-[#f0a04b]"}>
              {saved ? "ENVIRONMENT SAVED TO LOG" : "PENDING SAVE"}
            </strong>
          </span>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg border border-[#38d4f0] bg-[#12364a] px-5 py-2.5 text-xs font-bold font-mono text-[#38d4f0] hover:bg-[#38d4f0] hover:text-[#07131e] transition-all shadow-[0_0_15px_rgba(56,212,240,0.25)]"
          >
            <span>💾</span> Save Night Environment Report
          </button>
        </footer>
      </div>
    </div>
  );
}

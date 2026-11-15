"use client";

import React, { useState } from "react";
import { Sol01MissionManager } from "../Sol01MissionManager";

interface Props {
  manager?: Sol01MissionManager;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

export function EnvironmentCheckModal({ manager, onClose, onSaveSuccess }: Props) {
  const mgr = manager || Sol01MissionManager.getInstance();
  const telemetry = mgr.getTelemetry();
  const [notes, setNotes] = useState(
    mgr.environmentObservation?.notes ||
    "Surface conditions verified within safe operational thresholds. Atmospheric CO2 stable, ambient barometric pressure confirmed."
  );
  const [saved, setSaved] = useState(mgr.isTaskComplete("SOL01_TASK_03"));

  const handleSave = () => {
    mgr.saveEnvironmentObservation(notes);
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
              ELYSIUM IV · TELEMETRY SENSORS
            </div>
            <h2 className="text-xl font-bold font-kdam-thmor-pro text-white mt-1">
              Environmental Conditions Check
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
              {telemetry.environment.surface_temperature_celsius} °C
            </div>
            <span className="text-[10px] text-[#7190a0]">Atmospheric boundary measurement</span>
          </div>

          <div className="rounded-lg border border-[#1f3f52] bg-[#0c1b26] p-3.5">
            <span className="text-[11px] font-mono text-[#8faec0]">EXTERNAL PRESSURE</span>
            <div className="text-2xl font-bold font-mono text-[#38d4f0] mt-1">
              {telemetry.environment.external_pressure_mbar} mbar
            </div>
            <span className="text-[10px] text-[#7190a0]">Barometric sensor reading</span>
          </div>

          <div className="rounded-lg border border-[#1f3f52] bg-[#0c1b26] p-3.5">
            <span className="text-[11px] font-mono text-[#8faec0]">WIND VELOCITY</span>
            <div className="text-2xl font-bold font-mono text-[#52d9a3] mt-1">
              {telemetry.environment.wind_speed_mps} m/s
            </div>
            <span className="text-[10px] text-[#7190a0]">Anemometer ground surface</span>
          </div>

          <div className="rounded-lg border border-[#1f3f52] bg-[#0c1b26] p-3.5">
            <span className="text-[11px] font-mono text-[#8faec0]">ATMOSPHERIC CO2</span>
            <div className="text-2xl font-bold font-mono text-[#e8c56c] mt-1">
              {telemetry.environment.co2_percentage} %
            </div>
            <span className="text-[10px] text-[#7190a0]">Spectrometric gas analysis</span>
          </div>
        </div>

        {/* Observation notes */}
        <div className="mb-5">
          <label className="block text-xs font-mono text-[#8eb0c2] mb-1.5 uppercase tracking-wider">
            Observation Log Notes
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[#213b4c] bg-[#081520] p-3 text-sm text-[#e6f2f7] outline-none focus:border-[#38d4f0]"
            placeholder="Record observations for the mission log..."
          />
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-[#38d4f0]/15">
          <span className="text-xs text-[#82a2b3]">
            {saved ? "✓ Observation recorded in mission log" : "Save required to complete Task 03"}
          </span>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="rounded border border-[#3b5869] px-4 py-2 text-xs font-bold text-[#b4cad6] hover:bg-[#122330]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded bg-[#d8763b] hover:bg-[#e88747] px-5 py-2 text-xs font-bold text-black uppercase tracking-wider transition-colors"
            >
              {saved ? "Update & Save Log" : "Record & Save to Mission Log"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

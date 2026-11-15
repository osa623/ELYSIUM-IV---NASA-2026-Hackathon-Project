"use client";

import React, { useState } from "react";
import { Sol02MissionManager } from "../Sol02MissionManager";

interface Props {
  manager?: Sol02MissionManager;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

export function BotanCheckModal({ manager, onClose, onSaveSuccess }: Props) {
  const mgr = manager || Sol02MissionManager.getInstance();
  const telemetry = mgr.getTelemetry();
  const [notes, setNotes] = useState(
    mgr.botanObservation?.notes ||
    "BOTAN hydroponics reservoir and nutrient infusion pump operational. Baseline reserves nominal for night incubation cycle."
  );
  const [saved, setSaved] = useState(mgr.isTaskComplete("SOL02_TASK_03"));

  const handleConfirm = () => {
    mgr.confirmBotanInspection(notes);
    setSaved(true);
    onSaveSuccess?.();
    setTimeout(onClose, 500);
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 pointer-events-auto"
    >
      <div className="w-full max-w-2xl rounded-xl border border-[#52d9a3]/40 bg-[#07131e] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.85)] text-[#dbe8ee]">
        <header className="flex justify-between items-center border-b border-[#52d9a3]/20 pb-4 mb-5">
          <div>
            <div className="text-[10px] font-mono font-bold tracking-[0.16em] text-[#52d9a3]">
              ELYSIUM IV · LIFE SUPPORT SYSTEM · SOL 02
            </div>
            <h2 className="text-xl font-bold font-kdam-thmor-pro text-white mt-1">
              BOTAN Nutrition System Inspection
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded border border-[#3c596b] bg-[#0d1d28] px-3 py-1.5 text-xs text-[#a5c3d1] hover:text-white hover:border-[#52d9a3]"
          >
            Close · ESC
          </button>
        </header>

        {/* Status Readouts */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-lg border border-[#1f3f52] bg-[#0c1b26] p-3.5">
            <span className="text-[11px] font-mono text-[#8faec0]">POTABLE WATER</span>
            <div className="text-2xl font-bold font-mono text-[#38d4f0] mt-1">
              {telemetry.resources.water_liters} L
            </div>
            <span className="text-[10px] text-[#7190a0]">Sterile reservoir reserve</span>
          </div>

          <div className="rounded-lg border border-[#1f3f52] bg-[#0c1b26] p-3.5">
            <span className="text-[11px] font-mono text-[#8faec0]">NUTRIENT PACKS</span>
            <div className="text-2xl font-bold font-mono text-[#52d9a3] mt-1">
              {telemetry.resources.nutrient_percent} %
            </div>
            <span className="text-[10px] text-[#7190a0]">Concentrate solution</span>
          </div>

          <div className="rounded-lg border border-[#1f3f52] bg-[#0c1b26] p-3.5">
            <span className="text-[11px] font-mono text-[#8faec0]">BOTAN SYSTEM</span>
            <div className="text-2xl font-bold font-mono text-[#52d9a3] mt-1">
              {telemetry.resources.botan_system_status}
            </div>
            <span className="text-[10px] text-[#7190a0]">Subsystem diagnostics</span>
          </div>
        </div>

        {/* Progress Bar of Botan Reserves */}
        <div className="mb-5 rounded-lg border border-[#1f3f52] bg-[#0a1824] p-3.5">
          <div className="flex justify-between text-xs font-mono text-[#8faec0] mb-2">
            <span>HYDRO-ORGANIC INTEGRATION STATUS</span>
            <span className="text-[#52d9a3] font-bold">READY FOR EXPERIMENTAL SEEDING</span>
          </div>
          <div className="h-2.5 w-full bg-[#102433] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#38d4f0] to-[#52d9a3] transition-all duration-500"
              style={{ width: `${telemetry.resources.nutrient_percent}%` }}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="block text-xs font-mono text-[#8faec0] mb-2">
            OPERATIONAL LOG ENTRY & DIAGNOSTICS:
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[#1f3f52] bg-[#0c1b26] p-3 text-xs font-mono text-[#dbe8ee] focus:border-[#52d9a3] focus:outline-none resize-none leading-relaxed"
          />
        </div>

        <footer className="flex justify-between items-center border-t border-[#52d9a3]/20 pt-4">
          <span className="text-[11px] font-mono text-[#8faec0]">
            STATUS:{" "}
            <strong className={saved ? "text-[#52d9a3]" : "text-[#f0a04b]"}>
              {saved ? "INSPECTION VALIDATED" : "CONFIRMATION REQUIRED"}
            </strong>
          </span>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 rounded-lg border border-[#52d9a3] bg-[#0e3123] px-5 py-2.5 text-xs font-bold font-mono text-[#52d9a3] hover:bg-[#52d9a3] hover:text-[#07131e] transition-all shadow-[0_0_15px_rgba(82,217,163,0.25)]"
          >
            <span>✓</span> Confirm BOTAN Inspection
          </button>
        </footer>
      </div>
    </div>
  );
}

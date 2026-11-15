"use client";

import React, { useState } from "react";
import { Sol02MissionManager } from "../Sol02MissionManager";

interface Props {
  manager?: Sol02MissionManager;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

export function Sol02ToolRackModal({ manager, onClose, onSaveSuccess }: Props) {
  const mgr = manager || Sol02MissionManager.getInstance();

  const isTask5 = mgr.currentTaskId === "SOL02_TASK_05" || !mgr.isTaskComplete("SOL02_TASK_05");
  const isTask9 = mgr.currentTaskId === "SOL02_TASK_09" || (mgr.soilSample && !mgr.sampleTransferredToRack);
  const sampleTransferred = mgr.sampleTransferredToRack;

  // Tool checklist state
  const [selectedTools, setSelectedTools] = useState<string[]>(
    mgr.toolChecklist.filter(t => t.confirmed).map(t => t.id)
  );

  const toggleTool = (id: string) => {
    setSelectedTools(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedTools(mgr.toolChecklist.map(t => t.id));
  };

  const handleConfirmTools = () => {
    mgr.confirmToolChecklist(selectedTools);
    onSaveSuccess?.();
    setTimeout(onClose, 500);
  };

  // Sample transfer state
  const [transferFeedback, setTransferFeedback] = useState<string | null>(null);

  const handleTransferSample = () => {
    if (!mgr.soilSample) {
      alert("No soil sample in inventory! You must collect the sample at the investigation site first.");
      return;
    }
    const success = mgr.confirmSampleTransferToRack();
    if (success) {
      setTransferFeedback("Sample SOL02_SOIL_SAMPLE_01 placed in rack! Automated spectrometry initialized. Sample images unlocked in Mission OS.");
      onSaveSuccess?.();
      setTimeout(onClose, 1200);
    }
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 pointer-events-auto"
    >
      <div className="w-full max-w-2xl rounded-xl border border-[#38d4f0]/40 bg-[#07131e] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.85)] text-[#dbe8ee]">
        <header className="flex justify-between items-center border-b border-[#38d4f0]/20 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#38d4f0] shadow-[0_0_10px_#38d4f0]" />
            <div>
              <div className="text-[10px] font-mono font-bold tracking-[0.16em] text-[#e88747]">
                ELYSIUM IV · EQUIPMENT & SAMPLE BAY · SOL 02
              </div>
              <h2 className="text-xl font-bold font-kdam-thmor-pro text-white mt-0.5">
                Scientific Tool Locker & Sample Rack
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded border border-[#3c596b] bg-[#0d1d28] px-3 py-1.5 text-xs text-[#a5c3d1] hover:text-white hover:border-[#38d4f0]"
          >
            Close · ESC
          </button>
        </header>

        {transferFeedback && (
          <div className="mb-4 rounded-lg border border-[#52d9a3]/40 bg-[#092218] p-3 text-sm font-mono text-[#52d9a3] flex items-center gap-2">
            <span>✓</span> {transferFeedback}
          </div>
        )}

        {/* Section 1: Sample Transfer Rack (If sample collected or waiting for transfer) */}
        {mgr.soilSample ? (
          <div className="mb-6 rounded-lg border border-[#f0a04b]/40 bg-[#121c26] p-4">
            <div className="flex items-center justify-between mb-3 border-b border-[#f0a04b]/20 pb-2">
              <span className="text-xs font-mono font-bold text-[#f0a04b] flex items-center gap-2">
                <span>🔬</span> SAMPLE ANALYSIS RACK DOCK
              </span>
              <span className="text-[11px] font-mono text-[#a5c3d1]">
                SAMPLE: <strong className="text-white">{mgr.soilSample.sample_id}</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 text-xs font-mono">
              <div className="bg-[#0a1520] p-2.5 rounded border border-[#1f3f52]">
                <div className="text-[10px] text-[#7190a0]">COLOR & TEXTURE</div>
                <div className="text-white font-bold mt-0.5">{mgr.soilSample.soil_color} / {mgr.soilSample.soil_texture}</div>
              </div>
              <div className="bg-[#0a1520] p-2.5 rounded border border-[#1f3f52]">
                <div className="text-[10px] text-[#7190a0]">DEPTH & TEMP</div>
                <div className="text-[#38d4f0] font-bold mt-0.5">{mgr.soilSample.sample_depth_cm} cm · {mgr.soilSample.soil_temperature_celsius}°C</div>
              </div>
              <div className="bg-[#0a1520] p-2.5 rounded border border-[#1f3f52]">
                <div className="text-[10px] text-[#7190a0]">RACK STATUS</div>
                <div className={sampleTransferred ? "text-[#52d9a3] font-bold mt-0.5" : "text-[#f0a04b] font-bold mt-0.5"}>
                  {sampleTransferred ? "✓ TRANSFERRED" : "AWAITING RACK PLACEMENT"}
                </div>
              </div>
            </div>

            {!sampleTransferred ? (
              <button
                onClick={handleTransferSample}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#f0a04b] bg-[#2d1b0f] py-3 text-xs font-bold font-mono text-[#f0a04b] hover:bg-[#f0a04b] hover:text-[#07131e] transition-all shadow-[0_0_15px_rgba(240,160,75,0.25)]"
              >
                <span>🧪</span> Place Soil Sample in Tools Rack & Confirm Transfer
              </button>
            ) : (
              <div className="rounded border border-[#52d9a3]/30 bg-[#092218] p-2.5 text-center text-xs font-mono text-[#52d9a3]">
                Sample transferred into tools rack. Automated soil analysis results & high-res images are unlocked in Mission OS.
              </div>
            )}
          </div>
        ) : null}

        {/* Section 2: Scientific Tools Checklist */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-mono text-[#8faec0]">
              SURFACE SAMPLING TOOLS INVENTORY:
            </span>
            <button
              onClick={handleSelectAll}
              className="text-[11px] font-mono text-[#38d4f0] hover:underline"
            >
              Verify All Tools
            </button>
          </div>

          <div className="space-y-2.5 mb-5">
            {mgr.toolChecklist.map(tool => {
              const isChecked = selectedTools.includes(tool.id);
              return (
                <div
                  key={tool.id}
                  onClick={() => toggleTool(tool.id)}
                  className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isChecked
                      ? "border-[#38d4f0]/60 bg-[#0c2436]"
                      : "border-[#1f3f52] bg-[#0c1b26] hover:border-[#38d4f0]/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center text-xs font-bold ${
                        isChecked
                          ? "border-[#38d4f0] bg-[#38d4f0] text-[#07131e]"
                          : "border-[#406377] bg-transparent"
                      }`}
                    >
                      {isChecked && "✓"}
                    </div>
                    <div>
                      <div className="text-sm font-bold font-mono text-white">
                        {tool.label}
                      </div>
                      <div className="text-[10px] text-[#7190a0]">
                        Standard EVA Geological Equipment
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold ${
                      isChecked ? "text-[#52d9a3]" : "text-[#7190a0]"
                    }`}
                  >
                    {isChecked ? "READY" : "UNCONFIRMED"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <footer className="flex justify-between items-center border-t border-[#38d4f0]/20 pt-4">
          <span className="text-[11px] font-mono text-[#8faec0]">
            READY: <strong className="text-white">{selectedTools.length}</strong> / {mgr.toolChecklist.length} VERIFIED
          </span>
          <button
            onClick={handleConfirmTools}
            className="flex items-center gap-2 rounded-lg border border-[#38d4f0] bg-[#12364a] px-5 py-2.5 text-xs font-bold font-mono text-[#38d4f0] hover:bg-[#38d4f0] hover:text-[#07131e] transition-all shadow-[0_0_15px_rgba(56,212,240,0.25)]"
          >
            <span>✓</span> Confirm Tools Verification
          </button>
        </footer>
      </div>
    </div>
  );
}

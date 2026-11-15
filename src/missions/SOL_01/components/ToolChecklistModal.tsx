"use client";

import React, { useState } from "react";
import { Sol01MissionManager } from "../Sol01MissionManager";

interface Props {
  manager?: Sol01MissionManager;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

export function ToolChecklistModal({ manager, onClose, onSaveSuccess }: Props) {
  const mgr = manager || Sol01MissionManager.getInstance();
  const [tools, setTools] = useState(
    mgr.toolChecklist.map(t => ({
      ...t,
      confirmed: mgr.isTaskComplete("SOL01_TASK_04") ? true : t.confirmed
    }))
  );
  const [confirmedAll, setConfirmedAll] = useState(mgr.isTaskComplete("SOL01_TASK_04"));

  const toggleTool = (id: string) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, confirmed: !t.confirmed } : t));
  };

  const handleSelectAll = () => {
    setTools(prev => prev.map(t => ({ ...t, confirmed: true })));
  };

  const handleSave = () => {
    const confirmedIds = tools.filter(t => t.confirmed).map(t => t.id);
    mgr.confirmToolChecklist(confirmedIds);
    setConfirmedAll(true);
    onSaveSuccess?.();
    setTimeout(onClose, 500);
  };

  const allChecked = tools.every(t => t.confirmed);

  return (
    <div
      onClick={e => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 pointer-events-auto"
    >
      <div className="w-full max-w-xl rounded-xl border border-[#38d4f0]/40 bg-[#07131e] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.85)] text-[#dbe8ee]">
        <header className="flex justify-between items-center border-b border-[#38d4f0]/20 pb-4 mb-5">
          <div>
            <div className="text-[10px] font-mono font-bold tracking-[0.16em] text-[#e88747]">
              SURFACE INVESTIGATION EQUIPMENT
            </div>
            <h2 className="text-xl font-bold font-kdam-thmor-pro text-white mt-1">
              Tool Inventory & Verification
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded border border-[#3c596b] bg-[#0d1d28] px-3 py-1.5 text-xs text-[#a5c3d1] hover:text-white hover:border-[#38d4f0]"
          >
            Close · ESC
          </button>
        </header>

        <p className="text-xs text-[#9bb5c4] mb-4">
          Verify that all required surface exploration and regolith sampling tools are present and securely stowed in the rover bay.
        </p>

        {/* Tool checklist */}
        <div className="space-y-2.5 mb-6">
          {tools.map(tool => (
            <label
              key={tool.id}
              onClick={() => toggleTool(tool.id)}
              className={`flex items-center justify-between rounded-lg border p-3.5 cursor-pointer transition-all ${
                tool.confirmed
                  ? "border-[#52d9a3]/60 bg-[#0c2420]/60 text-white"
                  : "border-[#1e3a4b] bg-[#0a1824] text-[#b8cbd6] hover:border-[#38d4f0]/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={tool.confirmed}
                  onChange={() => {}}
                  className="w-4 h-4 rounded accent-[#52d9a3] cursor-pointer pointer-events-none"
                />
                <div>
                  <div className="font-bold text-sm tracking-wide">{tool.label}</div>
                  <div className="text-[10px] font-mono text-[#7ea0b2]">ID: {tool.id}</div>
                </div>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                tool.confirmed ? "bg-[#52d9a3]/20 text-[#52d9a3]" : "bg-[#182b38] text-[#86a1b0]"
              }`}>
                {tool.confirmed ? "VERIFIED" : "UNCHECKED"}
              </span>
            </label>
          ))}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-[#38d4f0]/15">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-[#38d4f0] hover:underline"
          >
            Select All Equipment
          </button>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="rounded border border-[#3b5869] px-4 py-2 text-xs font-bold text-[#b4cad6] hover:bg-[#122330]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!allChecked}
              className={`rounded px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                allChecked
                  ? "bg-[#d8763b] hover:bg-[#e88747] text-black cursor-pointer"
                  : "bg-[#283b48] text-[#718b9c] cursor-not-allowed"
              }`}
            >
              {confirmedAll ? "Checklist Confirmed" : "Confirm Tool Checklist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Sol02MissionManager, type SoilSampleData } from "../Sol02MissionManager";

interface Props {
  manager?: Sol02MissionManager;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

export function SoilInvestigationModal({ manager, onClose, onSaveSuccess }: Props) {
  const mgr = manager || Sol02MissionManager.getInstance();

  const [soilColor, setSoilColor] = useState(mgr.soilSample?.soil_color || "Reddish Brown");
  const [soilTexture, setSoilTexture] = useState(mgr.soilSample?.soil_texture || "Granular");
  const [moistureObs, setMoistureObs] = useState(mgr.soilSample?.soil_moisture_observation || "Dry");
  const [temperature, setTemperature] = useState<number>(mgr.soilSample?.soil_temperature_celsius ?? -76.5);
  const [depth, setDepth] = useState<number>(mgr.soilSample?.sample_depth_cm ?? 12);
  const [particles, setParticles] = useState(
    mgr.soilSample?.visible_particles || "Fine quartz sand, angular ferric grains, hematite spherules"
  );
  const [notes, setNotes] = useState(
    mgr.soilSample?.researcher_notes ||
    "Bed surface core extracted with sterile sampler. Layer demonstrates uniform stratification with dark oxide crust."
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCollect = () => {
    mgr.collectSoilSample({
      soil_color: soilColor,
      soil_texture: soilTexture,
      soil_moisture_observation: moistureObs,
      soil_temperature_celsius: Number(temperature),
      sample_depth_cm: Number(depth),
      visible_particles: particles,
      researcher_notes: notes
    });
    setFeedback("Martian Soil Sample collected and sealed! Task 07 completed.");
    onSaveSuccess?.();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 pointer-events-auto"
    >
      <div className="w-full max-w-2xl rounded-xl border border-[#38d4f0]/40 bg-[#07131e] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.85)] text-[#dbe8ee]">
        <header className="flex justify-between items-center border-b border-[#38d4f0]/20 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#f0a04b] shadow-[0_0_10px_#f0a04b]" />
            <div>
              <div className="text-[10px] font-mono font-bold tracking-[0.16em] text-[#e88747]">
                ELYSIUM IV · FIELD INVESTIGATION · SOL 02
              </div>
              <h2 className="text-xl font-bold font-kdam-thmor-pro text-white mt-0.5">
                Martian Soil Sample Collection
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

        {feedback && (
          <div className="mb-4 rounded-lg border border-[#52d9a3]/40 bg-[#092218] p-3 text-sm font-mono text-[#52d9a3] flex items-center gap-2">
            <span>✓</span> {feedback}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-[#8faec0] mb-1">
                SOIL COLOR
              </label>
              <select
                value={soilColor}
                onChange={e => setSoilColor(e.target.value)}
                className="w-full rounded border border-[#1f3f52] bg-[#0c1b26] px-3 py-2 text-sm font-mono text-white focus:border-[#38d4f0] focus:outline-none"
              >
                <option value="Reddish Brown">Reddish Brown</option>
                <option value="Dark Brown">Dark Brown</option>
                <option value="Rust Red">Rust Red</option>
                <option value="Grey Brown">Grey Brown</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8faec0] mb-1">
                SOIL TEXTURE
              </label>
              <select
                value={soilTexture}
                onChange={e => setSoilTexture(e.target.value)}
                className="w-full rounded border border-[#1f3f52] bg-[#0c1b26] px-3 py-2 text-sm font-mono text-white focus:border-[#38d4f0] focus:outline-none"
              >
                <option value="Granular">Granular</option>
                <option value="Fine Dust">Fine Dust</option>
                <option value="Sandy">Sandy</option>
                <option value="Compact">Compact</option>
                <option value="Rocky">Rocky</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-[#8faec0] mb-1">
                MOISTURE OBSERVATION
              </label>
              <select
                value={moistureObs}
                onChange={e => setMoistureObs(e.target.value)}
                className="w-full rounded border border-[#1f3f52] bg-[#0c1b26] px-3 py-2 text-sm font-mono text-white focus:border-[#38d4f0] focus:outline-none"
              >
                <option value="Dry">Dry</option>
                <option value="Very Dry">Very Dry</option>
                <option value="Slightly Moist">Slightly Moist</option>
                <option value="Moist">Moist</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8faec0] mb-1">
                SAMPLE TEMP (°C)
              </label>
              <input
                type="number"
                step="0.5"
                value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                className="w-full rounded border border-[#1f3f52] bg-[#0c1b26] px-3 py-2 text-sm font-mono text-[#f0a04b] focus:border-[#38d4f0] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#8faec0] mb-1">
                DEPTH (CM)
              </label>
              <input
                type="number"
                step="1"
                value={depth}
                onChange={e => setDepth(parseInt(e.target.value, 10))}
                className="w-full rounded border border-[#1f3f52] bg-[#0c1b26] px-3 py-2 text-sm font-mono text-[#38d4f0] focus:border-[#38d4f0] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#8faec0] mb-1">
              VISIBLE PARTICLES & MINERALOGY
            </label>
            <input
              type="text"
              value={particles}
              onChange={e => setParticles(e.target.value)}
              className="w-full rounded border border-[#1f3f52] bg-[#0c1b26] px-3 py-2 text-sm font-mono text-white focus:border-[#38d4f0] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#8faec0] mb-1">
              FIELD RESEARCHER NOTES
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full rounded border border-[#1f3f52] bg-[#0c1b26] p-3 text-xs font-mono text-[#dbe8ee] focus:border-[#38d4f0] focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        <footer className="mt-6 flex justify-between items-center border-t border-[#38d4f0]/20 pt-4">
          <div className="text-[11px] font-mono text-[#8faec0]">
            SAMPLE ID: <span className="text-[#38d4f0] font-bold">SOL02_SOIL_SAMPLE_01</span>
          </div>
          <button
            onClick={handleCollect}
            className="flex items-center gap-2 rounded-lg border border-[#38d4f0] bg-[#12364a] px-5 py-2.5 text-xs font-bold font-mono text-[#38d4f0] hover:bg-[#38d4f0] hover:text-[#07131e] transition-all shadow-[0_0_15px_rgba(56,212,240,0.25)]"
          >
            <span>📥</span> Collect and Seal Sample
          </button>
        </footer>
      </div>
    </div>
  );
}

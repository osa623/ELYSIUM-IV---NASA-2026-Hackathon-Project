"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Sol03MissionManager } from "../Sol03MissionManager";
import { savePhotoToStorage, deletePhotoFromStorage, type Sol03PhotoRecord } from "../services/PhotoStorage";

interface Props {
  manager?: Sol03MissionManager;
  headingDegrees?: number;
  pitchDegrees?: number;
  playerPosition?: [number, number, number];
  getRendererCanvas?: () => HTMLCanvasElement | null;
  getCanvas?: () => HTMLCanvasElement | null;
  onClose: (savedCount?: number) => void;
  onSaveSuccess?: () => void;
}

export function EVACameraModal({
  manager,
  headingDegrees = 42,
  pitchDegrees = 0,
  playerPosition = [413.18, 425.69, -500],
  getRendererCanvas,
  getCanvas,
  onClose,
  onSaveSuccess
}: Props) {
  const mgr = manager || Sol03MissionManager.getInstance();

  const [photos, setPhotos] = useState<Sol03PhotoRecord[]>(mgr.cachedPhotos);
  const [currentPreview, setCurrentPreview] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [heading, setHeading] = useState(headingDegrees);
  const [pitch, setPitch] = useState(pitchDegrees);
  const completionHandled = useRef(false);

  useEffect(() => {
    let active = true;
    void mgr.refreshPhotos().then(saved => {
      if (!active) return;
      setPhotos(saved);
      if (saved.length >= 4 && !completionHandled.current) {
        completionHandled.current = true;
        mgr.onExitCameraCheckPhotos(saved.length);
        onSaveSuccess?.();
        onClose(saved.length);
      }
    });
    return () => { active = false; };
  }, [mgr, onClose, onSaveSuccess]);

  // Capture screenshot from active WebGL canvas
  const captureScreenshot = useCallback(() => {
    if (photos.length >= 4) {
      setFeedback("Maximum limit of 4 photographs reached.");
      return;
    }
    const canvas = getRendererCanvas?.() || getCanvas?.() || (document.querySelector("canvas") as HTMLCanvasElement | null);
    if (!canvas) {
      setFeedback("Camera sensor offline: unable to capture frame buffer.");
      return;
    }
    try {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
      setCurrentPreview(dataUrl);
      setFeedback("Frame captured in preview buffer. Click SAVE to store photograph.");
    } catch (err) {
      console.error("[EVACamera] Capture failed", err);
      setFeedback("Capture error: buffer security restriction.");
    }
  }, [photos.length, getRendererCanvas]);

  const handleSavePreview = async () => {
    if (!currentPreview) return;
    if (photos.length >= 4) {
      setFeedback("Maximum limit of 4 photographs reached.");
      return;
    }

    const headingStr = `${Math.round(heading)}° NW`;
    const newPhoto: Sol03PhotoRecord = {
      id: `PHOTO_SOL03_${Date.now()}`,
      timestamp: new Date().toISOString(),
      headingDegrees: Math.round(heading),
      pitchDegrees: Math.round(pitch),
      direction: headingStr,
      worldPosition: playerPosition,
      dataUrl: currentPreview
    };

    await savePhotoToStorage(newPhoto);
    const updated = await mgr.refreshPhotos();
    setPhotos(updated);
    setCurrentPreview(null);

    if (updated.length >= 4) {
      completionHandled.current = true;
      mgr.onExitCameraCheckPhotos(updated.length);
      onSaveSuccess?.();
      onClose(updated.length);
      setFeedback(`Photograph saved! (${updated.length}/4) — Photo task complete.`);
    } else {
      setFeedback(`Photograph saved! (${updated.length}/4) — ${4 - updated.length} more required.`);
    }
  };

  const handleDeletePreview = () => {
    setCurrentPreview(null);
    setFeedback("Preview buffer cleared.");
  };

  const handleDeleteSavedPhoto = async (id: string) => {
    await deletePhotoFromStorage(id);
    const updated = await mgr.refreshPhotos();
    setPhotos(updated);
    setFeedback("Saved photograph removed from storage.");
  };

  const handleExit = useCallback(() => {
    onClose(photos.length);
  }, [photos.length, onClose]);

  // Mouse & Keyboard shortcuts: RMB capture preview, Backspace exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Backspace" || e.code === "Escape") {
        e.preventDefault();
        handleExit();
      } else if (e.code === "KeyS" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        void handleSavePreview();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      captureScreenshot();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [handleExit, captureScreenshot]);

  return (
    <div
      onClick={e => e.stopPropagation()}
      className="fixed inset-0 z-50 flex flex-col justify-between p-6 pointer-events-auto bg-black/40 backdrop-blur-[2px] select-none text-[#dbe8ee]"
    >
      {/* Top HUD: Reticle, Heading, Quota */}
      <header className="flex justify-between items-start">
        <div className="rounded-lg border border-[#38d4f0]/40 bg-[#07131eb3] p-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f0a04b] animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-[0.16em] text-[#e88747]">
              ELYSIUM IV · EVA OPTICAL SURVEY SYSTEM
            </span>
          </div>
          <h2 className="text-lg font-bold font-kdam-thmor-pro text-white mt-0.5">
            Mountain Range Overlook Photography
          </h2>
          <div className="flex items-center gap-4 text-xs font-mono mt-1 text-[#8faec0]">
            <span>BEARING: <strong className="text-[#38d4f0]">{Math.round(heading)}° NW</strong></span>
            <span>ELEVATION: <strong className="text-white">+425.7m</strong></span>
            <span>QUOTA: <strong className={photos.length >= 4 ? "text-[#52d9a3]" : "text-[#f0a04b]"}>
              {photos.length} / 4
            </strong></span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleExit}
            className="rounded-lg border border-[#38d4f0] bg-[#0c2333]/90 px-4 py-2 text-xs font-bold font-mono text-[#38d4f0] hover:bg-[#38d4f0] hover:text-[#07131e] transition-all shadow-[0_0_15px_rgba(56,212,240,0.25)]"
          >
            Exit Camera [BACKSPACE]
          </button>
          <div className="text-[10px] font-mono text-[#a5c3d1] bg-[#07131eb3] px-3 py-1 rounded border border-[#1f3f52]">
            RMB: Capture Preview · Min 4 Photos Required
          </div>
        </div>
      </header>

      {/* Center Viewport Crosshair & Reticle */}
      <div className="relative flex-1 flex items-center justify-center pointer-events-none">
        {/* Optical Frame Borders */}
        <div className="absolute w-[70vw] h-[65vh] border border-[#38d4f0]/30 rounded-2xl flex items-center justify-center">
          {/* Corner Marks */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#38d4f0]" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#38d4f0]" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#38d4f0]" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#38d4f0]" />

          {/* Central Aim Reticle */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border border-[#38d4f0]/50" />
            <div className="absolute w-full h-[1px] bg-[#38d4f0]/60" />
            <div className="absolute h-full w-[1px] bg-[#38d4f0]/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#f0a04b]" />
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div className="absolute top-4 pointer-events-auto rounded-lg border border-[#38d4f0]/50 bg-[#07131eef] px-4 py-2 text-xs font-mono text-[#38d4f0] shadow-lg">
            {feedback}
          </div>
        )}

        {/* Freeze-frame Preview Modal Overlay */}
        {currentPreview && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/60 p-4">
            <div className="max-w-xl w-full rounded-xl border border-[#38d4f0] bg-[#07131e] p-4 shadow-2xl">
              <div className="flex justify-between items-center mb-3 text-xs font-mono">
                <span className="font-bold text-[#f0a04b]">PHOTO PREVIEW CAPTURED</span>
                <span className="text-[#8faec0]">{Math.round(heading)}° NW · {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="h-64 w-full bg-black rounded-lg overflow-hidden border border-[#1f3f52]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={handleDeletePreview}
                  className="rounded border border-[#d45555] bg-[#2a1111] px-4 py-2 text-xs font-mono text-[#d45555] hover:bg-[#d45555] hover:text-white transition-colors"
                >
                  Discard [DELETE]
                </button>
                <button
                  onClick={handleSavePreview}
                  className="rounded border border-[#52d9a3] bg-[#0e3123] px-5 py-2 text-xs font-bold font-mono text-[#52d9a3] hover:bg-[#52d9a3] hover:text-[#07131e] transition-colors shadow-[0_0_15px_rgba(82,217,163,0.3)]"
                >
                  Save Photograph [ENTER]
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tray: Controls and Saved Thumbnails */}
      <footer className="flex justify-between items-end">
        {/* Saved Photos Thumbnails */}
        <div className="flex items-center gap-3 rounded-lg border border-[#1f3f52] bg-[#07131ed0] p-3 backdrop-blur-md">
          <div className="text-[10px] font-mono text-[#8faec0] pr-2 border-r border-[#1f3f52]">
            SAVED<br />ARCHIVE<br />({photos.length}/4)
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map(idx => {
              const photo = photos[idx];
              return (
                <div
                  key={idx}
                  className={`w-14 h-11 rounded border flex items-center justify-center text-[10px] font-mono relative overflow-hidden group ${
                    photo
                      ? "border-[#52d9a3]/70 bg-black"
                      : idx < 4
                      ? "border-[#f0a04b]/40 bg-[#121c26]/60 text-[#7190a0]"
                      : "border-[#1f3f52] bg-[#07131e]/40 text-[#405660]"
                  }`}
                >
                  {photo ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.dataUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleDeleteSavedPhoto(photo.id)}
                        className="absolute inset-0 bg-red-950/80 text-white font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs transition-opacity"
                        title="Delete photo"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <span>#{idx + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button: Capture preview */}
        <div className="flex items-center gap-3">
          <button
            onClick={captureScreenshot}
            disabled={photos.length >= 4}
            className={`flex items-center gap-2.5 rounded-xl border px-6 py-3.5 text-sm font-bold font-mono transition-all ${
              photos.length >= 4
                ? "border-[#405660] bg-[#0d161d] text-[#607580] cursor-not-allowed"
                : "border-[#38d4f0] bg-[#12364a] text-[#38d4f0] hover:bg-[#38d4f0] hover:text-[#07131e] shadow-[0_0_20px_rgba(56,212,240,0.3)]"
            }`}
          >
            <span className="text-lg">📸</span> Capture Mountain Photograph [RMB]
          </button>
        </div>
      </footer>
    </div>
  );
}

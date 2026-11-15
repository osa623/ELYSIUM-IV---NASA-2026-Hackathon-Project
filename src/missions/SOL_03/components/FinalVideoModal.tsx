"use client";

import React, { useRef, useState } from "react";

interface Props {
  onClose: () => void;
  onReturnToMenu?: () => void;
}

export function FinalVideoModal({ onClose, onReturnToMenu }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasEnded, setHasEnded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleEnded = () => {
    setHasEnded(true);
    if (onReturnToMenu) {
      setTimeout(() => onReturnToMenu(), 1500);
    }
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black pointer-events-auto"
    >
      <video
        ref={videoRef}
        src="/assets/videos/finalVideo/finalVideo.mp4"
        autoPlay
        playsInline
        preload="auto"
        controls={false}
        onEnded={handleEnded}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
      />

      {/* Top Banner */}
      <div className="absolute top-6 left-8 flex items-center gap-3 pointer-events-none z-10">
        <span className="w-3 h-3 rounded-full bg-[#38d4f0] shadow-[0_0_12px_#38d4f0] animate-pulse" />
        <div className="font-mono text-xs tracking-widest text-[#38d4f0] font-bold">
          ELYSIUM IV · EXPEDITION CULMINATION · FINAL DEPARTURE
        </div>
      </div>

      {/* Controls & Skip */}
      <div className="absolute bottom-8 right-8 flex items-center gap-4 z-10">
        <button
          onClick={() => {
            if (onReturnToMenu) onReturnToMenu();
            else onClose();
          }}
          className="rounded-lg border border-[#38d4f0]/60 bg-[#0a1824]/80 px-5 py-2.5 text-xs font-mono font-bold text-[#38d4f0] hover:bg-[#38d4f0] hover:text-black transition-all shadow-[0_0_20px_rgba(56,212,240,0.3)] cursor-pointer"
        >
          {hasEnded ? "RETURN TO MAIN MENU" : "SKIP TO MAIN MENU [ESC]"}
        </button>
      </div>

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-8 text-center z-20">
          <div className="text-4xl mb-4">🚀</div>
          <h2 className="text-xl font-bold font-kdam-thmor-pro text-white mb-2">
            EXPEDITION COMPLETE · ELYSIUM IV
          </h2>
          <p className="text-sm text-[#8faec0] max-w-md font-mono mb-6">
            All exploration and scientific objectives across SOL 01, SOL 02, and SOL 03 have been successfully completed.
          </p>
          <button
            onClick={() => {
              if (onReturnToMenu) onReturnToMenu();
              else onClose();
            }}
            className="rounded-lg border border-[#38d4f0] bg-[#102e42] px-6 py-3 text-xs font-mono font-bold text-[#38d4f0] hover:bg-[#38d4f0] hover:text-black transition-colors"
          >
            RETURN TO MAIN MENU
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

export function MissionCompletionScreen({ onFinish }: { onFinish: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const finish = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(onFinish, 420);
  };

  return (
    <main
      className={`fixed inset-0 z-[100] overflow-y-auto bg-[#05080d] text-[#edf1f2] transition-opacity duration-[420ms] ${leaving ? "opacity-0" : "opacity-100"}`}
      aria-label="ELYSIUM IV mission completion"
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(165,73,38,0.22),transparent_56%),radial-gradient(ellipse_at_90%_90%,rgba(25,78,100,0.14),transparent_45%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.12] [background-image:radial-gradient(#d5e8ef_0.7px,transparent_0.8px)] [background-size:47px_47px]" />
      <section className="relative mx-auto flex min-h-full w-full max-w-5xl flex-col items-center px-6 py-8 text-center sm:px-10 sm:py-12">
        <img
          src="/assets/models/elysium_iv_official_logo_4k_transparent.png"
          alt="ELYSIUM IV"
          className="mb-5 h-auto max-h-24 w-auto max-w-[min(64vw,360px)] object-contain sm:mb-8 sm:max-h-32"
        />
        <p className="mb-3 font-mono text-[10px] tracking-[0.32em] text-[#df9567] sm:text-xs">EXPEDITION RECORD · SOL 01—03</p>
        <h1 className="max-w-3xl text-balance font-[var(--font-kanit)] text-4xl font-semibold tracking-[0.04em] text-white sm:text-6xl">
          THANK YOU FOR PLAYING
        </h1>
        <div className="my-6 h-px w-24 bg-gradient-to-r from-transparent via-[#d77a4e] to-transparent sm:my-8" />

        <div className="max-w-3xl space-y-4 text-left text-sm leading-7 text-[#bac5cb] sm:text-base sm:leading-8">
          <p className="text-center text-base text-[#eef1f1] sm:text-lg">You have successfully completed your ELYSIUM IV exploration journey.</p>
          <p>Thank you for taking the time to experience this project and explore the Martian environment with us.</p>
          <p>ELYSIUM IV was developed in a limited amount of time on modest hardware. The project involved building custom 3D environments, terrain, materials, and interactive experiences with Blender and web-based 3D technologies.</p>
          <p>This project was an opportunity to explore new ideas, experiment with 3D development, and push the limits of what could be achieved with the available hardware and development time.</p>
          <p>This is not the end of the journey. We hope to keep improving ELYSIUM IV with more features, richer environments, and new exploration experiences.</p>
          <p className="text-center text-[#e7b08e]">Thank you once again for playing.</p>
        </div>

        <aside className="mt-7 w-full max-w-2xl border border-white/10 bg-white/[0.035] px-5 py-4 text-left sm:mt-9 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-7">
          <div className="mb-3 font-mono text-[10px] tracking-[0.2em] text-[#df9567] sm:mb-0">BUILT WITH LIMITED RESOURCES</div>
          <div className="grid gap-x-8 gap-y-1 text-xs leading-6 text-[#c8d0d3] sm:grid-cols-2 sm:text-sm">
            <span>GPU · NVIDIA GeForce MX350 · 2 GB VRAM</span>
            <span>RAM · 12 GB</span>
            <span className="sm:col-span-2">TOOLS · Blender, Three.js, and web development technologies</span>
          </div>
        </aside>

        <div className="mt-7 sm:mt-9">
          <p className="text-sm font-medium tracking-wide text-[#f0d2bf] sm:text-base">Every great discovery begins with a new exploration.</p>
          <p className="mt-2 font-mono text-[9px] tracking-[0.2em] text-[#8d9aa1] sm:text-[10px]">Until the next mission. — ELYSIUM IV</p>
        </div>

        <button
          type="button"
          onClick={finish}
          disabled={leaving}
          className="mt-7 min-w-40 border border-[#dc8c60]/70 bg-[#9e5336]/20 px-8 py-3 font-mono text-xs font-semibold tracking-[0.25em] text-[#f1c0a1] transition-colors hover:bg-[#ad613f]/35 hover:text-white disabled:cursor-wait sm:mt-9"
        >
          FINISH
        </button>
      </section>
    </main>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { DAYS_CONFIG, createSolReplayState, getCompletedMissionSols, MissionManager, type MissionDayNumber, type MissionProgressState } from "@/core/MissionManager";
import { getPreparedAssetUrl } from "@/core/AssetLoading";

const SAVE_KEYS = ["phobosia_mission_progress_v4", "phobosia_mission_progress_v3", "phobosia_mission_progress_v2"];
const SOL_SAVE_PREFIX = "phobosia_mission_progress_v4_sol_";
let menuMusic: HTMLAudioElement | null = null;
type SaveInfo = { key: string; state: MissionProgressState };
type ReplayEntry = { sol: MissionDayNumber; state: MissionProgressState };
type Page = "home" | "archive" | "delete-sols" | "confirm-new";
const options = ["NEW EXPLORATION FROM SOL 1", "CONTINUE FROM THE CURRENT SOL", "SELECT PREVIOUS SOLS", "DELETE SOLS"] as const;

function readSave(): { save: SaveInfo | null; error: string } {
  try {
    for (const key of SAVE_KEYS) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const value = JSON.parse(raw) as Partial<MissionProgressState>;
      if (!Number.isInteger(value.currentDay) || (value.currentDay ?? 0) < 1 || (value.currentDay ?? 12) > 11 || !Array.isArray(value.completedStepIds))
        return { save: null, error: "An existing mission record is invalid and cannot be resumed." };
      return { save: { key, state: value as MissionProgressState }, error: "" };
    }
    return { save: null, error: "" };
  } catch {
    return { save: null, error: "Mission data could not be read. The existing record has been left untouched." };
  }
}

function readSolSaves(): SaveInfo[] {
  const entries: SaveInfo[] = [];
  for (let sol = 1; sol <= 11; sol++) {
    const key = `${SOL_SAVE_PREFIX}${sol}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const state = JSON.parse(raw) as MissionProgressState;
      if (state.currentDay === sol && Array.isArray(state.completedStepIds)) entries.push({ key, state });
    } catch { /* Ignore one damaged slot without hiding the other sols. */ }
  }
  if (!entries.length) {
    const legacy = readSave().save;
    if (legacy) entries.push(legacy);
  }
  return entries;
}

function readLastPlayedSol(): number | null {
  try {
    const value = JSON.parse(localStorage.getItem("elysium_iv_save_state") || "null");
    return value && Number.isInteger(value.sol) && value.sol >= 1 && value.sol <= 3 ? value.sol : null;
  } catch { return null; }
}

export function MainMenu({ onStartGame }: { onStartGame: (mode: "new" | "continue" | "replay", replayState?: MissionProgressState) => void }) {
  const [page, setPage] = useState<Page>("home");
  const [save, setSave] = useState<SaveInfo | null>(null);
  const [solSaves, setSolSaves] = useState<SaveInfo[]>([]);
  const [completedSols, setCompletedSols] = useState<ReplayEntry[]>([]);
  const [saveError, setSaveError] = useState("");
  const [selected, setSelected] = useState(0);
  const refresh = useCallback(() => {
    const result = readSave();
    const slots = readSolSaves();
    const candidates = [...(result.save ? [result.save] : []), ...slots].sort((a, b) => b.state.currentDay - a.state.currentDay);
    const completed = new Map<MissionDayNumber, MissionProgressState>();
    for (const candidate of candidates) for (const sol of getCompletedMissionSols(candidate.state)) if (!completed.has(sol)) completed.set(sol, candidate.state);
    // The playable three-Sol campaign stores mission completion in its own
    // mission-manager records; the generic later campaign save is unrelated.
    const keys = ["elysium_iv_sol_01_progress", "elysium_iv_sol_02_progress", "elysium_iv_sol_03_progress"];
    keys.forEach((key, index) => {
      try {
        const record = JSON.parse(localStorage.getItem(key) || "null");
        if (!record || !(index === 0 ? record.sol01Completed : index === 1 ? record.sol02Completed : record.sol03Completed)) return;
        const sol = (index + 1) as MissionDayNumber;
        if (!completed.has(sol)) {
          const base = result.save?.state ?? slots[0]?.state ?? new MissionManager().getState();
          completed.set(sol, { ...base, currentDay: sol });
        }
      } catch { /* Ignore a damaged Sol record. */ }
    });
    setSave(result.save); setSaveError(result.error); setSolSaves(slots);
    setCompletedSols([...completed].map(([sol, state]) => ({ sol, state })).sort((a, b) => a.sol - b.sol));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    if (!menuMusic) {
      menuMusic = new Audio("/assets/sounds/PHOBOSIA.mp3");
      menuMusic.loop = true;
      menuMusic.preload = "auto";
      menuMusic.volume = 0.28;
    }
    const audio = menuMusic;
    let listening = false;
    let active = true;
    const removeUnlockListeners = () => {
      document.removeEventListener("pointerdown", unlockMusic);
      document.removeEventListener("keydown", unlockMusic);
      document.removeEventListener("touchstart", unlockMusic);
      listening = false;
    };
    const tryPlay = () => {
      if (!active || !audio.paused) return;
      void audio.play().then(removeUnlockListeners).catch(() => {
        // Autoplay is commonly blocked before user input; retry on the next gesture.
      });
    };
    function unlockMusic() { tryPlay(); }
    const waitForGesture = () => {
      if (listening || !active) return;
      listening = true;
      document.addEventListener("pointerdown", unlockMusic);
      document.addEventListener("keydown", unlockMusic);
      document.addEventListener("touchstart", unlockMusic);
    };
    tryPlay();
    waitForGesture();
    return () => {
      active = false;
      removeUnlockListeners();
      audio.pause();
    };
  }, []);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") { event.preventDefault(); setSelected(value => (value + 1) % options.length); }
      else if (event.key === "ArrowUp") { event.preventDefault(); setSelected(value => (value + options.length - 1) % options.length); }
      else if (event.key === "Escape" && page !== "home") setPage("home");
      else if ((event.key === "Enter" || event.key === " ") && page === "home") activate(selected);
    };
    window.addEventListener("keydown", keydown); return () => window.removeEventListener("keydown", keydown);
  });

  const begin = (mode: "new" | "continue" | "replay", replayState?: MissionProgressState) => { onStartGame(mode, replayState); };
  const continueCurrent = () => {
    const lastPlayedSol = readLastPlayedSol();
    const current = readSave().save ?? readSolSaves().sort((a, b) => b.state.currentDay - a.state.currentDay)[0] ?? null;
    if (!current && !lastPlayedSol) { setSaveError("No saved Sol is available to continue."); return; }
    if (current && current.key !== SAVE_KEYS[0]) localStorage.setItem(SAVE_KEYS[0], JSON.stringify(current.state));
    begin("continue");
  };
  function activate(index: number) {
    if (index === 0) { refresh(); setPage("confirm-new"); }
    if (index === 1) continueCurrent();
    if (index === 2) { refresh(); setPage("archive"); }
    if (index === 3) { refresh(); setPage("delete-sols"); }
  }

  const confirmNew = () => {
    if (save || solSaves.length) { for (const key of SAVE_KEYS) localStorage.removeItem(key); for (let sol = 1; sol <= 11; sol++) localStorage.removeItem(`${SOL_SAVE_PREFIX}${sol}`); }
    try { sessionStorage.removeItem("phobosia_paused_game_session_v1"); } catch { /* Session storage may be unavailable. */ }
    setPage("home");
    onStartGame("new");
  };
  const currentDay = save?.state.currentDay;
  const day = currentDay ? DAYS_CONFIG[currentDay as MissionDayNumber] : null;
  const task = day?.steps.find(step => !save?.state.completedStepIds.includes(step.stepId));
  return <div className="ph-menu">
    <div className="ph-menu-art" aria-hidden="true" />
    <div className="ph-menu-vignette" aria-hidden="true" />
    <header className="ph-menu-header"><div className="ph-wordmark">ELYSIUM IV<span>FIELD OBSERVATION PROGRAM</span></div><div className="ph-header-status"><i /> DEEP SPACE LINK <b>ACTIVE</b></div></header>
    <div className="ph-menu-content">
      <section className="ph-menu-title"><div className="ph-kicker">MARS · SCIENTIFIC EXPEDITION</div><img className="ph-menu-logo" src={getPreparedAssetUrl("/assets/images/elysium_iv_official_logo_4k_transparent.png")} alt="ELYSIUM IV"/><p>Observe carefully. Record honestly.<br/>Advance human understanding.</p><div className="ph-menu-rule"><span>MISSION CONTROL</span><i /></div></section>
    <nav className="ph-options" aria-label="Mission menu">{options.map((label, index) => {
        const disabled = index === 1 && !save && !solSaves.length && !readLastPlayedSol();
        return <button key={label} className={`ph-option ${selected === index ? "is-selected" : ""} ${disabled ? "is-disabled" : ""}`} onMouseEnter={() => setSelected(index)} onClick={() => activate(index)} aria-disabled={disabled}>
          <span className="ph-option-index">0{index + 1}</span><span>{label}</span><i />
        </button>;
      })}</nav>
    </div>
    <footer className="ph-menu-footer"><span>ELYSIUM IV EXPEDITION SYSTEMS <b>·</b> SOL {currentDay ? String(currentDay).padStart(2,"0") : "01"}</span><span>↑ ↓ SELECT <b>·</b> ENTER CONFIRM</span><span>BUILD 01.09 <b>·</b> MARS ORBIT</span></footer>
    {saveError && <button className="ph-toast" onClick={() => setSaveError("")}>{saveError}<span>Ã—</span></button>}
    {page !== "home" && <div className="ph-modal-backdrop"><section className="ph-modal">
      <button className="ph-back" onClick={() => setPage("home")}>â† RETURN TO MENU</button>
      {page === "confirm-new" && <><div className="ph-kicker">CAMPAIGN INITIALIZATION</div><h2>NEW EXPLORATION FROM SOL 1</h2><p>{save || solSaves.length ? "Starting a new exploration clears the current saved campaign. Select Previous Sols first if you want to resume an existing record." : "A new scientific exploration will begin from Sol 1."}</p><div className="ph-modal-actions"><button className="ph-primary" onClick={confirmNew}>START FROM SOL 1</button><button onClick={() => setPage("home")}>CANCEL</button></div></>}
      {page === "archive" && <><div className="ph-kicker">COMPLETED CAMPAIGN RECORDS</div><h2>SELECT COMPLETED SOL TO REPLAY</h2><div className="ph-sol-list">{completedSols.length ? completedSols.map(({ sol, state }) => { const solDay = DAYS_CONFIG[sol]; const completedCount = solDay.steps.filter(step => state.completedStepIds.includes(step.stepId)).length; return <article className="ph-sol-card" key={sol}><div className="ph-record-sol">SOL {String(sol).padStart(2,"0")}<small>COMPLETED</small></div><div><h3>{solDay.title}</h3><p>{solDay.primaryObjective}</p><p>Progress · {completedCount} of {solDay.steps.length} mission tasks completed</p></div><div className="ph-sol-actions"><button className="ph-primary" onClick={() => { try { sessionStorage.removeItem("phobosia_paused_game_session_v1"); } catch { /* Session storage may be unavailable. */ } begin("replay", createSolReplayState(state, sol)); }}>REPLAY SOL</button></div></article>; }) : <p>{saveError || "No completed Sols are available to replay yet."}</p>}</div></>}
      {page === "delete-sols" && <><div className="ph-kicker">PERSISTED CAMPAIGN RECORDS</div><h2>DELETE SOLS</h2><p>Delete individual saved Sols. This cannot be undone.</p><div className="ph-sol-list">{solSaves.length ? solSaves.sort((a,b) => a.state.currentDay-b.state.currentDay).map(slot => <article className="ph-sol-card" key={slot.key}><div className="ph-record-sol">SOL {String(slot.state.currentDay).padStart(2,"0")}<small>SAVED RECORD</small></div><div><h3>{DAYS_CONFIG[slot.state.currentDay as MissionDayNumber]?.title || `Sol ${slot.state.currentDay}`}</h3><p>{slot.state.completedStepIds.length} recorded task completions</p></div><div className="ph-sol-actions"><button onClick={() => { if (window.confirm(`Delete the Sol ${slot.state.currentDay} save?`)) { localStorage.removeItem(slot.key); if (slot.state.currentDay === save?.state.currentDay) for (const key of SAVE_KEYS) localStorage.removeItem(key); refresh(); } }}>DELETE SOL</button></div></article>) : <p>No persisted Sol records are available to delete.</p>}</div>{solSaves.length > 1 && <div className="ph-modal-actions"><button onClick={() => { if (window.confirm("Delete all saved Sols? This cannot be undone.")) { for (const key of SAVE_KEYS) localStorage.removeItem(key); for (let sol = 1; sol <= 11; sol++) localStorage.removeItem(`${SOL_SAVE_PREFIX}${sol}`); refresh(); } }}>DELETE ALL SOLS</button></div>}</>}
    </section></div>}
  </div>;
}



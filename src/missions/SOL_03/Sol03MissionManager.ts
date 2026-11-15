import sol03Config from "@/jsons/Missions/sol-03.json";
import { getPhotosFromStorage, type Sol03PhotoRecord } from "./services/PhotoStorage";

export type Sol03TaskId =
  | "SOL03_TASK_01"
  | "SOL03_TASK_02"
  | "SOL03_TASK_03"
  | "SOL03_TASK_04"
  | "SOL03_TASK_05"
  | "SOL03_TASK_06"
  | "SOL03_TASK_07"
  | "SOL03_TASK_08"
  | "SOL03_TASK_09"
  | "SOL03_TASK_10"
  | "SOL03_TASK_11"
  | "SOL03_TASK_12"
  | "SOL03_TASK_13"
  | "SOL03_TASK_14"
  | "SOL03_TASK_15"
  | "SOL03_TASK_16";

export type Sol03TelemetryProfileKey = "initial" | "checkpoint_mountain" | "final_destination";

export interface Sol03TelemetryData {
  environment: {
    temperature_celsius: number;
    pressure_mbar: number;
    wind_speed_m_s: number;
    wind_direction: string;
    co2_percent: number;
    dust_visibility: string;
    visibility_km: number;
  };
  cabin: {
    oxygen_percent: number;
    air_filter_percent: number;
    battery_percent: number;
    cabin_pressure_kpa: number;
    cabin_co2_percent: number;
    cabin_temperature_celsius: number;
    system_status: string;
  };
  resources: {
    water_percent: number;
    water_liters: number;
    nutrient_percent: number;
    status: string;
  };
}

export interface Sol03ResearchLog {
  heading: string;
  mountainObservations: string;
  photoReferences: string;
  mountainHeading: string;
  temperature: string;
  environmentalConditions: string;
  researcherNotes: string;
  savedAt: string;
}

export interface Sol03FinalReport {
  heading: string;
  executiveSummary: string;
  sol01Evaluation: string;
  sol02Evaluation: string;
  sol03Evaluation: string;
  recommendations: string;
  savedAt: string;
}

export interface Sol03ToolItem {
  id: string;
  label: string;
  confirmed: boolean;
}

export interface Sol03MissionLog {
  log_id: string;
  mission_id: "SOL_03";
  log_type: string;
  timestamp: string;
  sol_number: 3;
  location: string;
  telemetry_snapshot: Partial<Sol03TelemetryData>;
  user_entry: string;
  saved: boolean;
}

export interface Sol03StorageState {
  currentTaskId: Sol03TaskId;
  completedTaskIds: string[];
  telemetryProfile: Sol03TelemetryProfileKey;
  missionLogs: Sol03MissionLog[];
  toolChecklist: Sol03ToolItem[];
  waterObservation: any | null;
  environmentObservation: any | null;
  researchLog: Sol03ResearchLog | null;
  finalReport: Sol03FinalReport | null;
  finalWaterInspection: { confirmed: boolean; anomaly: string } | null;
  finalEnvInspection: { confirmed: boolean; anomaly: string } | null;
  finalToolInspection: boolean;
  sol03Completed: boolean;
  expeditionCompleted: boolean;
}

const STORAGE_KEY = "elysium_iv_sol_03_progress";
const SOL01_STORAGE_KEY = "elysium_iv_sol_01_progress";
const SOL02_STORAGE_KEY = "elysium_iv_sol_02_progress";

const DEFAULT_SOL03_TOOLS: Sol03ToolItem[] = [
  { id: "optical_survey_camera", label: "High-Resolution Optical Survey Camera", confirmed: false },
  { id: "telemetry_ranging_lidar", label: "Handheld Telemetry Ranging LiDAR", confirmed: false },
  { id: "multispectral_sensor", label: "Geological Multispectral Lens Kit", confirmed: false },
  { id: "sample_archive_canister", label: "Mountain Specimen Container", confirmed: false }
];

export class Sol03MissionManager {
  private static instance: Sol03MissionManager | null = null;

  public currentTaskId: Sol03TaskId = "SOL03_TASK_01";
  public completedTaskIds: Set<string> = new Set();
  public telemetryProfile: Sol03TelemetryProfileKey = "initial";
  public missionLogs: Sol03MissionLog[] = [];
  public toolChecklist: Sol03ToolItem[] = DEFAULT_SOL03_TOOLS.map(t => ({ ...t }));
  public waterObservation: any | null = null;
  public environmentObservation: any | null = null;
  public researchLog: Sol03ResearchLog | null = null;
  public finalReport: Sol03FinalReport | null = null;
  public finalWaterInspection: { confirmed: boolean; anomaly: string } | null = null;
  public finalEnvInspection: { confirmed: boolean; anomaly: string } | null = null;
  public finalToolInspection: boolean = false;
  public sol03Completed: boolean = false;
  public expeditionCompleted: boolean = false;
  public showFinalVideo: boolean = false;

  public cachedPhotos: Sol03PhotoRecord[] = [];

  private listeners: Set<() => void> = new Set();

  public static getInstance(): Sol03MissionManager {
    if (!Sol03MissionManager.instance) {
      Sol03MissionManager.instance = new Sol03MissionManager();
    }
    return Sol03MissionManager.instance;
  }

  constructor() {
    this.loadFromStorage();
    void this.refreshPhotos();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(fn => {
      try { fn(); } catch (e) { console.error(e); }
    });
  }

  public async refreshPhotos(): Promise<Sol03PhotoRecord[]> {
    try {
      this.cachedPhotos = await getPhotosFromStorage();
      this.notify();
      return this.cachedPhotos;
    } catch {
      return [];
    }
  }

  public getTelemetry(): Sol03TelemetryData {
    const profile = sol03Config.telemetry_profiles[this.telemetryProfile];
    return profile as Sol03TelemetryData;
  }

  public getTasks() {
    return sol03Config.tasks;
  }

  public getCurrentTask() {
    return sol03Config.tasks.find(t => t.id === this.currentTaskId) ?? sol03Config.tasks[0];
  }

  public isTaskComplete(taskId: string): boolean {
    return this.completedTaskIds.has(taskId);
  }

  public getSol01PreviousRecords(): any {
    try {
      const raw = localStorage.getItem(SOL01_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public getSol02PreviousRecords(): any {
    try {
      const raw = localStorage.getItem(SOL02_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public getActiveDestination(): string {
    switch (this.currentTaskId) {
      case "SOL03_TASK_01":
        return "ladder";
      case "SOL03_TASK_02":
        return "Main_Screen_Trigger";
      case "SOL03_TASK_03":
        return "Water_and_nut_Trigger";
      case "SOL03_TASK_04":
        return "Environment_Checking_Trigger";
      case "SOL03_TASK_05":
        return "Tool_Section_Trigger";
      case "SOL03_TASK_06":
        return "Sol3_Checkpoint";
      case "SOL03_TASK_07":
        return "Sol3_Checkpoint";
      case "SOL03_TASK_08":
        return "ladder";
      case "SOL03_TASK_09":
      case "SOL03_TASK_10":
        return "Main_Screen_Trigger";
      case "SOL03_TASK_11":
        return "SOL3_Finishing_Point";
      case "SOL03_TASK_12":
        return "Main_Screen_Trigger";
      case "SOL03_TASK_13":
        return "Water_and_nut_Trigger";
      case "SOL03_TASK_14":
        return "Environment_Checking_Trigger";
      case "SOL03_TASK_15":
        return "Tool_Section_Trigger";
      case "SOL03_TASK_16":
        return "Main_Screen_Trigger";
      default:
        return "SOL3_Finishing_Point";
    }
  }

  public completeTask(taskId: Sol03TaskId): boolean {
    if (this.completedTaskIds.has(taskId)) return false;

    const taskIndex = sol03Config.tasks.findIndex(t => t.id === taskId);
    if (taskIndex > 0) {
      const prevTaskId = sol03Config.tasks[taskIndex - 1].id;
      if (!this.completedTaskIds.has(prevTaskId)) {
        console.warn(`[Sol03Mission] Cannot complete ${taskId}: previous task ${prevTaskId} not completed.`);
        return false;
      }
    }

    this.completedTaskIds.add(taskId);

    const nextIndex = taskIndex + 1;
    if (nextIndex < sol03Config.tasks.length) {
      this.currentTaskId = sol03Config.tasks[nextIndex].id as Sol03TaskId;
    }

    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Task 01: Entered Rover */
  public onPlayerEnterRover(): boolean {
    if (this.currentTaskId === "SOL03_TASK_01") {
      return this.completeTask("SOL03_TASK_01");
    }
    return false;
  }

  /** Task 02: Review previous records */
  public onReviewPreviousRecords(): boolean {
    const log: Sol03MissionLog = {
      log_id: `LOG_SOL03_REV_${Date.now()}`,
      mission_id: "SOL_03",
      log_type: "PREVIOUS_MISSIONS_REVIEW",
      timestamp: new Date().toISOString(),
      sol_number: 3,
      location: "TERRAIN ROVER CABIN · MAIN OS CONSOLE",
      telemetry_snapshot: this.getTelemetry(),
      user_entry: "SOL 01 surface reconnaissance and SOL 02 night soil spectrometry records audited. Baseline readiness verified for highland mountain survey.",
      saved: true
    };
    this.missionLogs.push(log);
    if (this.currentTaskId === "SOL03_TASK_02") {
      return this.completeTask("SOL03_TASK_02");
    }
    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Task 03: Inspect water & nutrition */
  public confirmWaterNutrition(notes: string): boolean {
    const telemetry = this.getTelemetry();
    this.waterObservation = {
      inspected_at: new Date().toISOString(),
      water_percent: telemetry.resources.water_percent,
      water_liters: telemetry.resources.water_liters,
      nutrient_percent: telemetry.resources.nutrient_percent,
      notes: notes.trim()
    };
    const log: Sol03MissionLog = {
      log_id: `LOG_SOL03_RES_${Date.now()}`,
      mission_id: "SOL_03",
      log_type: "RESOURCE_INSPECTION",
      timestamp: new Date().toISOString(),
      sol_number: 3,
      location: "LIFE SUPPORT DISPENSER",
      telemetry_snapshot: { resources: telemetry.resources },
      user_entry: notes.trim() || `Water level verified: ${telemetry.resources.water_percent}% (${telemetry.resources.water_liters}L), Nutrient concentrate: ${telemetry.resources.nutrient_percent}%. System operational for highland ascent.`,
      saved: true
    };
    this.missionLogs.push(log);
    if (this.currentTaskId === "SOL03_TASK_03") {
      return this.completeTask("SOL03_TASK_03");
    }
    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Task 04: Inspect environment & oxygen */
  public saveEnvironmentObservation(notes: string): boolean {
    const telemetry = this.getTelemetry();
    this.environmentObservation = {
      recorded_at: new Date().toISOString(),
      temperature_celsius: telemetry.environment.temperature_celsius,
      pressure_mbar: telemetry.environment.pressure_mbar,
      wind_speed_m_s: telemetry.environment.wind_speed_m_s,
      notes: notes.trim()
    };
    const log: Sol03MissionLog = {
      log_id: `LOG_SOL03_ENV_${Date.now()}`,
      mission_id: "SOL_03",
      log_type: "ENVIRONMENT_INSPECTION",
      timestamp: new Date().toISOString(),
      sol_number: 3,
      location: "ENVIRONMENT SENSOR CONSOLE",
      telemetry_snapshot: { environment: telemetry.environment },
      user_entry: notes.trim() || `Daytime environment recorded: Temp ${telemetry.environment.temperature_celsius}°C, Pressure ${telemetry.environment.pressure_mbar} mbar, Wind ${telemetry.environment.wind_speed_m_s} m/s ${telemetry.environment.wind_direction}. Atmospheric CO2 ${telemetry.environment.co2_percent}%.`,
      saved: true
    };
    this.missionLogs.push(log);
    if (this.currentTaskId === "SOL03_TASK_04") {
      return this.completeTask("SOL03_TASK_04");
    }
    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Task 05: Confirm tool checklist */
  public confirmToolChecklist(confirmedToolIds: string[]): boolean {
    this.toolChecklist.forEach(item => {
      item.confirmed = confirmedToolIds.includes(item.id);
    });
    const log: Sol03MissionLog = {
      log_id: `LOG_SOL03_TOOL_${Date.now()}`,
      mission_id: "SOL_03",
      log_type: "TOOL_INSPECTION",
      timestamp: new Date().toISOString(),
      sol_number: 3,
      location: "SCIENTIFIC TOOLS LOCKER",
      telemetry_snapshot: {},
      user_entry: `Highland optical camera and LiDAR instruments secured: ${this.toolChecklist.map(t => `${t.label} (${t.confirmed ? "Ready" : "Missing"})`).join(", ")}.`,
      saved: true
    };
    this.missionLogs.push(log);
    if (this.currentTaskId === "SOL03_TASK_05") {
      return this.completeTask("SOL03_TASK_05");
    }
    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Task 06: Reached Sol3_Checkpoint */
  public onReachCheckpoint(): boolean {
    if (this.currentTaskId === "SOL03_TASK_06") {
      this.telemetryProfile = "checkpoint_mountain";
      return this.completeTask("SOL03_TASK_06");
    }
    return false;
  }

  /** Task 07: Validate saved photographs on camera exit */
  public onExitCameraCheckPhotos(savedCount: number): boolean {
    if (savedCount >= 4) {
      if (this.currentTaskId === "SOL03_TASK_07") {
        this.completeTask("SOL03_TASK_07");
      }
      return true;
    }
    return false;
  }

  /** Task 08: Player returned to rover after photography */
  public onReturnToRover(): boolean {
    if (this.currentTaskId === "SOL03_TASK_08") {
      return this.completeTask("SOL03_TASK_08");
    }
    return false;
  }

  /** Task 09: Review photos in Mission OS */
  public onReviewPhotoGallery(): boolean {
    if (this.currentTaskId === "SOL03_TASK_09") {
      return this.completeTask("SOL03_TASK_09");
    }
    return false;
  }

  /** Task 10: Submit research log */
  public saveResearchLog(log: Sol03ResearchLog): boolean {
    this.researchLog = { ...log, savedAt: new Date().toISOString() };
    const missionLog: Sol03MissionLog = {
      log_id: `LOG_SOL03_RES_LOG_${Date.now()}`,
      mission_id: "SOL_03",
      log_type: "MOUNTAIN_RESEARCH_LOG",
      timestamp: new Date().toISOString(),
      sol_number: 3,
      location: "HIGHLAND OVERLOOK SURVEY POST",
      telemetry_snapshot: this.getTelemetry(),
      user_entry: `Mountain Research Log submitted: ${log.heading}. Observations: ${log.mountainObservations}. References: ${log.photoReferences}.`,
      saved: true
    };
    this.missionLogs.push(missionLog);
    if (this.currentTaskId === "SOL03_TASK_10") {
      return this.completeTask("SOL03_TASK_10");
    }
    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Task 11: Reached finishing point */
  public onReachFinishingPoint(): boolean {
    if (this.currentTaskId === "SOL03_TASK_11") {
      this.telemetryProfile = "final_destination";
      return this.completeTask("SOL03_TASK_11");
    }
    return false;
  }

  /** Task 12: Save final consolidated report */
  public saveFinalReport(report: Sol03FinalReport): boolean {
    this.finalReport = { ...report, savedAt: new Date().toISOString() };
    const missionLog: Sol03MissionLog = {
      log_id: `LOG_SOL03_FINAL_REP_${Date.now()}`,
      mission_id: "SOL_03",
      log_type: "FINAL_EXPEDITION_REPORT",
      timestamp: new Date().toISOString(),
      sol_number: 3,
      location: "MISSION CULMINATION TERMINUS",
      telemetry_snapshot: this.getTelemetry(),
      user_entry: `Final Expedition Report: ${report.heading}. Summary: ${report.executiveSummary}`,
      saved: true
    };
    this.missionLogs.push(missionLog);
    if (this.currentTaskId === "SOL03_TASK_12") {
      return this.completeTask("SOL03_TASK_12");
    }
    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Task 13: Final water confirmation */
  public confirmFinalWater(anomaly: string): boolean {
    this.finalWaterInspection = { confirmed: true, anomaly: anomaly.trim() };
    if (this.currentTaskId === "SOL03_TASK_13") {
      return this.completeTask("SOL03_TASK_13");
    }
    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Task 14: Final environment confirmation */
  public confirmFinalEnvironment(anomaly: string): boolean {
    this.finalEnvInspection = { confirmed: true, anomaly: anomaly.trim() };
    if (this.currentTaskId === "SOL03_TASK_14") {
      return this.completeTask("SOL03_TASK_14");
    }
    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Task 15: Final tool inspection */
  public confirmFinalTools(): boolean {
    this.finalToolInspection = true;
    if (this.currentTaskId === "SOL03_TASK_15") {
      return this.completeTask("SOL03_TASK_15");
    }
    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Check whether Complete Journey button can be enabled */
  public canCompleteJourney(): boolean {
    return (
      this.completedTaskIds.size >= 15 &&
      this.cachedPhotos.length >= 4 &&
      this.researchLog !== null &&
      this.finalReport !== null &&
      this.finalWaterInspection !== null &&
      this.finalEnvInspection !== null &&
      this.finalToolInspection === true
    );
  }

  /** Task 16: Complete Journey button clicked */
  public completeJourney(): boolean {
    if (!this.canCompleteJourney()) {
      console.warn("[Sol03Mission] Complete Journey prerequisites not met.");
      return false;
    }
    this.completeTask("SOL03_TASK_16");
    this.sol03Completed = true;
    this.expeditionCompleted = true;
    this.showFinalVideo = true;
    this.saveToStorage();
    this.notify();
    return true;
  }

  public saveToStorage(): void {
    try {
      const data: Sol03StorageState = {
        currentTaskId: this.currentTaskId,
        completedTaskIds: Array.from(this.completedTaskIds),
        telemetryProfile: this.telemetryProfile,
        missionLogs: this.missionLogs,
        toolChecklist: this.toolChecklist,
        waterObservation: this.waterObservation,
        environmentObservation: this.environmentObservation,
        researchLog: this.researchLog,
        finalReport: this.finalReport,
        finalWaterInspection: this.finalWaterInspection,
        finalEnvInspection: this.finalEnvInspection,
        finalToolInspection: this.finalToolInspection,
        sol03Completed: this.sol03Completed,
        expeditionCompleted: this.expeditionCompleted
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("[Sol03Mission] Could not save to localStorage", e);
    }
  }

  public loadFromStorage(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data: Sol03StorageState = JSON.parse(raw);
      if (data && Array.isArray(data.completedTaskIds)) {
        this.completedTaskIds = new Set(data.completedTaskIds);
        this.currentTaskId = data.currentTaskId || "SOL03_TASK_01";
        this.telemetryProfile = data.telemetryProfile || "initial";
        this.missionLogs = data.missionLogs || [];
        this.toolChecklist = data.toolChecklist || DEFAULT_SOL03_TOOLS.map(t => ({ ...t }));
        this.waterObservation = data.waterObservation || null;
        this.environmentObservation = data.environmentObservation || null;
        this.researchLog = data.researchLog || null;
        this.finalReport = data.finalReport || null;
        this.finalWaterInspection = data.finalWaterInspection || null;
        this.finalEnvInspection = data.finalEnvInspection || null;
        this.finalToolInspection = Boolean(data.finalToolInspection);
        this.sol03Completed = Boolean(data.sol03Completed);
        this.expeditionCompleted = Boolean(data.expeditionCompleted);
        return true;
      }
    } catch (e) {
      console.warn("[Sol03Mission] Could not load from localStorage", e);
    }
    return false;
  }
}

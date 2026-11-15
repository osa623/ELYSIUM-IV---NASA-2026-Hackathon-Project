import sol02Config from "@/jsons/Missions/sol-02.json";

export type Sol02TaskId =
  | "SOL02_TASK_01"
  | "SOL02_TASK_02"
  | "SOL02_TASK_03"
  | "SOL02_TASK_04"
  | "SOL02_TASK_05"
  | "SOL02_TASK_06"
  | "SOL02_TASK_07"
  | "SOL02_TASK_08"
  | "SOL02_TASK_09"
  | "SOL02_TASK_10"
  | "SOL02_TASK_11"
  | "SOL02_TASK_12";

export type Sol02TelemetryProfileKey = "arrival" | "investigation_complete";

export interface Sol02TelemetryData {
  environment: {
    temperature_celsius: number;
    pressure_mbar: number;
    wind_speed_m_s: number;
    wind_direction: string;
    co2_percent: number;
    dust_visibility: string;
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
    water_liters: number;
    nutrient_percent: number;
    botan_system_status: string;
  };
}

export interface SoilSampleData {
  sample_id: string;
  collected_at: string;
  soil_color: string;
  soil_texture: string;
  soil_moisture_observation: string;
  soil_temperature_celsius: number;
  sample_depth_cm: number;
  visible_particles: string;
  researcher_notes: string;
}

export interface Sol02MissionLog {
  log_id: string;
  mission_id: "SOL_02";
  log_type:
    | "SOL_01_PREVIOUS_MISSION_REVIEW"
    | "SOL_02_BOTAN_SYSTEM_INSPECTION"
    | "SOL_02_NIGHT_ENVIRONMENT"
    | "SOL_02_TOOL_INVENTORY"
    | "SOL_02_SOIL_COLLECTION"
    | "SOL_02_SOIL_ANALYSIS"
    | "SOL_02_FINAL_REPORT";
  timestamp: string;
  sol_number: 2;
  location: string;
  telemetry_snapshot: Partial<Sol02TelemetryData>;
  soil_sample_id?: string;
  user_entry: string;
  analysis_snapshot?: any;
  saved: boolean;
}

export interface Sol02ToolItem {
  id: string;
  label: string;
  confirmed: boolean;
}

export interface Sol02StorageState {
  currentTaskId: Sol02TaskId;
  completedTaskIds: string[];
  telemetryProfile: Sol02TelemetryProfileKey;
  missionLogs: Sol02MissionLog[];
  toolChecklist: Sol02ToolItem[];
  botanObservation: any | null;
  environmentObservation: any | null;
  soilSample: SoilSampleData | null;
  sampleTransferredToRack: boolean;
  imagesUnlocked: boolean;
  scientificReportSaved: boolean;
  sol02Completed: boolean;
}

const STORAGE_KEY = "elysium_iv_sol_02_progress";
const SOL01_STORAGE_KEY = "elysium_iv_sol_01_progress";

const DEFAULT_SOL02_TOOLS: Sol02ToolItem[] = [
  { id: "soil_sampling_tool", label: "Soil Sampling Tool", confirmed: false },
  { id: "soil_collection_container", label: "Soil Collection Container", confirmed: false },
  { id: "environmental_sensor", label: "Environmental Sensor", confirmed: false },
  { id: "sample_storage_container", label: "Sample Storage Container", confirmed: false }
];

export class Sol02MissionManager {
  private static instance: Sol02MissionManager | null = null;

  public currentTaskId: Sol02TaskId = "SOL02_TASK_01";
  public completedTaskIds: Set<string> = new Set();
  public telemetryProfile: Sol02TelemetryProfileKey = "arrival";
  public missionLogs: Sol02MissionLog[] = [];
  public toolChecklist: Sol02ToolItem[] = DEFAULT_SOL02_TOOLS.map(t => ({ ...t }));
  public botanObservation: any | null = null;
  public environmentObservation: any | null = null;
  public soilSample: SoilSampleData | null = null;
  public sampleTransferredToRack: boolean = false;
  public imagesUnlocked: boolean = false;
  public scientificReportSaved: boolean = false;
  public sol02Completed: boolean = false;

  private listeners: Set<() => void> = new Set();

  public static getInstance(): Sol02MissionManager {
    if (!Sol02MissionManager.instance) {
      Sol02MissionManager.instance = new Sol02MissionManager();
    }
    return Sol02MissionManager.instance;
  }

  constructor() {
    this.loadFromStorage();
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

  public getTelemetry(): Sol02TelemetryData {
    const profile = sol02Config.telemetry_profiles[this.telemetryProfile];
    return profile as Sol02TelemetryData;
  }

  public getTasks() {
    return sol02Config.tasks;
  }

  public getCurrentTask() {
    return sol02Config.tasks.find(t => t.id === this.currentTaskId) ?? sol02Config.tasks[0];
  }

  public isTaskComplete(taskId: string): boolean {
    return this.completedTaskIds.has(taskId);
  }

  /**
   * Reads previous SOL 01 records from localStorage without modifying them
   */
  public getSol01PreviousRecords(): any {
    try {
      const raw = localStorage.getItem(SOL01_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("[Sol02Mission] Could not read SOL 01 records", e);
    }
    return null;
  }

  /**
   * Gets active destination for navigation beam and radar
   */
  public getActiveDestination(): string {
    switch (this.currentTaskId) {
      case "SOL02_TASK_01":
        return "ladder";
      case "SOL02_TASK_02":
        return "Main_Screen_Trigger";
      case "SOL02_TASK_03":
        return "Water_and_nut_Trigger";
      case "SOL02_TASK_04":
        return "Environment_Checking_Trigger";
      case "SOL02_TASK_05":
        return "Tool_Section_Trigger";
      case "SOL02_TASK_06":
        return "Sol2_Checkpoint";
      case "SOL02_TASK_07":
        return "Sol2_Mission_investigation";
      case "SOL02_TASK_08":
        return "ladder";
      case "SOL02_TASK_09":
        return "Tool_Section_Trigger";
      case "SOL02_TASK_10":
        return "Main_Screen_Trigger";
      case "SOL02_TASK_11":
        return "Sol2_Finishing_Point";
      case "SOL02_TASK_12":
        return "Sol2_Finishing_Point";
      default:
        return "Sol2_Finishing_Point";
    }
  }

  /** Completes a task following strict sequence rules */
  public completeTask(taskId: Sol02TaskId): boolean {
    if (this.completedTaskIds.has(taskId)) return false;

    const taskIndex = sol02Config.tasks.findIndex(t => t.id === taskId);
    if (taskIndex > 0) {
      const prevTaskId = sol02Config.tasks[taskIndex - 1].id;
      if (!this.completedTaskIds.has(prevTaskId)) {
        console.warn(`[Sol02Mission] Cannot complete ${taskId}: previous task ${prevTaskId} not completed.`);
        return false;
      }
    }

    this.completedTaskIds.add(taskId);

    const nextIndex = taskIndex + 1;
    if (nextIndex < sol02Config.tasks.length) {
      this.currentTaskId = sol02Config.tasks[nextIndex].id as Sol02TaskId;
    } else {
      this.sol02Completed = true;
      this.unlockSol03();
    }

    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Task 01: Player entered rover */
  public onPlayerEnterRover(): boolean {
    if (this.currentTaskId === "SOL02_TASK_01") {
      return this.completeTask("SOL02_TASK_01");
    }
    return false;
  }

  /** Task 02: Review previous SOL 01 records in Mission OS */
  public onReviewPreviousRecords(): boolean {
    const log: Sol02MissionLog = {
      log_id: `LOG_SOL02_REV_${Date.now()}`,
      mission_id: "SOL_02",
      log_type: "SOL_01_PREVIOUS_MISSION_REVIEW",
      timestamp: new Date().toISOString(),
      sol_number: 2,
      location: "TERRAIN ROVER CABIN · MAIN OS CONSOLE",
      telemetry_snapshot: this.getTelemetry(),
      user_entry: "SOL 01 surface reconnaissance data and resource baselines audited. System verified ready for night operations.",
      saved: true
    };
    this.missionLogs.push(log);
    if (this.currentTaskId === "SOL02_TASK_02") {
      return this.completeTask("SOL02_TASK_02");
    }
    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Task 03: Inspect BOTAN Nutrition System */
  public confirmBotanInspection(notes: string): boolean {
    const telemetry = this.getTelemetry();
    this.botanObservation = {
      inspected_at: new Date().toISOString(),
      water_liters: telemetry.resources.water_liters,
      nutrient_percent: telemetry.resources.nutrient_percent,
      botan_status: telemetry.resources.botan_system_status,
      notes: notes.trim()
    };
    const log: Sol02MissionLog = {
      log_id: `LOG_SOL02_BOTAN_${Date.now()}`,
      mission_id: "SOL_02",
      log_type: "SOL_02_BOTAN_SYSTEM_INSPECTION",
      timestamp: new Date().toISOString(),
      sol_number: 2,
      location: "BOTAN NUTRITION STATION",
      telemetry_snapshot: { resources: telemetry.resources },
      user_entry: notes.trim() || `BOTAN Life Support verified: Water ${telemetry.resources.water_liters}L, Nutrient reserves ${telemetry.resources.nutrient_percent}%, Status: ${telemetry.resources.botan_system_status}.`,
      saved: true
    };
    this.missionLogs.push(log);
    if (this.currentTaskId === "SOL02_TASK_03") {
      return this.completeTask("SOL02_TASK_03");
    }
    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Task 04: Inspect Night-time Environment */
  public saveNightEnvironmentObservation(notes: string): boolean {
    const telemetry = this.getTelemetry();
    this.environmentObservation = {
      recorded_at: new Date().toISOString(),
      temperature_celsius: telemetry.environment.temperature_celsius,
      pressure_mbar: telemetry.environment.pressure_mbar,
      wind_speed_m_s: telemetry.environment.wind_speed_m_s,
      wind_direction: telemetry.environment.wind_direction,
      co2_percent: telemetry.environment.co2_percent,
      notes: notes.trim()
    };
    const log: Sol02MissionLog = {
      log_id: `LOG_SOL02_ENV_${Date.now()}`,
      mission_id: "SOL_02",
      log_type: "SOL_02_NIGHT_ENVIRONMENT",
      timestamp: new Date().toISOString(),
      sol_number: 2,
      location: "ENVIRONMENT SENSING STATION",
      telemetry_snapshot: { environment: telemetry.environment },
      user_entry: notes.trim() || `Night environment recorded: Temp ${telemetry.environment.temperature_celsius}°C, Pressure ${telemetry.environment.pressure_mbar} mbar, Wind ${telemetry.environment.wind_speed_m_s} m/s ${telemetry.environment.wind_direction}, CO2 ${telemetry.environment.co2_percent}%.`,
      saved: true
    };
    this.missionLogs.push(log);
    if (this.currentTaskId === "SOL02_TASK_04") {
      return this.completeTask("SOL02_TASK_04");
    }
    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Task 05: Confirm Scientific Tool Checklist */
  public confirmToolChecklist(confirmedToolIds: string[]): boolean {
    this.toolChecklist.forEach(item => {
      item.confirmed = confirmedToolIds.includes(item.id);
    });
    const log: Sol02MissionLog = {
      log_id: `LOG_SOL02_TOOL_${Date.now()}`,
      mission_id: "SOL_02",
      log_type: "SOL_02_TOOL_INVENTORY",
      timestamp: new Date().toISOString(),
      sol_number: 2,
      location: "SCIENTIFIC TOOLS RACK",
      telemetry_snapshot: {},
      user_entry: `Scientific equipment secured for soil investigation: ${this.toolChecklist.map(t => `${t.label} (${t.confirmed ? "Ready" : "Missing"})`).join(", ")}.`,
      saved: true
    };
    this.missionLogs.push(log);
    if (this.currentTaskId === "SOL02_TASK_05") {
      return this.completeTask("SOL02_TASK_05");
    }
    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Task 06: Rover reached Sol2_Checkpoint */
  public onReachCheckpoint(): boolean {
    if (this.currentTaskId === "SOL02_TASK_06") {
      return this.completeTask("SOL02_TASK_06");
    }
    return false;
  }

  /** Task 07: Outdoor Soil Sample collected at Sol2_Mission_investigation */
  public collectSoilSample(data: Partial<SoilSampleData>): boolean {
    this.soilSample = {
      sample_id: "SOL02_SOIL_SAMPLE_01",
      collected_at: new Date().toISOString(),
      soil_color: data.soil_color || "Reddish Brown",
      soil_texture: data.soil_texture || "Granular",
      soil_moisture_observation: data.soil_moisture_observation || "Dry",
      soil_temperature_celsius: data.soil_temperature_celsius ?? -76.5,
      sample_depth_cm: data.sample_depth_cm ?? 12,
      visible_particles: data.visible_particles || "Quartz and iron-oxide granular grains",
      researcher_notes: data.researcher_notes || "Sample extracted cleanly from depression bed."
    };
    const log: Sol02MissionLog = {
      log_id: `LOG_SOL02_SAMPLE_${Date.now()}`,
      mission_id: "SOL_02",
      log_type: "SOL_02_SOIL_COLLECTION",
      timestamp: new Date().toISOString(),
      sol_number: 2,
      location: "SOL 2 INVESTIGATION SITE · DEPRESSION BED",
      telemetry_snapshot: this.getTelemetry(),
      soil_sample_id: this.soilSample.sample_id,
      user_entry: `Soil sample collected: ${this.soilSample.soil_color}, ${this.soilSample.soil_texture}, depth ${this.soilSample.sample_depth_cm}cm. Notes: ${this.soilSample.researcher_notes}`,
      saved: true
    };
    this.missionLogs.push(log);
    if (this.currentTaskId === "SOL02_TASK_07") {
      return this.completeTask("SOL02_TASK_07");
    }
    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Task 08: Player returned to rover with sample */
  public onReturnToRoverWithSample(): boolean {
    if (this.currentTaskId === "SOL02_TASK_08") {
      return this.completeTask("SOL02_TASK_08");
    }
    return false;
  }

  /** Task 09: Place soil sample in tools rack & confirm transfer */
  public confirmSampleTransferToRack(): boolean {
    if (!this.soilSample) {
      console.warn("[Sol02Mission] Cannot transfer sample: no sample collected.");
      return false;
    }
    this.sampleTransferredToRack = true;
    this.imagesUnlocked = true;
    this.telemetryProfile = "investigation_complete";

    const log: Sol02MissionLog = {
      log_id: `LOG_SOL02_TRANSFER_${Date.now()}`,
      mission_id: "SOL_02",
      log_type: "SOL_02_SOIL_ANALYSIS",
      timestamp: new Date().toISOString(),
      sol_number: 2,
      location: "TOOL SECTION · SAMPLE STORAGE RACK",
      telemetry_snapshot: this.getTelemetry(),
      soil_sample_id: this.soilSample.sample_id,
      analysis_snapshot: sol02Config.automatic_soil_analysis.results,
      user_entry: "Sample transferred into analysis rack. Spectrometry & automated soil profiling initialized.",
      saved: true
    };
    this.missionLogs.push(log);

    if (this.currentTaskId === "SOL02_TASK_09") {
      return this.completeTask("SOL02_TASK_09");
    }
    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Task 10: Review soil analysis and save scientific report in Mission OS */
  public saveScientificReport(userNotes: string): boolean {
    this.scientificReportSaved = true;
    const log: Sol02MissionLog = {
      log_id: `LOG_SOL02_REPORT_${Date.now()}`,
      mission_id: "SOL_02",
      log_type: "SOL_02_FINAL_REPORT",
      timestamp: new Date().toISOString(),
      sol_number: 2,
      location: "TERRAIN ROVER CABIN · MISSION OS CONSOLE",
      telemetry_snapshot: this.getTelemetry(),
      soil_sample_id: this.soilSample?.sample_id,
      analysis_snapshot: sol02Config.automatic_soil_analysis.results,
      user_entry: userNotes.trim() || "Scientific analysis reviewed. Regolith requires conditioning before experimental habitat planting.",
      saved: true
    };
    this.missionLogs.push(log);

    if (this.currentTaskId === "SOL02_TASK_10") {
      return this.completeTask("SOL02_TASK_10");
    }
    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Task 11: Rover reached finishing point */
  public onReachFinishingPoint(): boolean {
    if (this.currentTaskId === "SOL02_TASK_11") {
      return this.completeTask("SOL02_TASK_11");
    }
    return false;
  }

  /** Task 12: Player exited rover at finishing point and pressed E to complete SOL 02 */
  public onCompleteSol02(): boolean {
    if (this.currentTaskId === "SOL02_TASK_12" || this.completedTaskIds.size >= 11) {
      this.completeTask("SOL02_TASK_12");
      this.sol02Completed = true;
      this.unlockSol03();
      return true;
    }
    return false;
  }

  private unlockSol03(): void {
    try {
      const unlockedRaw = localStorage.getItem("elysium_iv_unlocked_sols");
      const unlocked: number[] = unlockedRaw ? JSON.parse(unlockedRaw) : [1, 2];
      if (!unlocked.includes(3)) {
        unlocked.push(3);
        localStorage.setItem("elysium_iv_unlocked_sols", JSON.stringify(unlocked));
      }
    } catch {
      // storage unavailable
    }
  }

  public saveToStorage(): void {
    try {
      const data: Sol02StorageState = {
        currentTaskId: this.currentTaskId,
        completedTaskIds: Array.from(this.completedTaskIds),
        telemetryProfile: this.telemetryProfile,
        missionLogs: this.missionLogs,
        toolChecklist: this.toolChecklist,
        botanObservation: this.botanObservation,
        environmentObservation: this.environmentObservation,
        soilSample: this.soilSample,
        sampleTransferredToRack: this.sampleTransferredToRack,
        imagesUnlocked: this.imagesUnlocked,
        scientificReportSaved: this.scientificReportSaved,
        sol02Completed: this.sol02Completed
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("[Sol02Mission] Could not save to localStorage", e);
    }
  }

  public loadFromStorage(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data: Sol02StorageState = JSON.parse(raw);
      if (data && Array.isArray(data.completedTaskIds)) {
        this.completedTaskIds = new Set(data.completedTaskIds);
        this.currentTaskId = data.currentTaskId || "SOL02_TASK_01";
        this.telemetryProfile = data.telemetryProfile || "arrival";
        this.missionLogs = data.missionLogs || [];
        this.toolChecklist = data.toolChecklist || DEFAULT_SOL02_TOOLS.map(t => ({ ...t }));
        this.botanObservation = data.botanObservation || null;
        this.environmentObservation = data.environmentObservation || null;
        this.soilSample = data.soilSample || null;
        this.sampleTransferredToRack = Boolean(data.sampleTransferredToRack);
        this.imagesUnlocked = Boolean(data.imagesUnlocked);
        this.scientificReportSaved = Boolean(data.scientificReportSaved);
        this.sol02Completed = Boolean(data.sol02Completed);
        return true;
      }
    } catch (e) {
      console.warn("[Sol02Mission] Could not load from localStorage", e);
    }
    return false;
  }

  public resetMission(): void {
    this.currentTaskId = "SOL02_TASK_01";
    this.completedTaskIds.clear();
    this.telemetryProfile = "arrival";
    this.missionLogs = [];
    this.toolChecklist = DEFAULT_SOL02_TOOLS.map(t => ({ ...t }));
    this.botanObservation = null;
    this.environmentObservation = null;
    this.soilSample = null;
    this.sampleTransferredToRack = false;
    this.imagesUnlocked = false;
    this.scientificReportSaved = false;
    this.sol02Completed = false;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    this.notify();
  }
}

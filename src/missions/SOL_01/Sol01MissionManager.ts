import sol01Config from "@/jsons/Missions/sol-01.json";

export type Sol01TaskId =
  | "SOL01_TASK_01"
  | "SOL01_TASK_02"
  | "SOL01_TASK_03"
  | "SOL01_TASK_04"
  | "SOL01_TASK_05"
  | "SOL01_TASK_06"
  | "SOL01_TASK_07"
  | "SOL01_TASK_08";

export type TelemetryProfileKey = "initial" | "checkpoint_02";

export interface TelemetryData {
  environment: {
    surface_temperature_celsius: number;
    external_pressure_mbar: number;
    wind_speed_mps: number;
    co2_percentage: number;
  };
  cabin: {
    oxygen_percentage: number;
    air_filter_percentage: number;
    battery_percentage: number;
    pressure_kpa: number;
    co2_percentage: number;
    temperature_celsius: number;
    system_status: string;
  };
  resources: {
    water_liters: number;
    nutrient_supply_percentage: number;
    status: string;
  };
}

export interface Sol01MissionLog {
  log_id: string;
  mission_id: "SOL_01";
  log_type: "INITIAL_MISSION_LOG" | "ENVIRONMENT_LOG" | "TOOL_CHECKLIST" | "RESOURCE_LOG" | "SECOND_OBSERVATION_LOG";
  timestamp: string;
  sol_number: 1;
  location: string;
  telemetry_snapshot: Partial<TelemetryData>;
  user_entry: string;
  saved: boolean;
}

export interface ToolItem {
  id: string;
  label: string;
  confirmed: boolean;
}

export interface Sol01StorageState {
  currentTaskId: Sol01TaskId;
  completedTaskIds: string[];
  telemetryProfile: TelemetryProfileKey;
  missionLogs: Sol01MissionLog[];
  toolChecklist: ToolItem[];
  environmentObservation: any | null;
  resourceObservation: any | null;
  sol01Completed: boolean;
}

const STORAGE_KEY = "elysium_iv_sol_01_progress";

const DEFAULT_TOOLS: ToolItem[] = [
  { id: "SOIL_SAMPLING_TOOL", label: "Soil Sampling Tool", confirmed: false },
  { id: "SOIL_COLLECTION_CONTAINER", label: "Soil Collection Container", confirmed: false },
  { id: "ENVIRONMENTAL_SENSOR", label: "Environmental Sensor", confirmed: false },
  { id: "SAMPLE_STORAGE_CONTAINER", label: "Sample Storage Container", confirmed: false }
];

export class Sol01MissionManager {
  private static instance: Sol01MissionManager | null = null;

  public currentTaskId: Sol01TaskId = "SOL01_TASK_01";
  public completedTaskIds: Set<string> = new Set();
  public telemetryProfile: TelemetryProfileKey = "initial";
  public missionLogs: Sol01MissionLog[] = [];
  public toolChecklist: ToolItem[] = DEFAULT_TOOLS.map(t => ({ ...t }));
  public environmentObservation: any | null = null;
  public resourceObservation: any | null = null;
  public sol01Completed: boolean = false;

  private listeners: Set<() => void> = new Set();

  public static getInstance(): Sol01MissionManager {
    if (!Sol01MissionManager.instance) {
      Sol01MissionManager.instance = new Sol01MissionManager();
    }
    return Sol01MissionManager.instance;
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

  public getTelemetry(): TelemetryData {
    const profile = sol01Config.telemetry_profiles[this.telemetryProfile];
    return profile as TelemetryData;
  }

  public getTasks() {
    return sol01Config.mission_tasks;
  }

  public getCurrentTask() {
    return sol01Config.mission_tasks.find(t => t.id === this.currentTaskId) ?? sol01Config.mission_tasks[0];
  }

  public isTaskComplete(taskId: string): boolean {
    return this.completedTaskIds.has(taskId);
  }

  /** Gets active navigation destination for the current mission stage */
  public getActiveDestination(): string {
    switch (this.currentTaskId) {
      case "SOL01_TASK_01":
        return "ladder";
      case "SOL01_TASK_02":
        return "Main_Screen_Trigger";
      case "SOL01_TASK_03":
        return "Environment_Checking_Trigger";
      case "SOL01_TASK_04":
        return "Tool_Section_Trigger";
      case "SOL01_TASK_05":
        return "Water_and_nut_Trigger";
      case "SOL01_TASK_06":
        return "2ndCheckpoint";
      case "SOL01_TASK_07":
        return "Main_Screen_Trigger";
      case "SOL01_TASK_08":
        return "Finishing_Point";
      default:
        return "Finishing_Point";
    }
  }

  /** Completes a task following strict sequence rules */
  public completeTask(taskId: Sol01TaskId): boolean {
    if (this.completedTaskIds.has(taskId)) return false;

    // Strict sequential progression: ensure previous task is complete
    const taskIndex = sol01Config.mission_tasks.findIndex(t => t.id === taskId);
    if (taskIndex > 0) {
      const prevTaskId = sol01Config.mission_tasks[taskIndex - 1].id;
      if (!this.completedTaskIds.has(prevTaskId)) {
        console.warn(`[Sol01Mission] Cannot complete ${taskId}: previous task ${prevTaskId} is not completed.`);
        return false;
      }
    }

    this.completedTaskIds.add(taskId);

    // Set next task
    const nextIndex = taskIndex + 1;
    if (nextIndex < sol01Config.mission_tasks.length) {
      this.currentTaskId = sol01Config.mission_tasks[nextIndex].id as Sol01TaskId;
    } else {
      this.sol01Completed = true;
      this.unlockSol02();
    }

    this.saveToStorage();
    this.notify();
    return true;
  }

  /** Task 01: Player entered the rover */
  public onPlayerEnterRover(): boolean {
    if (this.currentTaskId === "SOL01_TASK_01") {
      return this.completeTask("SOL01_TASK_01");
    }
    return false;
  }

  /** Task 02: Save initial mission log */
  public saveInitialMissionLog(userEntry: string): boolean {
    const log: Sol01MissionLog = {
      log_id: `LOG_SOL01_01_${Date.now()}`,
      mission_id: "SOL_01",
      log_type: "INITIAL_MISSION_LOG",
      timestamp: new Date().toISOString(),
      sol_number: 1,
      location: "TERRAIN ROVER CABIN · MAIN CONSOLE",
      telemetry_snapshot: this.getTelemetry(),
      user_entry: userEntry.trim() || "Initial surface assessment initiated. All primary life-support systems verified operational.",
      saved: true
    };
    this.missionLogs.push(log);
    if (this.currentTaskId === "SOL01_TASK_02") {
      this.completeTask("SOL01_TASK_02");
    } else {
      this.saveToStorage();
      this.notify();
    }
    return true;
  }

  /** Task 03: Save environmental observation log */
  public saveEnvironmentObservation(notes: string): boolean {
    const telemetry = this.getTelemetry();
    this.environmentObservation = {
      recorded_at: new Date().toISOString(),
      surface_temperature_celsius: telemetry.environment.surface_temperature_celsius,
      external_pressure_mbar: telemetry.environment.external_pressure_mbar,
      wind_speed_mps: telemetry.environment.wind_speed_mps,
      co2_percentage: telemetry.environment.co2_percentage,
      notes: notes.trim()
    };
    const log: Sol01MissionLog = {
      log_id: `LOG_SOL01_ENV_${Date.now()}`,
      mission_id: "SOL_01",
      log_type: "ENVIRONMENT_LOG",
      timestamp: new Date().toISOString(),
      sol_number: 1,
      location: "ENVIRONMENT CHECK STATION",
      telemetry_snapshot: { environment: telemetry.environment },
      user_entry: notes.trim() || `Environment confirmed: ${telemetry.environment.surface_temperature_celsius}°C, ${telemetry.environment.external_pressure_mbar} mbar, Wind ${telemetry.environment.wind_speed_mps} m/s, CO2 ${telemetry.environment.co2_percentage}%.`,
      saved: true
    };
    this.missionLogs.push(log);
    if (this.currentTaskId === "SOL01_TASK_03") {
      this.completeTask("SOL01_TASK_03");
    } else {
      this.saveToStorage();
      this.notify();
    }
    return true;
  }

  /** Task 04: Confirm tool inventory checklist */
  public confirmToolChecklist(confirmedToolIds: string[]): boolean {
    this.toolChecklist.forEach(item => {
      item.confirmed = confirmedToolIds.includes(item.id);
    });
    const log: Sol01MissionLog = {
      log_id: `LOG_SOL01_TOOL_${Date.now()}`,
      mission_id: "SOL_01",
      log_type: "TOOL_CHECKLIST",
      timestamp: new Date().toISOString(),
      sol_number: 1,
      location: "TOOL STORAGE LOCKER",
      telemetry_snapshot: {},
      user_entry: `Surface investigation tools verified: ${this.toolChecklist.map(t => `${t.label} (${t.confirmed ? "Ready" : "Missing"})`).join(", ")}.`,
      saved: true
    };
    this.missionLogs.push(log);
    if (this.currentTaskId === "SOL01_TASK_04") {
      this.completeTask("SOL01_TASK_04");
    } else {
      this.saveToStorage();
      this.notify();
    }
    return true;
  }

  /** Task 05: Save resource inspection log */
  public saveResourceObservation(notes: string): boolean {
    const telemetry = this.getTelemetry();
    this.resourceObservation = {
      recorded_at: new Date().toISOString(),
      water_liters: telemetry.resources.water_liters,
      nutrient_supply_percentage: telemetry.resources.nutrient_supply_percentage,
      status: telemetry.resources.status,
      notes: notes.trim()
    };
    const log: Sol01MissionLog = {
      log_id: `LOG_SOL01_RES_${Date.now()}`,
      mission_id: "SOL_01",
      log_type: "RESOURCE_LOG",
      timestamp: new Date().toISOString(),
      sol_number: 1,
      location: "RESOURCE DISPENSER CONSOLE",
      telemetry_snapshot: { resources: telemetry.resources },
      user_entry: notes.trim() || `Resource check recorded: Water ${telemetry.resources.water_liters} L, Nutrition ${telemetry.resources.nutrient_supply_percentage}%, State ${telemetry.resources.status}.`,
      saved: true
    };
    this.missionLogs.push(log);
    if (this.currentTaskId === "SOL01_TASK_05") {
      this.completeTask("SOL01_TASK_05");
    } else {
      this.saveToStorage();
      this.notify();
    }
    return true;
  }

  /** Task 06: Reached 2ndCheckpoint with rover */
  public onReach2ndCheckpoint(): boolean {
    if (this.currentTaskId === "SOL01_TASK_06") {
      this.telemetryProfile = "checkpoint_02";
      this.completeTask("SOL01_TASK_06");
      return true;
    }
    return false;
  }

  /** Task 07: Save second observation log at Main_Screen_Trigger */
  public saveSecondObservationLog(userEntry: string): boolean {
    const telemetry = this.getTelemetry();
    const log: Sol01MissionLog = {
      log_id: `LOG_SOL01_02_${Date.now()}`,
      mission_id: "SOL_01",
      log_type: "SECOND_OBSERVATION_LOG",
      timestamp: new Date().toISOString(),
      sol_number: 1,
      location: "CHECKPOINT 02 · TERRAIN TRAVERSE",
      telemetry_snapshot: telemetry,
      user_entry: userEntry.trim() || `Second observation recorded at Checkpoint 02: Ambient temp dropped to ${telemetry.environment.surface_temperature_celsius}°C, wind rose to ${telemetry.environment.wind_speed_mps} m/s. Traverse path verified.`,
      saved: true
    };
    this.missionLogs.push(log);
    if (this.currentTaskId === "SOL01_TASK_07") {
      this.completeTask("SOL01_TASK_07");
    } else {
      this.saveToStorage();
      this.notify();
    }
    return true;
  }

  /** Task 08: Reached Finishing_Point with rover */
  public onReachFinishingPoint(): boolean {
    if (this.currentTaskId === "SOL01_TASK_08") {
      this.completeTask("SOL01_TASK_08");
      this.sol01Completed = true;
      this.unlockSol02();
      return true;
    }
    return false;
  }

  private unlockSol02(): void {
    try {
      const unlockedRaw = localStorage.getItem("elysium_iv_unlocked_sols");
      const unlocked: number[] = unlockedRaw ? JSON.parse(unlockedRaw) : [1];
      if (!unlocked.includes(2)) {
        unlocked.push(2);
        localStorage.setItem("elysium_iv_unlocked_sols", JSON.stringify(unlocked));
      }
    } catch {
      // storage unavailable
    }
  }

  public saveToStorage(): void {
    try {
      const data: Sol01StorageState = {
        currentTaskId: this.currentTaskId,
        completedTaskIds: Array.from(this.completedTaskIds),
        telemetryProfile: this.telemetryProfile,
        missionLogs: this.missionLogs,
        toolChecklist: this.toolChecklist,
        environmentObservation: this.environmentObservation,
        resourceObservation: this.resourceObservation,
        sol01Completed: this.sol01Completed
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("[Sol01Mission] Could not save to localStorage", e);
    }
  }

  public loadFromStorage(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data: Sol01StorageState = JSON.parse(raw);
      if (data && Array.isArray(data.completedTaskIds)) {
        this.completedTaskIds = new Set(data.completedTaskIds);
        this.currentTaskId = data.currentTaskId || "SOL01_TASK_01";
        this.telemetryProfile = data.telemetryProfile || "initial";
        this.missionLogs = data.missionLogs || [];
        this.toolChecklist = data.toolChecklist || DEFAULT_TOOLS.map(t => ({ ...t }));
        this.environmentObservation = data.environmentObservation || null;
        this.resourceObservation = data.resourceObservation || null;
        this.sol01Completed = Boolean(data.sol01Completed);
        return true;
      }
    } catch (e) {
      console.warn("[Sol01Mission] Could not load from localStorage", e);
    }
    return false;
  }

  public resetMission(): void {
    this.currentTaskId = "SOL01_TASK_01";
    this.completedTaskIds.clear();
    this.telemetryProfile = "initial";
    this.missionLogs = [];
    this.toolChecklist = DEFAULT_TOOLS.map(t => ({ ...t }));
    this.environmentObservation = null;
    this.resourceObservation = null;
    this.sol01Completed = false;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    this.notify();
  }
}

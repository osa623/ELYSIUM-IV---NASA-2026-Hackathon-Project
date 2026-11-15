/**
 * Sol-specific physical-screen data. Keep the section JSON files independent;
 * this registry is only the routing table used by the existing renderers.
 */
export type ScreenConfigSection = "airlock" | "centralHub" | "engineering" | "habitat" | "missionControl" | "research";
export interface ScreenMissionSnapshot {
  currentDay?: number;
  currentSol?: number;
  objectiveState?: string;
  completedStepIds?: string[];
  observationRecords?: Array<{ day: number; type: string; summary?: string }>;
  selectedSiteId?: string | null;
  investigationRecords?: Array<{ taskId: string; classification?: string; rationale?: string; playerComment?: string; limitations?: string[]; evidenceReferences?: string[] }>;
  sol6?: { cultivation?: { sampleId: string; status: string } | null };
  sol8?: { started: boolean; powerFailureActive: boolean; communicationFailureActive: boolean; reservePowerPercent: number };
}

type ScreenConfigPair = { browser: () => any; node: () => any; path: string };
type SolScreenConfigs = Partial<Record<ScreenConfigSection, ScreenConfigPair>>;

function safeDynamicRequire(path: string): unknown {
  try {
    const dynamicRequire = eval("require") as (modulePath: string) => unknown;
    return dynamicRequire(path);
  } catch {
    try {
      const dynamicRequire = eval("require") as (modulePath: string) => unknown;
      return dynamicRequire(path.replace("../src/", "../../src/"));
    } catch {
      return null;
    }
  }
}

const createPair = (relPath: string, fullPath: string): ScreenConfigPair => ({
  browser: () => safeDynamicRequire(relPath),
  node: () => safeDynamicRequire(fullPath),
  path: fullPath
});

const bySol: Record<1 | 2 | 3 | 4 | 7 | 8 | 11, SolScreenConfigs> = {
  1: {
    airlock: createPair("../jsons/Screens/Sol_1/airlock-screen-data.json", "Screens/Sol_1/airlock-screen-data.json"),
    centralHub: createPair("../jsons/Screens/Sol_1/central-hub-screens.json", "Screens/Sol_1/central-hub-screens.json"),
    engineering: createPair("../jsons/Screens/Sol_1/engineeringScreenData.json", "Screens/Sol_1/engineeringScreenData.json"),
    habitat: createPair("../jsons/Screens/Sol_1/habitatScreenData.json", "Screens/Sol_1/habitatScreenData.json"),
    missionControl: createPair("../jsons/Screens/Sol_1/mission-control-screens.json", "Screens/Sol_1/mission-control-screens.json"),
    research: createPair("../jsons/Screens/Sol_1/research-zone-screens.json", "Screens/Sol_1/research-zone-screens.json")
  },
  2: {
    airlock: createPair("../jsons/Screens/Sol_2/airlock-screen-data.json", "Screens/Sol_2/airlock-screen-data.json"),
    centralHub: createPair("../jsons/Screens/Sol_2/central-hub-screens.json", "Screens/Sol_2/central-hub-screens.json"),
    engineering: createPair("../jsons/Screens/Sol_2/engineeringScreenData.json", "Screens/Sol_2/engineeringScreenData.json"),
    habitat: createPair("../jsons/Screens/Sol_2/habitatScreenData.json", "Screens/Sol_2/habitatScreenData.json"),
    missionControl: createPair("../jsons/Screens/Sol_2/mission-control-screens.json", "Screens/Sol_2/mission-control-screens.json"),
    research: createPair("../jsons/Screens/Sol_2/research-zone-screens.json", "Screens/Sol_2/research-zone-screens.json")
  },
  3: {
    airlock: createPair("../jsons/Screens/Sol_3/airlock-screen-data.json", "Screens/Sol_3/airlock-screen-data.json"),
    centralHub: createPair("../jsons/Screens/Sol_3/central-hub-screens.json", "Screens/Sol_3/central-hub-screens.json"),
    engineering: createPair("../jsons/Screens/Sol_3/engineeringScreenData.json", "Screens/Sol_3/engineeringScreenData.json"),
    habitat: createPair("../jsons/Screens/Sol_3/habitatScreenData.json", "Screens/Sol_3/habitatScreenData.json"),
    missionControl: createPair("../jsons/Screens/Sol_3/mission-control-screens.json", "Screens/Sol_3/mission-control-screens.json"),
    research: createPair("../jsons/Screens/Sol_3/research-zone-screens.json", "Screens/Sol_3/research-zone-screens.json")
  },
  4: {
    airlock: createPair("../jsons/Screens/Sol_4/airlock-screen-data.json", "Screens/Sol_4/airlock-screen-data.json"),
    centralHub: createPair("../jsons/Screens/Sol_4/central-hub-screens.json", "Screens/Sol_4/central-hub-screens.json"),
    engineering: createPair("../jsons/Screens/Sol_4/engineeringScreenData.json", "Screens/Sol_4/engineeringScreenData.json"),
    habitat: createPair("../jsons/Screens/Sol_4/habitatScreenData.json", "Screens/Sol_4/habitatScreenData.json"),
    missionControl: createPair("../jsons/Screens/Sol_4/mission-control-screens.json", "Screens/Sol_4/mission-control-screens.json"),
    research: createPair("../jsons/Screens/Sol_4/research-zone-screens.json", "Screens/Sol_4/research-zone-screens.json")
  },
  7: {
    airlock: createPair("../jsons/Screens/Sol_7/airlock-screen-data.json", "Screens/Sol_7/airlock-screen-data.json"),
    centralHub: createPair("../jsons/Screens/Sol_7/central-hub-screens.json", "Screens/Sol_7/central-hub-screens.json"),
    engineering: createPair("../jsons/Screens/Sol_7/engineeringScreenData.json", "Screens/Sol_7/engineeringScreenData.json"),
    habitat: createPair("../jsons/Screens/Sol_7/habitatScreenData.json", "Screens/Sol_7/habitatScreenData.json"),
    missionControl: createPair("../jsons/Screens/Sol_7/mission-control-screens.json", "Screens/Sol_7/mission-control-screens.json"),
    research: createPair("../jsons/Screens/Sol_7/research-zone-screens.json", "Screens/Sol_7/research-zone-screens.json")
  },
  8: {
    airlock: createPair("../jsons/Screens/Sol_8/airlock-screen-data.json", "Screens/Sol_8/airlock-screen-data.json"),
    centralHub: createPair("../jsons/Screens/Sol_8/central-hub-screens.json", "Screens/Sol_8/central-hub-screens.json"),
    engineering: createPair("../jsons/Screens/Sol_8/engineeringScreenData.json", "Screens/Sol_8/engineeringScreenData.json"),
    habitat: createPair("../jsons/Screens/Sol_8/habitatScreenData.json", "Screens/Sol_8/habitatScreenData.json"),
    missionControl: createPair("../jsons/Screens/Sol_8/mission-control-screens.json", "Screens/Sol_8/mission-control-screens.json"),
    research: createPair("../jsons/Screens/Sol_8/research-zone-screens.json", "Screens/Sol_8/research-zone-screens.json")
  },
  11: {
    airlock: createPair("../jsons/Screens/Sol_11/airlock-screen-data.json", "Screens/Sol_11/airlock-screen-data.json"),
    centralHub: createPair("../jsons/Screens/Sol_11/central-hub-screens.json", "Screens/Sol_11/central-hub-screens.json"),
    engineering: createPair("../jsons/Screens/Sol_11/engineeringScreenData.json", "Screens/Sol_11/engineeringScreenData.json"),
    habitat: createPair("../jsons/Screens/Sol_11/habitatScreenData.json", "Screens/Sol_11/habitatScreenData.json"),
    missionControl: createPair("../jsons/Screens/Sol_11/mission-control-screens.json", "Screens/Sol_11/mission-control-screens.json"),
    research: createPair("../jsons/Screens/Sol_11/research-zone-screens.json", "Screens/Sol_11/research-zone-screens.json")
  }
};

/** Select content for Sols while leaving legacy behavior available. */
export function getScreenConfigForSol<T>(section: ScreenConfigSection, sol: number, legacyConfig: T): T {
  if (sol !== 1 && sol !== 2 && sol !== 3 && sol !== 4 && sol !== 7 && sol !== 8 && sol !== 11) return legacyConfig;

  const entry = bySol[sol as keyof typeof bySol]?.[section];
  if (!entry) return legacyConfig;
  try {
    let data: any = entry.browser();
    if (!data) data = entry.node();
    if (!data || !(Array.isArray(data.screens) || (data.screens && typeof data.screens === "object"))) {
      return legacyConfig;
    }
    if ((sol === 3 || sol === 4) && Array.isArray((legacyConfig as any)?.screens) && Array.isArray(data.screens)) {
      const overrides = new Map<string, any>(data.screens.map((screen: any) => [screen.screenId, screen]));
      const mergedScreens = (legacyConfig as any).screens.map((screen: any) => {
        const override = overrides.get(screen.screenId);
        return override ? { ...screen, ...override, content: override.content ?? screen.content } : screen;
      });
      return { ...(legacyConfig as any), screens: mergedScreens } as T;
    }
    return data as T;
  } catch {
    return legacyConfig;
  }
}

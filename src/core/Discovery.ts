export const assetPaths = {
  Terrain: "/assets/models/ELYSIUM_IV_SOL_01_Terrain.glb",
  Habitat: "/assets/models/terrainVehicleInterior.glb",
  Hub: "/assets/models/terrainVehicleInterior.glb",
  Airlock: "/assets/models/terrainVehicleInterior.glb",
  Engineering: "/assets/models/terrainVehicleInterior.glb",
  Science: "/assets/models/terrainVehicleInterior.glb",
  MissionControl: "/assets/models/terrainVehicleInterior.glb",
  Drone: "/assets/models/terrainVehicleInterior.glb"
} as const;

export const solTerrainPaths: Record<number, string> = {
  1: "/assets/models/ELYSIUM_IV_SOL_01_Terrain.glb",
  2: "/assets/models/ELYSIUM_IV_SOL_02_Terrain.glb",
  3: "/assets/models/ELYSIUM_IV_SOL_03_Terrain.glb"
};

export type ModuleName = keyof typeof assetPaths;

export const screenActions: Record<string, string> = {
  HAB_MONITOR_01: "Habitat Status and Life Support",
  HAB_WATER_NUTRITION_01: "Water & Nutrition Display",
  HAB_WORKSTATION_01: "Habitat Workstation",
  HAB_REST_01: "Crew Rest Area",
  Env_Status_Display: "Environment Status Display",
  Internal_Communication_Display: "Internal Communications Display",
  Module_Status_Display: "Module Status Display",
  Engineering_Monitoring_Trigger: "Engineering Monitoring Section",
  Engineering_PowerUnit_Trigger: "Power Systems Section",
  Engineering_LifeSupport_Trigger: "Engineering Life Support Section",
  Engineering_Diagnostics_Trigger: "Engineering Diagnostics Workbench",
  Engineering_InfoDisplay_Trigger: "Engineering Storage Information",
  LAB_RESEARCH_MONITORING_01: "Research Monitoring Display",
  LAB_RESEARCH_ANALYSIS_01: "Research Analysis Display",
  LAB_SEED_STORAGE_01: "Seed Storage Inventory",
  LAB_WATER_NUTRITION_01: "Water & Nutrient Preparation",
  LAB_WATER_SERVICE_01: "Water Quality & Service",
  LAB_CULTIVATION_01: "Cultivation Environment Display",
  MC_MAIN_01: "Mission Objectives Overview",
  MC_SYSTEMS_01: "Communications & Systems",
  MC_NAVIGATION_01: "Terrain & Reconnaissance Systems",
  Airlock_Control_Console_Trigger: "Airlock Control Console",
  Driving_Section_Trigger: "Rover Driving Console",
  Outdoor_Navigation_Trigger: "Rover Airlock Exit Hatch",
  ladder: "Rover Boarding Ladder"
};

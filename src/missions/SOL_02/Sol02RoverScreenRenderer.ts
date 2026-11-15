import * as THREE from "three";
import { reprojectPlanarUVs } from "@/core/Collision";
import { Sol02MissionManager, type Sol02TelemetryData } from "./Sol02MissionManager";

interface ScreenBinding {
  mesh: THREE.Mesh;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  material: THREE.MeshStandardMaterial;
  name: string;
}

export class Sol02RoverScreenRenderer {
  private bindings: ScreenBinding[] = [];

  constructor(private interiorRoot: THREE.Group) {
    this.initScreens();
  }

  private initScreens(): void {
    // 1. Main Computer Screens (512x256)
    this.bindScreen("Computer_Screen_01", 512, 256);
    this.bindScreen("Computer_Screen_02", 512, 256);
    this.bindScreen("Computer_Screen_03", 512, 256);

    // 2. Resource Screens (256x256 and 256x128)
    this.bindScreen("O2_Screen", 256, 256);
    this.bindScreen("Water_and_Nut_Screen", 256, 256);
    this.bindScreen("Water_and_Nut_Screen_02", 256, 128);

    // 3. Small Screens (128x128)
    const smallScreens = [
      "sm_Air_filter_screen",
      "sm_battery_Screen",
      "sm_cabin_pressure",
      "sm_co2_screen",
      "sm_environment_screen",
      "sm_o2_Screen",
      "sm_status_screen",
      "sm_temperature_screen"
    ];
    smallScreens.forEach(name => this.bindScreen(name, 128, 128));
  }

  private bindScreen(name: string, width: number, height: number): void {
    let screenObj = this.interiorRoot.getObjectByName(name) as THREE.Mesh | undefined;
    if (!screenObj && name === "Water_and_Nut_Screen_02") {
      screenObj = (this.interiorRoot.getObjectByName("Water_and_Nut_Screen_02(small)") ||
                   this.interiorRoot.getObjectByName("Water_and_Nut_Screen_02_small")) as THREE.Mesh | undefined;
    }
    if (!screenObj || !screenObj.isMesh) return;

    reprojectPlanarUVs(screenObj.geometry, name === "Computer_Screen_03"
      ? { uAxis: "x", vAxis: "z" }
      : { uAxis: "x", vAxis: "y" });

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide,
      toneMapped: false,
      emissive: new THREE.Color(0xffffff),
      emissiveMap: texture,
      emissiveIntensity: 1.2,
      roughness: 0.18,
      metalness: 0.1
    });

    screenObj.material = material;

    this.bindings.push({
      mesh: screenObj,
      canvas,
      ctx,
      texture,
      material,
      name
    });
  }

  public update(manager: Sol02MissionManager): void {
    const telemetry = manager.getTelemetry();
    this.bindings.forEach(binding => {
      this.drawScreen(binding, telemetry, manager);
      binding.texture.needsUpdate = true;
    });
  }

  private drawScreen(
    b: ScreenBinding,
    telemetry: Sol02TelemetryData,
    manager: Sol02MissionManager
  ): void {
    const { ctx, canvas, name } = b;
    const w = canvas.width;
    const h = canvas.height;

    // Dark technical background
    ctx.fillStyle = "#07121c";
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = "rgba(40, 80, 110, 0.25)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Cyan border
    ctx.strokeStyle = "#38d4f0";
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, w - 4, h - 4);

    switch (name) {
      case "Computer_Screen_01":
        this.drawComputer01(ctx, w, h, manager);
        break;
      case "Computer_Screen_02":
        this.drawComputer02(ctx, w, h, telemetry, manager);
        break;
      case "Computer_Screen_03":
        this.drawComputer03(ctx, w, h, manager);
        break;
      case "O2_Screen":
        this.drawResourceGauge(ctx, w, h, "CABIN OXYGEN", telemetry.cabin.oxygen_percent, "%", "#38d4f0");
        break;
      case "Water_and_Nut_Screen":
        this.drawDualResource(ctx, w, h, telemetry);
        break;
      case "Water_and_Nut_Screen_02":
      case "Water_and_Nut_Screen_02(small)":
        this.drawCompactResource(ctx, w, h, telemetry);
        break;
      case "sm_Air_filter_screen":
        this.drawSmallScreen(ctx, w, h, "AIR FILTER", `${telemetry.cabin.air_filter_percent} %`, "#52d9a3");
        break;
      case "sm_battery_Screen":
        this.drawSmallScreen(ctx, w, h, "BATTERY", `${telemetry.cabin.battery_percent} %`, "#f0a04b");
        break;
      case "sm_cabin_pressure":
        this.drawSmallScreen(ctx, w, h, "CABIN PRESS", `${telemetry.cabin.cabin_pressure_kpa} kPa`, "#38d4f0");
        break;
      case "sm_co2_screen":
        this.drawSmallScreen(ctx, w, h, "CABIN CO2", `${telemetry.cabin.cabin_co2_percent} %`, "#52d9a3");
        break;
      case "sm_environment_screen":
        this.drawSmallScreen(ctx, w, h, "EXT PRESS", `${telemetry.environment.pressure_mbar} mb`, "#e8c56c");
        break;
      case "sm_o2_Screen":
        this.drawSmallScreen(ctx, w, h, "CABIN O2", `${telemetry.cabin.oxygen_percent} %`, "#38d4f0");
        break;
      case "sm_status_screen":
        this.drawSmallScreen(ctx, w, h, "SYS STATUS", telemetry.cabin.system_status, "#52d9a3");
        break;
      case "sm_temperature_screen":
        this.drawSmallScreen(ctx, w, h, "CABIN TEMP", `${telemetry.cabin.cabin_temperature_celsius} °C`, "#f0a04b");
        break;
    }
  }

  // --- Screen 1: Mission Overview ---
  private drawComputer01(ctx: CanvasRenderingContext2D, w: number, h: number, manager: Sol02MissionManager): void {
    ctx.fillStyle = "#0d2332";
    ctx.fillRect(0, 0, w, 40);

    ctx.fillStyle = "#38d4f0";
    ctx.font = "bold 16px monospace";
    ctx.fillText("ELYSIUM IV · TERRAIN ROVER CONSOLE", 16, 26);

    ctx.fillStyle = "#8daec0";
    ctx.font = "12px monospace";
    ctx.fillText("SOL 02 — DAYTIME SOIL INVESTIGATION", 16, 62);

    ctx.fillStyle = "#f0a04b";
    ctx.font = "bold 18px monospace";
    const currentTask = manager.getCurrentTask();
    ctx.fillText(currentTask?.title || "FIELD OPERATIONS", 16, 92);

    ctx.fillStyle = "#c5dce8";
    ctx.font = "13px monospace";
    const nextDest = manager.getActiveDestination();
    ctx.fillText(`LOCATION:    SOL 02 CANYON BASIN`, 16, 126);
    ctx.fillText(`TARGET:      ${nextDest}`, 16, 148);
    ctx.fillText(`TASKS DONE:  ${manager.completedTaskIds.size} / 12 COMPLETED`, 16, 170);

    // Status badge
    ctx.fillStyle = "#123042";
    ctx.fillRect(16, 192, 240, 36);
    ctx.strokeStyle = "#38d4f0";
    ctx.strokeRect(16, 192, 240, 36);
    ctx.fillStyle = "#52d9a3";
    ctx.font = "bold 14px monospace";
    ctx.fillText(manager.imagesUnlocked ? "ANALYSIS: UNLOCKED" : "DAYTIME ACTIVE", 28, 215);
  }

  // --- Screen 2: Environmental Telemetry ---
  private drawComputer02(ctx: CanvasRenderingContext2D, w: number, h: number, telemetry: Sol02TelemetryData, manager: Sol02MissionManager): void {
    ctx.fillStyle = "#0d2332";
    ctx.fillRect(0, 0, w, 40);

    ctx.fillStyle = "#f0a04b";
    ctx.font = "bold 16px monospace";
    ctx.fillText("DAYTIME MARTIAN TELEMETRY", 16, 26);

    // Left Column
    ctx.fillStyle = "#9ec2d6";
    ctx.font = "12px monospace";
    ctx.fillText("SURFACE TEMPERATURE", 16, 68);
    ctx.fillStyle = "#f0a04b";
    ctx.font = "bold 22px monospace";
    ctx.fillText(`${telemetry.environment.temperature_celsius} °C`, 16, 92);

    ctx.fillStyle = "#9ec2d6";
    ctx.font = "12px monospace";
    ctx.fillText("SURFACE BAROMETER", 16, 122);
    ctx.fillStyle = "#38d4f0";
    ctx.font = "bold 22px monospace";
    ctx.fillText(`${telemetry.environment.pressure_mbar} mbar`, 16, 146);

    ctx.fillStyle = "#9ec2d6";
    ctx.font = "12px monospace";
    ctx.fillText("WIND & VECTOR", 16, 176);
    ctx.fillStyle = "#52d9a3";
    ctx.font = "bold 20px monospace";
    ctx.fillText(`${telemetry.environment.wind_speed_m_s} m/s ${telemetry.environment.wind_direction}`, 16, 198);

    ctx.fillStyle = "#9ec2d6";
    ctx.font = "11px monospace";
    ctx.fillText(`ATMOSPHERE CO2: ${telemetry.environment.co2_percent}%`, 16, 226);

    // Right Column
    ctx.fillStyle = "#0b1c28";
    ctx.fillRect(260, 56, 236, 176);
    ctx.strokeStyle = "#25536e";
    ctx.strokeRect(260, 56, 236, 176);

    ctx.fillStyle = "#6590a8";
    ctx.font = "10px monospace";
    ctx.fillText("DAYTIME THERMAL INERTIA", 270, 74);

    ctx.beginPath();
    ctx.strokeStyle = "#f0a04b";
    ctx.lineWidth = 2.5;
    const points = [160, 162, 168, 170, 175, 172, 180, 178, 182, 185, 184];
    const step = 216 / (points.length - 1);
    points.forEach((py, i) => {
      const px = 270 + i * step;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    ctx.fillStyle = "#52d9a3";
    ctx.font = "10px monospace";
    ctx.fillText("DAYTIME DUST: MODERATE", 270, 218);
  }

  // --- Screen 3: System & Sample Status ---
  private drawComputer03(ctx: CanvasRenderingContext2D, w: number, h: number, manager: Sol02MissionManager): void {
    ctx.fillStyle = "#0d2332";
    ctx.fillRect(0, 0, w, 40);

    ctx.fillStyle = "#52d9a3";
    ctx.font = "bold 16px monospace";
    ctx.fillText(manager.imagesUnlocked ? "SOIL SPECTROMETRY PROFILING" : "SOL 02 SEQUENCE AUDIT", 16, 26);

    if (manager.imagesUnlocked) {
      ctx.fillStyle = "#cbe5f2";
      ctx.font = "12px monospace";
      ctx.fillText(`SAMPLE ID:      SOL02_SOIL_SAMPLE_01`, 16, 70);
      ctx.fillText(`MOISTURE:       2.4 % (DRY REGOLITH)`, 16, 95);
      ctx.fillText(`GRAIN SIZE:     0.35 mm (GRANULAR)`, 16, 120);
      ctx.fillText(`SAMPLE TEMP:    -76.5 °C`, 16, 145);
      ctx.fillText(`HABITAT COND:   REQUIRES PROCESSING`, 16, 170);
      ctx.fillText(`GROWTH TEST:    2 HABITAT CHAMBERS`, 16, 195);

      ctx.fillStyle = "#52d9a3";
      ctx.font = "bold 13px monospace";
      ctx.fillText(`AUTOMATED ANALYSIS: VALIDATED ✓`, 16, 225);
    } else {
      const items = [
        { label: "ROVER INGRESS", done: manager.isTaskComplete("SOL02_TASK_01") },
        { label: "SOL 01 LOG AUDIT", done: manager.isTaskComplete("SOL02_TASK_02") },
        { label: "BOTAN SYSTEM VERIFIED", done: manager.isTaskComplete("SOL02_TASK_03") },
        { label: "DAYTIME SENSORS LOGGED", done: manager.isTaskComplete("SOL02_TASK_04") },
        { label: "TOOLS CHECKLIST", done: manager.isTaskComplete("SOL02_TASK_05") },
        { label: "CHECKPOINT REACHED", done: manager.isTaskComplete("SOL02_TASK_06") },
        { label: "SOIL SAMPLE COLLECTED", done: manager.isTaskComplete("SOL02_TASK_07") },
        { label: "SAMPLE RACK TRANSFER", done: manager.isTaskComplete("SOL02_TASK_09") }
      ];

      ctx.font = "11px monospace";
      items.forEach((item, index) => {
        const y = 64 + index * 21;
        ctx.fillStyle = item.done ? "#52d9a3" : "#7c93a0";
        ctx.fillText(item.done ? "[✓] READY" : "[○] PENDING", 16, y);
        ctx.fillStyle = item.done ? "#d8eff8" : "#8aa0ab";
        ctx.fillText(item.label, 120, y);
      });
    }
  }

  // --- Resource Gauge Screen (O2) ---
  private drawResourceGauge(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, value: number, unit: string, color: string): void {
    ctx.fillStyle = "#0d2230";
    ctx.fillRect(0, 0, w, 36);

    ctx.fillStyle = "#38d4f0";
    ctx.font = "bold 14px monospace";
    ctx.fillText(title, 14, 24);

    ctx.fillStyle = color;
    ctx.font = "bold 44px monospace";
    ctx.fillText(`${value}`, 20, 110);
    ctx.font = "bold 20px monospace";
    ctx.fillText(unit, 115, 110);

    ctx.fillStyle = "#122838";
    ctx.fillRect(20, 140, w - 40, 24);
    ctx.fillStyle = color;
    ctx.fillRect(20, 140, (w - 40) * (value / 100), 24);
    ctx.strokeStyle = "#38d4f0";
    ctx.strokeRect(20, 140, w - 40, 24);

    ctx.fillStyle = "#8da8b8";
    ctx.font = "12px monospace";
    ctx.fillText("CABIN LIFE SUPPORT: STABLE", 20, 200);
  }

  // --- Dual Resource Screen (Water & BOTAN Nutrients) ---
  private drawDualResource(ctx: CanvasRenderingContext2D, w: number, h: number, telemetry: Sol02TelemetryData): void {
    ctx.fillStyle = "#0d2230";
    ctx.fillRect(0, 0, w, 36);
    ctx.fillStyle = "#52d9a3";
    ctx.font = "bold 13px monospace";
    ctx.fillText("WATER & BOTAN NUTRITION", 12, 24);

    ctx.fillStyle = "#88b0c4";
    ctx.font = "12px monospace";
    ctx.fillText("POTABLE WATER", 16, 68);
    ctx.fillStyle = "#38d4f0";
    ctx.font = "bold 32px monospace";
    ctx.fillText(`${telemetry.resources.water_liters} L`, 16, 102);

    ctx.fillStyle = "#88b0c4";
    ctx.font = "12px monospace";
    ctx.fillText("BOTAN NUTRIENTS", 16, 146);
    ctx.fillStyle = "#52d9a3";
    ctx.font = "bold 32px monospace";
    ctx.fillText(`${telemetry.resources.nutrient_percent} %`, 16, 180);

    ctx.fillStyle = "#f0a04b";
    ctx.font = "11px monospace";
    ctx.fillText(`BOTAN STATUS: ${telemetry.resources.botan_system_status}`, 16, 222);
  }

  // --- Compact Resource Screen ---
  private drawCompactResource(ctx: CanvasRenderingContext2D, w: number, h: number, telemetry: Sol02TelemetryData): void {
    ctx.fillStyle = "#0c1e2b";
    ctx.fillRect(0, 0, w, 28);
    ctx.fillStyle = "#38d4f0";
    ctx.font = "bold 12px monospace";
    ctx.fillText("BOTAN STATUS", 10, 20);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px monospace";
    ctx.fillText(`H2O: ${telemetry.resources.water_liters} L`, 14, 58);
    ctx.fillText(`NUT: ${telemetry.resources.nutrient_percent} %`, 14, 84);
    ctx.fillStyle = "#52d9a3";
    ctx.font = "bold 13px monospace";
    ctx.fillText(`SYS: ${telemetry.resources.botan_system_status}`, 14, 110);
  }

  // --- Small Screen ---
  private drawSmallScreen(ctx: CanvasRenderingContext2D, w: number, h: number, label: string, value: string, color: string): void {
    ctx.fillStyle = "#0e2433";
    ctx.fillRect(0, 0, w, 24);

    ctx.fillStyle = "#8db4c8";
    ctx.font = "bold 10px monospace";
    ctx.fillText(label, 6, 16);

    ctx.fillStyle = color;
    ctx.font = "bold 18px monospace";
    ctx.fillText(value, 8, 70);

    ctx.fillStyle = color;
    ctx.fillRect(8, 100, w - 16, 6);
  }

  public dispose(): void {
    this.bindings.forEach(b => {
      b.texture.dispose();
      b.material.dispose();
    });
    this.bindings = [];
  }
}

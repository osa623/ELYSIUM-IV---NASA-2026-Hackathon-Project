import * as THREE from "three";
import { reprojectPlanarUVs } from "@/core/Collision";
import { Sol03MissionManager, type Sol03TelemetryData } from "./Sol03MissionManager";

interface ScreenBinding {
  mesh: THREE.Mesh;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  material: THREE.MeshStandardMaterial;
  name: string;
}

export class Sol03RoverScreenRenderer {
  private bindings: ScreenBinding[] = [];

  constructor(private interiorRoot: THREE.Group) {
    this.initScreens();
  }

  private initScreens(): void {
    this.bindScreen("Computer_Screen_01", 512, 256);
    this.bindScreen("Computer_Screen_02", 512, 256);
    this.bindScreen("Computer_Screen_03", 512, 256);

    this.bindScreen("O2_Screen", 256, 256);
    this.bindScreen("Water_and_Nut_Screen", 256, 256);
    this.bindScreen("Water_and_Nut_Screen_02", 256, 128);

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

    reprojectPlanarUVs(screenObj.geometry);

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
      emissive: new THREE.Color(0xffffff),
      emissiveMap: texture,
      emissiveIntensity: 0.95,
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

  public update(manager: Sol03MissionManager): void {
    const telemetry = manager.getTelemetry();
    this.bindings.forEach(binding => {
      this.drawScreen(binding, telemetry, manager);
      binding.texture.needsUpdate = true;
    });
  }

  private drawScreen(
    b: ScreenBinding,
    telemetry: Sol03TelemetryData,
    manager: Sol03MissionManager
  ): void {
    const { ctx, canvas, name } = b;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "#07121c";
    ctx.fillRect(0, 0, w, h);

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

    ctx.strokeStyle = "#38d4f0";
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, w - 4, h - 4);

    switch (name) {
      case "Computer_Screen_01":
        this.drawComputer01(ctx, w, h, manager);
        break;
      case "Computer_Screen_02":
        this.drawComputer02(ctx, w, h, telemetry);
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

  private drawComputer01(ctx: CanvasRenderingContext2D, w: number, h: number, manager: Sol03MissionManager): void {
    ctx.fillStyle = "#0d2332";
    ctx.fillRect(0, 0, w, 40);

    ctx.fillStyle = "#38d4f0";
    ctx.font = "bold 16px monospace";
    ctx.fillText("ELYSIUM IV · TERRAIN ROVER CONSOLE", 16, 26);

    ctx.fillStyle = "#8daec0";
    ctx.font = "12px monospace";
    ctx.fillText("SOL 03 — HIGHLAND TRAVERSE & SURVEY", 16, 62);

    ctx.fillStyle = "#f0a04b";
    ctx.font = "bold 18px monospace";
    const currentTask = manager.getCurrentTask();
    ctx.fillText(currentTask?.title || "FIELD SURVEY", 16, 92);

    ctx.fillStyle = "#c5dce8";
    ctx.font = "13px monospace";
    ctx.fillText(`LOCATION:    HIGHLAND ASCENT RIDGE`, 16, 126);
    ctx.fillText(`TARGET:      ${manager.getActiveDestination()}`, 16, 148);
    ctx.fillText(`TASKS DONE:  ${manager.completedTaskIds.size} / 16 COMPLETED`, 16, 170);

    ctx.fillStyle = "#123042";
    ctx.fillRect(16, 192, 240, 36);
    ctx.strokeStyle = "#38d4f0";
    ctx.strokeRect(16, 192, 240, 36);
    ctx.fillStyle = "#52d9a3";
    ctx.font = "bold 14px monospace";
    ctx.fillText(`PHOTOS SAVED: ${manager.cachedPhotos.length} / 4 MIN`, 28, 215);
  }

  private drawComputer02(ctx: CanvasRenderingContext2D, w: number, h: number, telemetry: Sol03TelemetryData): void {
    ctx.fillStyle = "#0d2332";
    ctx.fillRect(0, 0, w, 40);

    ctx.fillStyle = "#f0a04b";
    ctx.font = "bold 16px monospace";
    ctx.fillText("DAYTIME HIGHLAND TELEMETRY", 16, 26);

    ctx.fillStyle = "#9ec2d6";
    ctx.font = "12px monospace";
    ctx.fillText("SURFACE TEMPERATURE", 16, 68);
    ctx.fillStyle = "#f0a04b";
    ctx.font = "bold 22px monospace";
    ctx.fillText(`${telemetry.environment.temperature_celsius} °C`, 16, 92);

    ctx.fillStyle = "#9ec2d6";
    ctx.font = "12px monospace";
    ctx.fillText("SURFACE PRESSURE", 16, 122);
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
    ctx.fillText(`CO2: ${telemetry.environment.co2_percent}% · VIS: ${telemetry.environment.visibility_km} km`, 16, 226);

    ctx.fillStyle = "#0b1c28";
    ctx.fillRect(260, 56, 236, 176);
    ctx.strokeStyle = "#25536e";
    ctx.strokeRect(260, 56, 236, 176);

    ctx.fillStyle = "#6590a8";
    ctx.font = "10px monospace";
    ctx.fillText("HIGHLAND ELEVATION PROFILE", 270, 74);

    ctx.beginPath();
    ctx.strokeStyle = "#38d4f0";
    ctx.lineWidth = 2.5;
    const points = [185, 180, 175, 170, 160, 150, 135, 125, 115, 105, 95];
    const step = 216 / (points.length - 1);
    points.forEach((py, i) => {
      const px = 270 + i * step;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    ctx.fillStyle = "#52d9a3";
    ctx.font = "10px monospace";
    ctx.fillText("ALTITUDE GAIN: +440m · STABLE", 270, 218);
  }

  private drawComputer03(ctx: CanvasRenderingContext2D, w: number, h: number, manager: Sol03MissionManager): void {
    ctx.fillStyle = "#0d2332";
    ctx.fillRect(0, 0, w, 40);

    ctx.fillStyle = "#52d9a3";
    ctx.font = "bold 16px monospace";
    ctx.fillText("MISSION AUDIT & EXPEDITION PROGRESS", 16, 26);

    const items = [
      { label: "ROVER INGRESS", done: manager.isTaskComplete("SOL03_TASK_01") },
      { label: "SOL 01/02 LOG REVIEW", done: manager.isTaskComplete("SOL03_TASK_02") },
      { label: "WATER & NUTRIENTS (40%)", done: manager.isTaskComplete("SOL03_TASK_03") },
      { label: "ENVIRONMENT CHECK", done: manager.isTaskComplete("SOL03_TASK_04") },
      { label: "CHECKPOINT REACHED", done: manager.isTaskComplete("SOL03_TASK_06") },
      { label: "EVA PHOTOS (≥4 SAVED)", done: manager.isTaskComplete("SOL03_TASK_07") },
      { label: "RESEARCH LOG SUBMITTED", done: manager.isTaskComplete("SOL03_TASK_10") },
      { label: "FINISHING POINT REACHED", done: manager.isTaskComplete("SOL03_TASK_11") },
      { label: "FINAL REPORT & CHECKS", done: manager.isTaskComplete("SOL03_TASK_15") }
    ];

    ctx.font = "11px monospace";
    items.forEach((item, index) => {
      const y = 64 + index * 20;
      ctx.fillStyle = item.done ? "#52d9a3" : "#7c93a0";
      ctx.fillText(item.done ? "[✓] READY" : "[○] PENDING", 16, y);
      ctx.fillStyle = item.done ? "#d8eff8" : "#8aa0ab";
      ctx.fillText(item.label, 120, y);
    });
  }

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

  private drawDualResource(ctx: CanvasRenderingContext2D, w: number, h: number, telemetry: Sol03TelemetryData): void {
    ctx.fillStyle = "#0d2230";
    ctx.fillRect(0, 0, w, 36);
    ctx.fillStyle = "#52d9a3";
    ctx.font = "bold 13px monospace";
    ctx.fillText("WATER & NUTRIENT SUPPLY (SOL 3)", 12, 24);

    ctx.fillStyle = "#88b0c4";
    ctx.font = "12px monospace";
    ctx.fillText("POTABLE WATER (REF: 40%)", 16, 68);
    ctx.fillStyle = "#38d4f0";
    ctx.font = "bold 32px monospace";
    ctx.fillText(`${telemetry.resources.water_percent} %`, 16, 102);

    ctx.fillStyle = "#88b0c4";
    ctx.font = "12px monospace";
    ctx.fillText("NUTRIENT RESERVES", 16, 146);
    ctx.fillStyle = "#52d9a3";
    ctx.font = "bold 32px monospace";
    ctx.fillText(`${telemetry.resources.nutrient_percent} %`, 16, 180);

    ctx.fillStyle = "#f0a04b";
    ctx.font = "11px monospace";
    ctx.fillText(`STATUS: ${telemetry.resources.status}`, 16, 222);
  }

  private drawCompactResource(ctx: CanvasRenderingContext2D, w: number, h: number, telemetry: Sol03TelemetryData): void {
    ctx.fillStyle = "#0c1e2b";
    ctx.fillRect(0, 0, w, 28);
    ctx.fillStyle = "#38d4f0";
    ctx.font = "bold 12px monospace";
    ctx.fillText("RESOURCE STATUS", 10, 20);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px monospace";
    ctx.fillText(`H2O: ${telemetry.resources.water_percent} %`, 14, 58);
    ctx.fillText(`NUT: ${telemetry.resources.nutrient_percent} %`, 14, 84);
    ctx.fillStyle = "#52d9a3";
    ctx.font = "bold 13px monospace";
    ctx.fillText(`STATE: ${telemetry.resources.status}`, 14, 110);
  }

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

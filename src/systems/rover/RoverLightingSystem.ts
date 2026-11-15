import * as THREE from "three";
import { ROVER_LOCAL_FORWARD, ROVER_LOCAL_RIGHT } from "./RoverSystem";

export type RoverExteriorLightState = 0 | 1 | 2; // 0 = OFF, 1 = HEADLIGHTS, 2 = FULL LIGHTING

export class RoverLightingSystem {
  private state: RoverExteriorLightState = 0;
  private mainLights: THREE.SpotLight[] = [];
  private backLights: THREE.SpotLight[] = [];
  private upperLights: THREE.SpotLight[] = [];
  private sideLights: THREE.SpotLight[] = [];
  private lightGroup = new THREE.Group();

  constructor(private roverRoot: THREE.Object3D) {
    this.lightGroup.name = "Rover_Exterior_Lights_Rig";
    roverRoot.add(this.lightGroup);
    this.setupLights();
    this.applyState();
  }

  public get currentState(): RoverExteriorLightState {
    return this.state;
  }

  public setState(state: RoverExteriorLightState): void {
    this.state = (Math.max(0, Math.min(2, state))) as RoverExteriorLightState;
    this.applyState();
  }

  public cycleState(): RoverExteriorLightState {
    this.state = ((this.state + 1) % 3) as RoverExteriorLightState;
    this.applyState();
    return this.state;
  }

  private setupLights(): void {
    const getMarkerLocal = (marker: THREE.Object3D): THREE.Vector3 => {
      this.roverRoot.updateWorldMatrix(true, false);
      const worldPos = marker.getWorldPosition(new THREE.Vector3());
      return this.lightGroup.worldToLocal(worldPos);
    };

    // 1. Main Headlights (Main_Light_01 .. Main_Light_04)
    // White light, facing forward and downward.
    const mainNames = ["Main_Light_01", "Main_Light_02", "Main_Light_03", "Main_Light_04"];
    mainNames.forEach((name) => {
      const marker = this.roverRoot.getObjectByName(name);
      if (marker) {
        const spot = new THREE.SpotLight(0xfff8f0, 260, 180, Math.PI / 4.5, 0.45, 1.2);
        spot.userData.baseIntensity = 260;
        spot.castShadow = false;
        const localPos = getMarkerLocal(marker);
        spot.position.copy(localPos);
        const target = new THREE.Object3D();
        target.position.copy(localPos).addScaledVector(ROVER_LOCAL_FORWARD, 35).addScaledVector(new THREE.Vector3(0, 1, 0), -4.5);
        this.lightGroup.add(target);
        spot.target = target;
        this.lightGroup.add(spot);
        this.mainLights.push(spot);
      }
    });

    // 2. Rear Lights (Back_Light_01 .. Back_Light_04)
    // Warm amber/red light, facing backward.
    const backNames = ["Back_Light_01", "Back_Light_02", "Back_Light_03", "Back_Light_04"];
    backNames.forEach((name) => {
      const marker = this.roverRoot.getObjectByName(name);
      if (marker) {
        const spot = new THREE.SpotLight(0xff4422, 90, 50, Math.PI / 3.5, 0.5, 1.2);
        spot.userData.baseIntensity = 90;
        spot.castShadow = false;
        const localPos = getMarkerLocal(marker);
        spot.position.copy(localPos);
        const target = new THREE.Object3D();
        target.position.copy(localPos).addScaledVector(ROVER_LOCAL_FORWARD, -20).addScaledVector(new THREE.Vector3(0, 1, 0), -2.5);
        this.lightGroup.add(target);
        spot.target = target;
        this.lightGroup.add(spot);
        this.backLights.push(spot);
      }
    });

    // 3. Upper Lights (Upper_Light_01, Upper_Light_02)
    // High-beam forward spotlights.
    const upperNames = ["Upper_Light_01", "Upper_Light_02"];
    upperNames.forEach((name) => {
      const marker = this.roverRoot.getObjectByName(name);
      if (marker) {
        const spot = new THREE.SpotLight(0xffffff, 220, 160, Math.PI / 5, 0.4, 1.2);
        spot.userData.baseIntensity = 220;
        spot.castShadow = false;
        const localPos = getMarkerLocal(marker);
        spot.position.copy(localPos);
        const target = new THREE.Object3D();
        target.position.copy(localPos).addScaledVector(ROVER_LOCAL_FORWARD, 40).addScaledVector(new THREE.Vector3(0, 1, 0), -3.5);
        this.lightGroup.add(target);
        spot.target = target;
        this.lightGroup.add(spot);
        this.upperLights.push(spot);
      }
    });

    // 4. Side Lights (Side_Light_01, Side_Light_02)
    // Wide forward/side floodlights.
    const sideConfigs = [
      { name: "Side_Light_01", lateralSign: 1 },
      { name: "Side_Light_02", lateralSign: -1 }
    ];
    sideConfigs.forEach(({ name, lateralSign }) => {
      const marker = this.roverRoot.getObjectByName(name);
      if (marker) {
        const spot = new THREE.SpotLight(0xffeedd, 160, 110, Math.PI / 3.5, 0.45, 1.2);
        spot.userData.baseIntensity = 160;
        spot.castShadow = false;
        const localPos = getMarkerLocal(marker);
        spot.position.copy(localPos);
        const target = new THREE.Object3D();
        target.position.copy(localPos).addScaledVector(ROVER_LOCAL_FORWARD, 20).addScaledVector(ROVER_LOCAL_RIGHT, lateralSign * 12).addScaledVector(new THREE.Vector3(0, 1, 0), -3);
        this.lightGroup.add(target);
        spot.target = target;
        this.lightGroup.add(spot);
        this.sideLights.push(spot);
      }
    });
  }

  private applyState(): void {
    const setLight = (light: THREE.SpotLight, on: boolean) => {
      light.visible = on;
      light.intensity = on ? (light.userData.baseIntensity ?? 20) : 0;
    };

    if (this.state === 0) {
      this.mainLights.forEach(l => setLight(l, false));
      this.backLights.forEach(l => setLight(l, false));
      this.upperLights.forEach(l => setLight(l, false));
      this.sideLights.forEach(l => setLight(l, false));
    } else if (this.state === 1) {
      this.mainLights.forEach(l => setLight(l, true));
      this.backLights.forEach(l => setLight(l, false));
      this.upperLights.forEach(l => setLight(l, false));
      this.sideLights.forEach(l => setLight(l, false));
    } else if (this.state === 2) {
      this.mainLights.forEach(l => setLight(l, true));
      this.backLights.forEach(l => setLight(l, true));
      this.upperLights.forEach(l => setLight(l, true));
      this.sideLights.forEach(l => setLight(l, true));
    }
  }

  public dispose(): void {
    const allLights = [...this.mainLights, ...this.backLights, ...this.upperLights, ...this.sideLights];
    allLights.forEach(l => {
      l.parent?.remove(l.target);
      l.parent?.remove(l);
      l.dispose();
    });
    this.mainLights = [];
    this.backLights = [];
    this.upperLights = [];
    this.sideLights = [];
    this.roverRoot.remove(this.lightGroup);
  }
}

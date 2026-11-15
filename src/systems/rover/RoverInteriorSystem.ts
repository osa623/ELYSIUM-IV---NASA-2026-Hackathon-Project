import * as THREE from "three";

export class RoverInteriorSystem {
  public readonly interiorGroup: THREE.Group;
  public readonly floorWalkable: THREE.Object3D | null = null;
  public readonly colliderSection01: THREE.Object3D | null = null;
  public readonly drivingTrigger: THREE.Object3D | null = null;
  public readonly outdoorNavTrigger: THREE.Object3D | null = null;
  public readonly mainScreenTrigger: THREE.Object3D | null = null;
  public readonly environmentCheckingTrigger: THREE.Object3D | null = null;
  public readonly toolSectionTrigger: THREE.Object3D | null = null;
  public readonly waterAndNutTrigger: THREE.Object3D | null = null;

  private interiorLights: THREE.Light[] = [];
  private bounds = new THREE.Box3();
  private colliderBox = new THREE.Box3();

  constructor(interiorModel: THREE.Group) {
    this.interiorGroup = interiorModel;
    this.floorWalkable = interiorModel.getObjectByName("Floor_Walkable") ?? null;
    this.colliderSection01 = interiorModel.getObjectByName("Collirder_Section01") ?? interiorModel.getObjectByName("Collider_Section_01") ?? null;
    this.drivingTrigger = interiorModel.getObjectByName("Driving_Section_Trigger") ?? null;
    this.outdoorNavTrigger = interiorModel.getObjectByName("Outdoor_Navigation_Trigger") ?? null;
    this.mainScreenTrigger = interiorModel.getObjectByName("Main_Screen_Trigger") ?? null;
    this.environmentCheckingTrigger = interiorModel.getObjectByName("Environment_Checking_Trigger") ?? null;
    this.toolSectionTrigger = interiorModel.getObjectByName("Tool_Section_Trigger") ?? null;
    this.waterAndNutTrigger = interiorModel.getObjectByName("Water_and_nut_Trigger") ?? null;

    // Interaction volumes and collision helpers should never render as cabin
    // surfaces, even when a replacement GLB gives them visible materials.
    interiorModel.traverse(object => {
      if (/trigger|spawn|collider|collirder/i.test(object.name)) object.visible = false;
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        const standard = material as THREE.MeshStandardMaterial;
        // The replacement GLB marks its fixture material with emissiveStrength
        // 20, which renders the whole lamp surface as clipped white. Keep the
        // fixture visible but bring it back to a normal cabin light level.
        if (standard.isMeshStandardMaterial && standard.name.toLowerCase() === "light") {
          standard.emissiveIntensity = Math.min(standard.emissiveIntensity, 1.25);
          standard.needsUpdate = true;
        }
      }
    });

    this.setupInteriorLights();
    this.setupScreenMaterials();
    this.updateBounds();
  }

  private setupScreenMaterials(): void {
    const screenNames = [
      "Computer_Screen_01",
      "Computer_Screen_02",
      "Computer_Screen_03",
      "O2_Screen",
      "Water_and_Nut_Screen",
      "Water_and_Nut_Screen_02",
      "sm_Air_filter_screen",
      "sm_battery_Screen",
      "sm_cabin_pressure",
      "sm_co2_screen",
      "sm_environment_screen",
      "sm_o2_Screen",
      "sm_status_screen",
      "sm_temperature_screen"
    ];

    screenNames.forEach(name => {
      const screenObj = this.interiorGroup.getObjectByName(name) as THREE.Mesh | undefined;
      if (screenObj && screenObj.isMesh) {
        const materials = Array.isArray(screenObj.material) ? screenObj.material : [screenObj.material];
        for (const material of materials) {
          const mat = material as THREE.MeshStandardMaterial;
          if (!mat.isMeshStandardMaterial) continue;
          // Preserve the GLB-authored screen map and emissive color. The old
          // blanket blue emissive override clipped the displays to white-blue.
          mat.roughness = Math.min(mat.roughness, 0.35);
          mat.needsUpdate = true;
        }
      }
    });
  }

  private setupInteriorLights(): void {
    // Low output, warm neutral cabin fill. The previous 42/16 intensities
    // overexposed the close cabin surfaces and clipped their material detail.
    const mainLightNames = ["main_light_01", "main_light_02", "main_light_03"];
    for (const name of mainLightNames) {
      const marker = this.interiorGroup.getObjectByName(name);
      if (!marker) continue;
      const spot = new THREE.SpotLight(0xfff4e8, 5, 12, Math.PI / 2.5, 0.65, 1.5);
      spot.name = `${name}_RuntimeFill`;
      spot.userData.baseIntensity = 5;
      spot.castShadow = false;
      spot.visible = false;
      const target = new THREE.Object3D();
      target.position.set(0, -1.8, 0);
      marker.add(target);
      spot.target = target;
      marker.add(spot);
      this.interiorLights.push(spot);
    }
    const secondaryNames = ["2_light_01", "2_light_02", "2_light_03", "2_light_04"];
    for (const name of secondaryNames) {
      const marker = this.interiorGroup.getObjectByName(name);
      if (!marker) continue;
      const fill = new THREE.PointLight(0xfff0df, 1, 7, 1.6);
      fill.name = `${name}_RuntimeFill`;
      fill.userData.baseIntensity = 1;
      fill.visible = false;
      marker.add(fill);
      this.interiorLights.push(fill);
    }
  }

  public updateBounds(): void {
    this.interiorGroup.updateWorldMatrix(true, true);
    if (this.floorWalkable) {
      this.bounds.setFromObject(this.floorWalkable);
    } else {
      this.bounds.setFromObject(this.interiorGroup);
    }
    if (this.colliderSection01) {
      this.colliderBox.setFromObject(this.colliderSection01);
    }
  }

  public getColliderBoxes(): THREE.Box3[] {
    this.updateBounds();
    const boxes: THREE.Box3[] = [];
    if (this.colliderSection01) {
      boxes.push(this.colliderBox.clone());
    }
    return boxes;
  }

  /** Checks if a world position is within walkable interior bounds */
  public canOccupy(pos: THREE.Vector3): boolean {
    this.updateBounds();
    if (!this.isInsideWalkableFloor(pos)) return false;
    if (this.colliderSection01 && this.colliderBox.containsPoint(pos)) return false;
    return true;
  }

  public getFloorHeight(): number {
    this.updateBounds();
    if (this.floorWalkable) {
      const wp = this.floorWalkable.getWorldPosition(new THREE.Vector3());
      return wp.y;
    }
    return this.interiorGroup.position.y + 0.41;
  }

  public isInsideWalkableFloor(pos: THREE.Vector3): boolean {
    const margin = 0.2;
    return (
      pos.x >= this.bounds.min.x + margin &&
      pos.x <= this.bounds.max.x - margin &&
      pos.z >= this.bounds.min.z + margin &&
      pos.z <= this.bounds.max.z - margin
    );
  }

  public getOutdoorNavWorldPosition(): THREE.Vector3 {
    this.interiorGroup.updateWorldMatrix(true, true);
    if (this.outdoorNavTrigger) {
      return this.outdoorNavTrigger.getWorldPosition(new THREE.Vector3());
    }
    return this.interiorGroup.position.clone().add(new THREE.Vector3(3.9, 0, 1.4));
  }

  public getDrivingWorldPosition(): THREE.Vector3 {
    this.interiorGroup.updateWorldMatrix(true, true);
    if (this.drivingTrigger) {
      return this.drivingTrigger.getWorldPosition(new THREE.Vector3());
    }
    return this.interiorGroup.position.clone().add(new THREE.Vector3(-3.8, 0, 1.2));
  }

  public getMainScreenWorldPosition(): THREE.Vector3 {
    this.interiorGroup.updateWorldMatrix(true, true);
    if (this.mainScreenTrigger) {
      return this.mainScreenTrigger.getWorldPosition(new THREE.Vector3());
    }
    return this.interiorGroup.position.clone().add(new THREE.Vector3(-1.24, 0, 0.01));
  }

  public getEnvironmentCheckingWorldPosition(): THREE.Vector3 {
    this.interiorGroup.updateWorldMatrix(true, true);
    if (this.environmentCheckingTrigger) {
      return this.environmentCheckingTrigger.getWorldPosition(new THREE.Vector3());
    }
    return this.interiorGroup.position.clone().add(new THREE.Vector3(3.53, 0, 0.61));
  }

  public getToolSectionWorldPosition(): THREE.Vector3 {
    this.interiorGroup.updateWorldMatrix(true, true);
    if (this.toolSectionTrigger) {
      return this.toolSectionTrigger.getWorldPosition(new THREE.Vector3());
    }
    return this.interiorGroup.position.clone().add(new THREE.Vector3(0.75, 0, 0.67));
  }

  public getWaterAndNutWorldPosition(): THREE.Vector3 {
    this.interiorGroup.updateWorldMatrix(true, true);
    if (this.waterAndNutTrigger) {
      return this.waterAndNutTrigger.getWorldPosition(new THREE.Vector3());
    }
    return this.interiorGroup.position.clone().add(new THREE.Vector3(-2.95, 0, 0.47));
  }

  public setLightsActive(active: boolean): void {
    this.interiorLights.forEach(light => {
      light.visible = active;
      light.intensity = active ? (light.userData.baseIntensity ?? 1) : 0;
    });
  }

  public dispose(): void {
    this.interiorLights.forEach(light => {
      if (light instanceof THREE.SpotLight) light.parent?.remove(light.target);
      light.parent?.remove(light);
      light.dispose();
    });
    this.interiorLights = [];
  }
}

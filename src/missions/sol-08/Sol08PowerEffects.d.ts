import * as THREE from "three";

export declare class Sol08PowerEffects {
  start(): void;
  dispose(): void;
  disableModuleLights(model: THREE.Group, module: string): void;
  restoreLights(): void;
  fadeOut(): void;
  isActive(): boolean;
  update(dt: number): void;
}

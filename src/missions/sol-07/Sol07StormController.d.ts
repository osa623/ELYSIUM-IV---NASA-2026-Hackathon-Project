import * as THREE from "three";

export declare class Sol07StormController {
  start(): void;
  dispose(): void;
  applyToModule(model: THREE.Group, module: string): void;
  isActive(): boolean;
  endAfterValidatedReport(): void;
  update(dt: number): void;
}

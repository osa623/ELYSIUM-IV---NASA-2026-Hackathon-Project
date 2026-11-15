import * as THREE from "three";

export type DroneCameraView = "front" | "rear" | "left" | "right" | "down";
export type DroneCameraRig = Record<DroneCameraView, THREE.Camera>;
export type DroneFlightState = any;
export type Sol5GuidanceRig = any;
export type Sol5LandingBeacon = any;
export type Sol5TargetBeacon = any;

export declare const SOL5_LIMITS: {
  maxAltitudeAglM: number;
  minAltitudeAglM: number;
  operationalBoundaryM: number;
  targetInspectionRadiusM: number;
  safeLandingSpeedMps: number;
  batteryDrainRatePerSec: number;
};

export declare function droneControlsFromKeys(keys: Set<string>, yaw?: number): any;
export declare function attachDroneCamera(...args: any[]): any;
export declare function createDroneCameraRig(anchor: THREE.Object3D, camera: THREE.PerspectiveCamera): DroneCameraRig;
export declare function orientDroneCameraRig(rig: DroneCameraRig, yaw: number, pitch: number): void;
export declare function detachDroneCamera(...args: any[]): any;
export declare function detachDroneCameraRig(anchor: THREE.Object3D, scene: THREE.Scene, rig: DroneCameraRig, camera: THREE.Camera): void;
export declare function createDroneFlightState(takeoff: THREE.Vector3, target: THREE.Vector3): DroneFlightState;
export declare function getSol5TakeoffPosition(node: THREE.Object3D): THREE.Vector3;
export declare function isInsideSol5LandingTrigger(pos: THREE.Vector3, trigger: THREE.Object3D): boolean;
export declare function altitudeAgl(...args: any[]): any;
export declare function stepDroneFlight(...args: any[]): any;
export declare function canLand(flight: any, landingTrigger: any): boolean;
export declare function resolveSol5EAction(...args: any[]): any;
export declare function createSol5LandingBeacon(scene: THREE.Scene, ref: any): Sol5LandingBeacon;
export declare function setSol5LandingBeaconVisible(beacon: Sol5LandingBeacon, visible: boolean): void;
export declare function disposeSol5LandingBeacon(beacon: Sol5LandingBeacon): void;
export declare function createSol5TargetBeacon(scene: THREE.Scene, ref: any): Sol5TargetBeacon;
export declare function updateSol5TargetBeacon(beacon: Sol5TargetBeacon, target: any, visible?: boolean): void;
export declare function setSol5TargetBeaconVisible(beacon: Sol5TargetBeacon, visible: boolean): void;
export declare function disposeSol5TargetBeacon(beacon: Sol5TargetBeacon): void;
export declare function createSol5Guidance(scene: THREE.Scene): Sol5GuidanceRig;
export declare function updateSol5Guidance(...args: any[]): any;
export declare function disposeSol5Guidance(guidance: Sol5GuidanceRig): void;

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sol07StormController = exports.SOL07_EMERGENCY_LIGHTS = exports.SOL07_AUDIO = void 0;
const THREE = __importStar(require("three"));
const AssetLoading_1 = require("../../core/AssetLoading");
exports.SOL07_AUDIO = {
    warning: "/assets/sounds/sol7Sounds/warningBeepTone.MP3",
    ambience: "/assets/sounds/sol7Sounds/sandStormSound.MP3"
};
exports.SOL07_EMERGENCY_LIGHTS = {
    Airlock: ["Light02", "Light08"],
    Hub: ["Light_12", "Light_15", "Light_16", "Light_17", "Light_18"],
    Habitat: ["LightStrip08", "LightStrip09", "LightStrip10", "LightStrip12", "LightStrip13", "LightStrip14"],
    MissionControl: ["LightStrip02", "LightStrip03", "LightStrip04", "LightStrip05", "LightStrip06", "LightStrip07", "LightStrip08", "LightStrip09", "LightStrip10"],
    Science: ["Light.007", "Light.010", "Light.012"],
    Engineering: ["Walking_Path_Light_0", "Walking_Path_Light_01", "Walking_Path_Light_02"],
    Terrain: [], Drone: []
};
// Morse SOS: three short, three long, three short, with readable gaps.
const SOS_PATTERN = [
    [true, 0.28], [false, 0.22], [true, 0.28], [false, 0.22], [true, 0.28], [false, 0.62],
    [true, 0.78], [false, 0.22], [true, 0.78], [false, 0.22], [true, 0.78], [false, 0.62],
    [true, 0.28], [false, 0.22], [true, 0.28], [false, 0.22], [true, 0.28], [false, 1.1]
];
const SOS_CYCLE_SECONDS = SOS_PATTERN.reduce((sum, [, duration]) => sum + duration, 0);
/** Sol 7-only emergency effects. Captures authored values once and restores them verbatim. */
class Sol07StormController {
    active = false;
    ending = false;
    elapsed = 0;
    pulseOn = null;
    lights = new Map();
    audio = [];
    start(createAudio = src => (0, AssetLoading_1.getPreparedAudioElement)(src) ?? new Audio((0, AssetLoading_1.getPreparedAssetUrl)(src))) {
        if (this.active)
            return;
        this.active = true;
        this.ending = false;
        this.elapsed = 0;
        this.pulseOn = null;
        const warning = createAudio(exports.SOL07_AUDIO.warning);
        warning.loop = true;
        warning.volume = 0.12;
        const ambience = createAudio(exports.SOL07_AUDIO.ambience);
        ambience.loop = true;
        ambience.volume = 0.2;
        this.audio = [{ audio: warning, target: 0.12 }, { audio: ambience, target: 0.2 }];
        for (const item of this.audio) {
            void item.audio.play().catch(() => undefined);
        }
    }
    applyToModule(model, module) {
        if (!this.active || this.ending)
            return { found: [], missing: [] };
        const expected = exports.SOL07_EMERGENCY_LIGHTS[module];
        const byName = new Map();
        model.traverse(object => { if (expected.includes(object.name))
            byName.set(object.name, object); });
        const found = [];
        for (const name of expected) {
            const object = byName.get(name);
            if (!object)
                continue;
            found.push(name);
            const targets = [object];
            object.traverse(child => {
                if (child === object)
                    return;
                const candidate = child;
                if (candidate.isLight || candidate.isMesh)
                    targets.push(child);
            });
            for (const target of targets) {
                const light = target;
                const mesh = target;
                const materialObjects = mesh.isMesh ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
                if (this.lights.has(target.uuid) || (!materialObjects.length && !("intensity" in light)))
                    continue;
                this.lights.set(target.uuid, {
                    object: target,
                    intensity: "intensity" in light ? light.intensity : undefined,
                    color: "color" in light && light.color instanceof THREE.Color ? light.color.clone() : undefined,
                    material: materialObjects.map(material => {
                        const m = material;
                        return { material, color: m.color?.clone(), emissive: m.emissive?.clone(), emissiveIntensity: m.emissiveIntensity, opacity: m.opacity, transparent: m.transparent };
                    })
                });
            }
        }
        const missing = expected.filter(name => !byName.has(name));
        if (missing.length)
            console.warn(`[Sol 7] Emergency-light mappings not found in ${module}: ${missing.join(", ")}`);
        this.applyFlicker(this.currentPulseState());
        return { found, missing };
    }
    update(dt) {
        if (!this.active)
            return;
        this.elapsed += Math.max(0, dt);
        if (!this.ending) {
            const pulseOn = this.currentPulseState();
            if (pulseOn !== this.pulseOn)
                this.applyFlicker(pulseOn);
        }
        const blend = Math.min(1, Math.max(0, dt) * 0.8);
        for (const item of this.audio) {
            const target = this.ending ? 0 : item.target;
            item.audio.volume += (target - item.audio.volume) * blend;
            if (this.ending && item.audio.volume < 0.004) {
                item.audio.volume = 0;
                item.audio.pause();
                item.audio.currentTime = 0;
            }
        }
        if (this.ending && this.audio.every(item => item.audio.paused)) {
            this.restoreLights();
            this.active = false;
            this.ending = false;
        }
    }
    unlock() {
        if (!this.active || this.ending)
            return;
        for (const item of this.audio)
            if (item.audio.paused)
                void item.audio.play().catch(() => undefined);
    }
    /** Called only after MissionManager validates and persists the final report. */
    endAfterValidatedReport() { if (this.active)
        this.ending = true; }
    isActive() { return this.active && !this.ending; }
    isEnding() { return this.ending; }
    /** Interrupted lifecycle cleanup restores captured properties immediately. */
    dispose() {
        for (const item of this.audio) {
            item.audio.pause();
            item.audio.currentTime = 0;
            item.audio.volume = 0;
        }
        this.audio = [];
        this.restoreLights();
        this.active = false;
        this.ending = false;
        this.elapsed = 0;
    }
    currentPulseState() {
        let phase = this.elapsed % SOS_CYCLE_SECONDS;
        for (const [on, duration] of SOS_PATTERN) {
            if (phase < duration)
                return on;
            phase -= duration;
        }
        return false;
    }
    applyFlicker(on) {
        this.pulseOn = on;
        for (const snapshot of this.lights.values()) {
            const light = snapshot.object;
            const lightLevel = on ? 2.2 : 0.08;
            if (snapshot.intensity !== undefined)
                light.intensity = Math.max(snapshot.intensity * lightLevel, on ? 1.5 : 0.04);
            if (snapshot.color && "color" in light)
                light.color.setRGB(1, on ? 0.025 : 0.006, on ? 0.008 : 0.003);
            for (const item of snapshot.material) {
                const mat = item.material;
                if (item.emissive) {
                    mat.emissive?.setRGB(1, on ? 0.012 : 0.002, on ? 0.003 : 0.001);
                    mat.emissiveIntensity = Math.max(item.emissiveIntensity ?? 1, on ? 2.8 : 0.18);
                }
                if (item.color)
                    mat.color?.setRGB(on ? 1 : 0.24, on ? 0.035 : 0.008, on ? 0.025 : 0.006);
            }
        }
    }
    restoreLights() {
        for (const snapshot of this.lights.values()) {
            const light = snapshot.object;
            if (snapshot.intensity !== undefined)
                light.intensity = snapshot.intensity;
            if (snapshot.color && "color" in light)
                light.color.copy(snapshot.color);
            for (const item of snapshot.material) {
                const mat = item.material;
                if (item.color)
                    mat.color?.copy(item.color);
                if (item.emissive)
                    mat.emissive?.copy(item.emissive);
                if (item.emissiveIntensity !== undefined)
                    mat.emissiveIntensity = item.emissiveIntensity;
                if (item.opacity !== undefined)
                    mat.opacity = item.opacity;
                if (item.transparent !== undefined)
                    mat.transparent = item.transparent;
                mat.needsUpdate = true;
            }
        }
        this.lights.clear();
    }
}
exports.Sol07StormController = Sol07StormController;

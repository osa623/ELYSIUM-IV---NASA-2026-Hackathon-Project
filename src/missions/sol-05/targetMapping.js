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
exports.SOL5_EVIDENCE_ASSETS = exports.SOL5_SCENE_TARGETS = void 0;
exports.resolveSol5Target = resolveSol5Target;
const THREE = __importStar(require("three"));
/** Mapping is defined by the catalogue's stable 01/02/03 targetNumber, not guessed coordinates. */
exports.SOL5_SCENE_TARGETS = {
    TARGET_ALPHA_CRATER_RIM: "target_01",
    TARGET_BETA_DUNE_BASIN: "target_02",
    TARGET_GAMMA_SOUTH_ESCARPMENT: "target_03"
};
/** Existing mission-provided files. These are evidence previews, not images captured by the simulated drone. */
exports.SOL5_EVIDENCE_ASSETS = {
    TARGET_ALPHA_CRATER_RIM: [
        { id: "SOL5_ALPHA_BW", targetId: "TARGET_ALPHA_CRATER_RIM", fileName: "bandw.png", assetPath: "/assets/images/Selected_Missions/target_01/bandw.png" },
        { id: "SOL5_ALPHA_COLOR", targetId: "TARGET_ALPHA_CRATER_RIM", fileName: "wide_aerial_top_down_satellite_style_image_of_a.png", assetPath: "/assets/images/Selected_Missions/target_01/wide_aerial_top_down_satellite_style_image_of_a.png" },
        { id: "SOL5_ALPHA_THERMAL", targetId: "TARGET_ALPHA_CRATER_RIM", fileName: "a_wide_top_down_high_resolution_false_color_ther.png", assetPath: "/assets/images/Selected_Missions/target_01/a_wide_top_down_high_resolution_false_color_ther.png" }
    ],
    TARGET_BETA_DUNE_BASIN: [
        { id: "SOL5_BETA_BW", targetId: "TARGET_BETA_DUNE_BASIN", fileName: "bandw.png", assetPath: "/assets/images/Selected_Missions/target_02/bandw.png" },
        { id: "SOL5_BETA_COLOR", targetId: "TARGET_BETA_DUNE_BASIN", fileName: "Cratered Martian Rust Plain-1.png", assetPath: "/assets/images/Selected_Missions/target_02/Cratered%20Martian%20Rust%20Plain-1.png" },
        { id: "SOL5_BETA_THERMAL", targetId: "TARGET_BETA_DUNE_BASIN", fileName: "a_wide_top_down_abstract_false_color_thermal_hea.png", assetPath: "/assets/images/Selected_Missions/target_02/a_wide_top_down_abstract_false_color_thermal_hea.png" }
    ],
    TARGET_GAMMA_SOUTH_ESCARPMENT: [
        { id: "SOL5_GAMMA_BW", targetId: "TARGET_GAMMA_SOUTH_ESCARPMENT", fileName: "bandw.png", assetPath: "/assets/images/Selected_Missions/target_03/bandw.png" },
        { id: "SOL5_GAMMA_COLOR", targetId: "TARGET_GAMMA_SOUTH_ESCARPMENT", fileName: "Cratered Rust Plains of Elysium-2.png", assetPath: "/assets/images/Selected_Missions/target_03/Cratered%20Rust%20Plains%20of%20Elysium-2.png" },
        { id: "SOL5_GAMMA_THERMAL", targetId: "TARGET_GAMMA_SOUTH_ESCARPMENT", fileName: "a_wide_high_resolution_false_color_thermal_infrar.png", assetPath: "/assets/images/Selected_Missions/target_03/a_wide_high_resolution_false_color_thermal_infrar.png" }
    ]
};
function resolveSol5Target(scene, targetId, registry) {
    if (!targetId)
        return null;
    const definition = registry.find(target => target.id === targetId);
    const objectName = exports.SOL5_SCENE_TARGETS[targetId];
    const object = objectName ? scene.getObjectByName(objectName) : null;
    if (!definition || !object)
        return null;
    scene.updateWorldMatrix(true, true);
    const position = object.getWorldPosition(new THREE.Vector3());
    return { definition, object, position };
}

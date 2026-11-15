import * as THREE from "three";

export class NavigationBeamSystem {
  public readonly group: THREE.Group;
  private beamMesh: THREE.Mesh | null = null;
  private beaconMesh: THREE.Mesh | null = null;
  private beaconRings: THREE.Mesh[] = [];
  private beamMaterial: THREE.ShaderMaterial;
  private beaconMaterial: THREE.MeshBasicMaterial;
  private curvePoints: THREE.Vector3[] = [];
  private time = 0;
  private currentTargetName: string | null = null;
  private activeTargetPos = new THREE.Vector3();

  constructor(private scene: THREE.Scene) {
    this.group = new THREE.Group();
    this.group.name = "Dynamic_Navigation_Beam_System";
    this.group.visible = false;
    scene.add(this.group);

    // Glowing cyan shader material with traveling pulse effect
    this.beamMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x38d4f0) },
        uCoreColor: { value: new THREE.Color(0xe8ffff) }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uCoreColor;
        varying vec2 vUv;
        varying vec3 vNormal;

        void main() {
          // Flowing directional pulse along the length (vUv.x)
          float flow = mod(vUv.x * 24.0 - uTime * 6.5, 1.0);
          float pulse = smoothstep(0.0, 0.45, flow) * (1.0 - smoothstep(0.45, 0.9, flow));

          // Soft edge glow
          float edge = abs(vUv.y - 0.5) * 2.0;
          float alpha = (1.0 - edge * edge) * (0.55 + 0.45 * pulse);

          vec3 col = mix(uColor, uCoreColor, pulse * 0.7);
          gl_FragColor = vec4(col, clamp(alpha * 0.85, 0.0, 1.0));
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.beaconMaterial = new THREE.MeshBasicMaterial({
      color: 0x38d4f0,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.initBeacon();
  }

  private initBeacon(): void {
    // Vertical light column at checkpoint destination
    const columnGeom = new THREE.CylinderGeometry(0.8, 1.6, 60, 16, 1, true);
    columnGeom.translate(0, 30, 0);
    this.beaconMesh = new THREE.Mesh(columnGeom, this.beaconMaterial);
    this.group.add(this.beaconMesh);

    // Expanding concentric landing rings
    for (let i = 0; i < 3; i++) {
      const ringGeom = new THREE.RingGeometry(2.5 + i * 2.5, 3.2 + i * 2.5, 32);
      ringGeom.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x55cde8,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.y = 0.3;
      ring.userData.baseScale = 1 + i * 0.3;
      this.beaconRings.push(ring);
      this.group.add(ring);
    }
  }

  /**
   * Updates the navigation beam every frame.
   *
   * @param dt Delta time in seconds
   * @param roverPos Current world position of the rover
   * @param targetObject The destination Object3D (2ndCheckpoint or Finishing_Point)
   * @param isDriving Whether rover driving mode is active
   */
  public update(
    dt: number,
    roverPos: THREE.Vector3,
    targetObject: THREE.Object3D | null,
    isDriving: boolean
  ): void {
    if (!isDriving || !targetObject) {
      this.group.visible = false;
      return;
    }

    this.time += dt;
    this.beamMaterial.uniforms.uTime.value = this.time;

    targetObject.getWorldPosition(this.activeTargetPos);

    const dist = roverPos.distanceTo(this.activeTargetPos);
    if (dist < 4.0 || dist > 25000) {
      this.group.visible = false;
      return;
    }

    this.group.visible = true;

    // 1. Position destination beacon
    if (this.beaconMesh) {
      this.beaconMesh.position.copy(this.activeTargetPos);
    }
    this.beaconRings.forEach((ring, idx) => {
      ring.position.x = this.activeTargetPos.x;
      ring.position.z = this.activeTargetPos.z;
      ring.position.y = this.activeTargetPos.y + 0.35;
      const pulseScale = 1.0 + 0.25 * Math.sin(this.time * 3.5 + idx * 1.2);
      ring.scale.set(pulseScale, pulseScale, pulseScale);
    });

    // 2. Build arched catenary curve from rover roof to destination
    // Origin starts 2.4m above the vehicle body so the beam emerges clearly
    const startPoint = roverPos.clone().add(new THREE.Vector3(0, 2.4, 0));
    const endPoint = this.activeTargetPos.clone().add(new THREE.Vector3(0, 2.0, 0));

    // Midpoint elevated by distance ratio (graceful arc above terrain mounds)
    const midPoint = startPoint.clone().lerp(endPoint, 0.5);
    const arcHeight = Math.min(65, Math.max(8, dist * 0.035));
    midPoint.y += arcHeight;

    const quarterA = startPoint.clone().lerp(midPoint, 0.5);
    quarterA.y += arcHeight * 0.45;
    const quarterB = midPoint.clone().lerp(endPoint, 0.5);
    quarterB.y += arcHeight * 0.45;

    this.curvePoints = [startPoint, quarterA, midPoint, quarterB, endPoint];
    const curve = new THREE.CatmullRomCurve3(this.curvePoints);

    // Rebuild tube geometry along the curve
    if (this.beamMesh) {
      this.beamMesh.geometry.dispose();
      this.group.remove(this.beamMesh);
    }

    const segments = Math.min(80, Math.max(30, Math.floor(dist / 20)));
    const tubeRadius = Math.max(0.22, Math.min(0.65, dist * 0.0006));
    const tubeGeom = new THREE.TubeGeometry(curve, segments, tubeRadius, 8, false);
    this.beamMesh = new THREE.Mesh(tubeGeom, this.beamMaterial);
    this.group.add(this.beamMesh);
  }

  public hide(): void {
    this.group.visible = false;
  }

  public dispose(): void {
    if (this.beamMesh) {
      this.beamMesh.geometry.dispose();
      this.group.remove(this.beamMesh);
    }
    if (this.beaconMesh) {
      this.beaconMesh.geometry.dispose();
      this.group.remove(this.beaconMesh);
    }
    this.beaconRings.forEach(ring => {
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
      this.group.remove(ring);
    });
    this.beaconRings = [];
    this.beamMaterial.dispose();
    this.beaconMaterial.dispose();
    this.scene.remove(this.group);
  }
}

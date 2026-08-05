import type { CameraMode, CelestialBodyId, UniverseLevel } from '../../../types/universe'

type ThreeModule = typeof import('three')
type OrbitControls = InstanceType<
  typeof import('three/examples/jsm/controls/OrbitControls.js').OrbitControls
>

const LEVEL_CAMERA: Record<UniverseLevel, { target: [number, number, number], position: [number, number, number] }> = {
  1: { target: [0, 0, 0], position: [0, 1.2, 3.2] },
  2: { target: [0, 0, 0], position: [0, 2, 6] },
  3: { target: [0, 0, 0], position: [0, 4, 14] },
  4: { target: [0, 0, 0], position: [0, 80, 180] },
  5: { target: [0, 0, 0], position: [0, 40, 120] },
  6: { target: [0, 0, 0], position: [0, 60, 160] },
  7: { target: [0, 0, 0], position: [0, 50, 140] },
  8: { target: [0, 0, 0], position: [0, 55, 150] },
  9: { target: [0, 0, 0], position: [0, 70, 200] }
}

export class CameraController {
  private readonly THREE: ThreeModule
  private readonly camera: InstanceType<ThreeModule['PerspectiveCamera']>
  private readonly controls: OrbitControls
  private mode: CameraMode = 'free'
  private followId: CelestialBodyId | null = null
  private getBodyPosition: ((id: CelestialBodyId) => { x: number, y: number, z: number } | null) | null = null
  private transition = 0
  private fromPos = { x: 0, y: 0, z: 0 }
  private toPos = { x: 0, y: 0, z: 0 }
  private fromTarget = { x: 0, y: 0, z: 0 }
  private toTarget = { x: 0, y: 0, z: 0 }

  constructor(
    THREE: ThreeModule,
    camera: InstanceType<ThreeModule['PerspectiveCamera']>,
    controls: OrbitControls
  ) {
    this.THREE = THREE
    this.camera = camera
    this.controls = controls
  }

  setBodyPositionGetter(
    getter: (id: CelestialBodyId) => { x: number, y: number, z: number } | null
  ): void {
    this.getBodyPosition = getter
  }

  setMode(mode: CameraMode, bodyId?: CelestialBodyId | null): void {
    this.mode = mode
    this.followId = bodyId ?? this.followId
    if (mode === 'focus' && this.followId && this.getBodyPosition) {
      const pos = this.getBodyPosition(this.followId)
      if (pos) {
        this.controls.target.set(pos.x, pos.y, pos.z)
        this.camera.position.set(pos.x + 8, pos.y + 4, pos.z + 8)
        this.controls.update()
      }
    }
  }

  reset(level: UniverseLevel): void {
    this.mode = 'free'
    this.followId = null
    this.beginLevelTransition(level)
  }

  beginLevelTransition(level: UniverseLevel): void {
    const cfg = LEVEL_CAMERA[level]
    this.fromPos = {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z
    }
    this.fromTarget = {
      x: this.controls.target.x,
      y: this.controls.target.y,
      z: this.controls.target.z
    }
    this.toPos = { x: cfg.position[0], y: cfg.position[1], z: cfg.position[2] }
    this.toTarget = { x: cfg.target[0], y: cfg.target[1], z: cfg.target[2] }
    this.transition = 0.001
  }

  update(dt: number): void {
    if (this.transition > 0 && this.transition < 1) {
      this.transition = Math.min(1, this.transition + dt / 1.0)
      const t = 1 - (1 - this.transition) ** 3
      this.camera.position.set(
        lerp(this.fromPos.x, this.toPos.x, t),
        lerp(this.fromPos.y, this.toPos.y, t),
        lerp(this.fromPos.z, this.toPos.z, t)
      )
      this.controls.target.set(
        lerp(this.fromTarget.x, this.toTarget.x, t),
        lerp(this.fromTarget.y, this.toTarget.y, t),
        lerp(this.fromTarget.z, this.toTarget.z, t)
      )
      this.controls.update()
      return
    }

    if (this.mode === 'follow' && this.followId && this.getBodyPosition) {
      const pos = this.getBodyPosition(this.followId)
      if (pos) {
        const offset = this.camera.position.clone().sub(this.controls.target)
        this.controls.target.set(pos.x, pos.y, pos.z)
        this.camera.position.set(pos.x + offset.x, pos.y + offset.y, pos.z + offset.z)
        this.controls.update()
      }
    }
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

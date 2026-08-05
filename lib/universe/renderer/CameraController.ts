import type { CameraMode, CelestialBodyId, UniverseLevel, Vec3 } from '../../../types/universe'
import type { CameraEasing, CameraKeyframe, FocusTarget } from '../../../types/journey'

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

interface ActiveAnim {
  fromPos: Vec3
  toPos: Vec3
  fromTarget: Vec3
  toTarget: Vec3
  fromFov: number
  toFov: number
  durationSec: number
  elapsed: number
  easing: CameraEasing
  onComplete?: () => void
}

export class CameraController {
  private readonly THREE: ThreeModule
  private readonly camera: InstanceType<ThreeModule['PerspectiveCamera']>
  private readonly controls: OrbitControls
  private mode: CameraMode = 'free'
  private followId: CelestialBodyId | null = null
  private getBodyPosition: ((id: CelestialBodyId) => { x: number, y: number, z: number } | null) | null = null
  private anim: ActiveAnim | null = null
  private idleHandlers = new Set<() => void>()

  constructor(
    THREE: ThreeModule,
    camera: InstanceType<ThreeModule['PerspectiveCamera']>,
    controls: OrbitControls
  ) {
    this.THREE = THREE
    this.camera = camera
    this.controls = controls
  }

  get isAnimating(): boolean {
    return this.anim !== null
  }

  setBodyPositionGetter(
    getter: (id: CelestialBodyId) => { x: number, y: number, z: number } | null
  ): void {
    this.getBodyPosition = getter
  }

  setControlsEnabled(enabled: boolean): void {
    this.controls.enabled = enabled
  }

  onIdle(handler: () => void): () => void {
    this.idleHandlers.add(handler)
    return () => {
      this.idleHandlers.delete(handler)
    }
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
    this.animateTo({
      position: { x: cfg.position[0], y: cfg.position[1], z: cfg.position[2] },
      target: { x: cfg.target[0], y: cfg.target[1], z: cfg.target[2] },
      durationMs: 1000,
      easing: 'easeOut'
    })
  }

  cancelAnimation(): void {
    this.anim = null
  }

  /**
   * Smoothly animate camera to a keyframe. Never teleports.
   */
  animateTo(keyframe: CameraKeyframe, onComplete?: () => void): void {
    const resolved = this.resolveKeyframe(keyframe)
    const durationMs = Math.max(16, keyframe.durationMs)
    this.anim = {
      fromPos: {
        x: this.camera.position.x,
        y: this.camera.position.y,
        z: this.camera.position.z
      },
      toPos: resolved.position,
      fromTarget: {
        x: this.controls.target.x,
        y: this.controls.target.y,
        z: this.controls.target.z
      },
      toTarget: resolved.target,
      fromFov: this.camera.fov,
      toFov: resolved.fov,
      durationSec: durationMs / 1000,
      elapsed: 0,
      easing: keyframe.easing,
      onComplete
    }
  }

  update(dt: number): void {
    if (this.anim) {
      this.anim.elapsed += dt
      const tRaw = Math.min(1, this.anim.elapsed / this.anim.durationSec)
      const t = applyEasing(tRaw, this.anim.easing)
      this.camera.position.set(
        lerp(this.anim.fromPos.x, this.anim.toPos.x, t),
        lerp(this.anim.fromPos.y, this.anim.toPos.y, t),
        lerp(this.anim.fromPos.z, this.anim.toPos.z, t)
      )
      this.controls.target.set(
        lerp(this.anim.fromTarget.x, this.anim.toTarget.x, t),
        lerp(this.anim.fromTarget.y, this.anim.toTarget.y, t),
        lerp(this.anim.fromTarget.z, this.anim.toTarget.z, t)
      )
      if (this.anim.fromFov !== this.anim.toFov) {
        this.camera.fov = lerp(this.anim.fromFov, this.anim.toFov, t)
        this.camera.updateProjectionMatrix()
      }
      this.controls.update()
      if (tRaw >= 1) {
        const done = this.anim.onComplete
        this.anim = null
        done?.()
        for (const handler of this.idleHandlers) {
          handler()
        }
      }
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

  private resolveKeyframe(keyframe: CameraKeyframe): { position: Vec3, target: Vec3, fov: number } {
    const fov = keyframe.fov ?? this.camera.fov
    let target: Vec3 = keyframe.target ?? {
      x: this.controls.target.x,
      y: this.controls.target.y,
      z: this.controls.target.z
    }
    let position: Vec3 = keyframe.position ?? {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z
    }

    if (keyframe.relativeTo) {
      const focus = this.resolveFocus(keyframe.relativeTo)
      if (focus) {
        target = focus
        const distance = keyframe.distance ?? 8
        if (!keyframe.position) {
          position = {
            x: focus.x + distance * 0.6,
            y: focus.y + distance * 0.35,
            z: focus.z + distance * 0.7
          }
        }
      }
    }

    return { position, target, fov }
  }

  private resolveFocus(focus: FocusTarget): Vec3 | null {
    if (focus.kind === 'level-default') {
      return { x: 0, y: 0, z: 0 }
    }
    if (focus.kind === 'marker') {
      return { x: 0, y: 0.15, z: 0 }
    }
    if (focus.kind === 'body' && focus.id && this.getBodyPosition) {
      return this.getBodyPosition(focus.id)
    }
    return null
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function applyEasing(t: number, easing: CameraEasing): number {
  switch (easing) {
    case 'linear':
      return t
    case 'easeOut':
      return 1 - (1 - t) ** 3
    case 'easeInOut':
    default:
      return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2
  }
}

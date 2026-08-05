import type { CameraKeyframe } from '../../../types/journey'
import type {
  CameraMode,
  CelestialBodyId,
  OverlayFlags,
  UniverseLevel,
  UniverseSnapshot
} from '../../../types/universe'

export interface UniverseRenderer {
  mount: (canvas: HTMLCanvasElement) => Promise<void>
  setLevel: (level: UniverseLevel, options?: { animateCamera?: boolean }) => void
  setSnapshot: (snapshot: UniverseSnapshot) => void
  setOverlays: (flags: OverlayFlags) => void
  setCameraMode: (mode: CameraMode, bodyId?: CelestialBodyId | null) => void
  animateCamera: (keyframe: CameraKeyframe) => Promise<void>
  cancelCameraAnimation: () => void
  setControlsEnabled: (enabled: boolean) => void
  onCameraIdle: (handler: () => void) => () => void
  onSelectBody: (handler: (id: CelestialBodyId | null) => void) => void
  resize: (width: number, height: number) => void
  dispose: () => void
}

export type { CameraMode, CelestialBodyId, OverlayFlags, UniverseLevel, UniverseSnapshot }

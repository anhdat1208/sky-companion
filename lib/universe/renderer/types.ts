import type {
  CameraMode,
  CelestialBodyId,
  OverlayFlags,
  UniverseLevel,
  UniverseSnapshot
} from '../../../types/universe'

export interface UniverseRenderer {
  mount: (canvas: HTMLCanvasElement) => Promise<void>
  setLevel: (level: UniverseLevel) => void
  setSnapshot: (snapshot: UniverseSnapshot) => void
  setOverlays: (flags: OverlayFlags) => void
  setCameraMode: (mode: CameraMode, bodyId?: CelestialBodyId | null) => void
  onSelectBody: (handler: (id: CelestialBodyId | null) => void) => void
  resize: (width: number, height: number) => void
  dispose: () => void
}

export type { CameraMode, CelestialBodyId, OverlayFlags, UniverseLevel, UniverseSnapshot }

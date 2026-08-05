import type { CelestialBodyId, UniverseSnapshot } from '../../../../types/universe'
import { radiusKmToScene } from '../../scale'
import { BODY_COLORS } from '../materials'

type ThreeModule = typeof import('three')

export interface SceneContext {
  THREE: ThreeModule
  textures: Map<CelestialBodyId, InstanceType<ThreeModule['Texture']>>
}

export function createBodyMesh(
  ctx: SceneContext,
  id: CelestialBodyId,
  radiusKm: number
): InstanceType<ThreeModule['Mesh']> {
  const { THREE, textures } = ctx
  const radius = radiusKmToScene(radiusKm, id)
  const geometry = new THREE.SphereGeometry(radius, 48, 32)
  const map = textures.get(id)
  const color = (BODY_COLORS[id] as number | undefined) ?? 0xcccccc

  const material = id === 'sun'
    ? new THREE.MeshBasicMaterial({ color, map: map ?? null })
    : new THREE.MeshStandardMaterial({
        color: map ? 0xffffff : color,
        map: map ?? null,
        roughness: 0.85,
        metalness: 0.05
      })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = id
  mesh.userData.bodyId = id
  return mesh
}

export abstract class BaseLevelScene {
  readonly root: InstanceType<ThreeModule['Group']>
  protected readonly ctx: SceneContext
  protected readonly meshes = new Map<CelestialBodyId, InstanceType<ThreeModule['Object3D']>>()

  constructor(ctx: SceneContext) {
    this.ctx = ctx
    this.root = new ctx.THREE.Group()
  }

  abstract sync(snapshot: UniverseSnapshot): void

  getBodyPosition(id: CelestialBodyId): { x: number, y: number, z: number } | null {
    const mesh = this.meshes.get(id)
    if (!mesh) return null
    return { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z }
  }

  getTrackedForOverlays(): Array<{
    id: CelestialBodyId
    mesh: InstanceType<ThreeModule['Object3D']>
    orbitRadius: number
  }> {
    return []
  }

  getPickableObjects(): InstanceType<ThreeModule['Object3D']>[] {
    return [...this.meshes.values()]
  }

  dispose(): void {
    this.root.traverse((obj) => {
      const mesh = obj as InstanceType<ThreeModule['Mesh']>
      if (mesh.geometry) mesh.geometry.dispose()
      const material = mesh.material as
        | InstanceType<ThreeModule['Material']>
        | InstanceType<ThreeModule['Material']>[]
        | undefined
      if (Array.isArray(material)) {
        material.forEach((m) => m.dispose())
      } else {
        material?.dispose()
      }
    })
    this.meshes.clear()
    this.root.clear()
  }
}

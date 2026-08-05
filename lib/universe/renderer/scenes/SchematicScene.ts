import type { CelestialBodyId, UniverseLevel, UniverseSnapshot } from '../../../../types/universe'
import { BODY_COLORS } from '../materials'
import { BaseLevelScene, type SceneContext } from './BaseLevelScene'

interface SchematicConfig {
  points: Array<{ id: CelestialBodyId, x: number, y: number, z: number, size: number }>
  disk?: boolean
}

const SCHEMATIC: Record<5 | 6 | 7 | 8 | 9, SchematicConfig> = {
  5: {
    points: [
      { id: 'sun', x: 0, y: 0, z: 0, size: 1.2 },
      { id: 'alpha-centauri', x: 18, y: 2, z: -8, size: 0.9 },
      { id: 'sirius', x: -22, y: -3, z: 12, size: 1.1 },
      { id: 'betelgeuse', x: 30, y: 8, z: 20, size: 1.6 },
      { id: 'rigel', x: 28, y: -6, z: 24, size: 1.4 },
      { id: 'polaris', x: 5, y: 35, z: -10, size: 0.8 }
    ]
  },
  6: {
    disk: true,
    points: [
      { id: 'sun', x: 22, y: 0, z: 8, size: 0.6 },
      { id: 'galactic-center', x: 0, y: 0, z: 0, size: 2.2 },
      { id: 'orion-arm', x: 18, y: 1, z: 6, size: 1.2 },
      { id: 'milky-way', x: -10, y: 0, z: -12, size: 1 }
    ]
  },
  7: {
    points: [
      { id: 'milky-way', x: 0, y: 0, z: 0, size: 3 },
      { id: 'local-group', x: 20, y: 4, z: -15, size: 2 },
      { id: 'sun', x: 1, y: 0.2, z: 0.5, size: 0.35 }
    ]
  },
  8: {
    points: [
      { id: 'virgo-supercluster', x: 0, y: 0, z: 0, size: 4 },
      { id: 'local-group', x: 12, y: 2, z: 8, size: 1.5 },
      { id: 'sun', x: 12.4, y: 2.1, z: 8.2, size: 0.3 }
    ]
  },
  9: {
    points: [
      { id: 'observable-universe', x: 0, y: 0, z: 0, size: 8 },
      { id: 'virgo-supercluster', x: 5, y: 1, z: -3, size: 1.2 },
      { id: 'sun', x: 5.2, y: 1.05, z: -2.95, size: 0.25 }
    ]
  }
}

export class SchematicScene extends BaseLevelScene {
  constructor(ctx: SceneContext, level: Extract<UniverseLevel, 5 | 6 | 7 | 8 | 9>) {
    super(ctx)
    this.root.name = `schematic-${level}`
    const cfg = SCHEMATIC[level]
    const THREE = ctx.THREE

    if (cfg.disk) {
      const disk = new THREE.Mesh(
        new THREE.CircleGeometry(40, 64),
        new THREE.MeshBasicMaterial({
          color: 0x312e81,
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide
        })
      )
      disk.rotation.x = -Math.PI / 2
      this.root.add(disk)

      // Spiral arm hint
      const arm = new THREE.Mesh(
        new THREE.TorusGeometry(22, 3.5, 8, 64, Math.PI * 1.2),
        new THREE.MeshBasicMaterial({
          color: 0x6366f1,
          transparent: true,
          opacity: 0.35
        })
      )
      arm.rotation.x = Math.PI / 2
      this.root.add(arm)
    }

    for (const point of cfg.points) {
      const color = BODY_COLORS[point.id] ?? 0xffffff
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(point.size, 24, 16),
        new THREE.MeshBasicMaterial({ color })
      )
      mesh.position.set(point.x, point.y, point.z)
      mesh.name = point.id
      mesh.userData.bodyId = point.id
      this.root.add(mesh)
      this.meshes.set(point.id, mesh)
    }

    this.root.add(new THREE.AmbientLight(0xffffff, 0.8))
  }

  sync(_snapshot: UniverseSnapshot): void {
    // Schematic levels are static educational layouts.
  }

  override getTrackedForOverlays() {
    return [...this.meshes.entries()].map(([id, mesh]) => ({
      id,
      mesh,
      orbitRadius: 0
    }))
  }
}

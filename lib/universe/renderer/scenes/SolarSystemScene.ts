import type { UniverseSnapshot } from '../../../../types/universe'
import { BaseLevelScene, createBodyMesh, type SceneContext } from './BaseLevelScene'

export class SolarSystemScene extends BaseLevelScene {
  private saturnRing: InstanceType<SceneContext['THREE']['Mesh']> | null = null

  constructor(ctx: SceneContext) {
    super(ctx)
    this.root.name = 'solar-system'
  }

  sync(snapshot: UniverseSnapshot): void {
    for (const body of snapshot.bodies) {
      let mesh = this.meshes.get(body.id)
      if (!mesh) {
        mesh = createBodyMesh(this.ctx, body.id, body.radiusKm)
        this.root.add(mesh)
        this.meshes.set(body.id, mesh)

        if (body.id === 'saturn' && !this.saturnRing) {
          const THREE = this.ctx.THREE
          const ringGeo = new THREE.RingGeometry(1.6, 2.6, 64)
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0xc2b280,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.75
          })
          this.saturnRing = new THREE.Mesh(ringGeo, ringMat)
          this.saturnRing.rotation.x = Math.PI / 2.4
          mesh.add(this.saturnRing)
        }
      }
      mesh.position.set(body.position.x, body.position.y, body.position.z)
      if (body.id === 'earth') {
        mesh.rotation.y = body.rotationRad
      }
    }
  }

  override getTrackedForOverlays() {
    return [...this.meshes.entries()]
      .filter(([id]) => id !== 'moon')
      .map(([id, mesh]) => ({
        id,
        mesh,
        orbitRadius: id === 'sun' ? 0 : Math.hypot(mesh.position.x, mesh.position.z)
      }))
  }
}

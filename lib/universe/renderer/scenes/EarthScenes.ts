import type { UniverseSnapshot } from '../../../../types/universe'
import { radiusKmToScene } from '../../scale'
import { BaseLevelScene, createBodyMesh, type SceneContext } from './BaseLevelScene'

export class EarthScene extends BaseLevelScene {
  private userMarker: InstanceType<SceneContext['THREE']['Mesh']> | null = null
  private sunLight: InstanceType<SceneContext['THREE']['DirectionalLight']> | null = null

  constructor(ctx: SceneContext) {
    super(ctx)
    this.root.name = 'earth'
    const earth = createBodyMesh(ctx, 'earth', 6371)
    // Larger display Earth for close-up
    const scale = 3 / radiusKmToScene(6371, 'earth')
    earth.scale.setScalar(scale)
    this.root.add(earth)
    this.meshes.set('earth', earth)

    this.sunLight = new ctx.THREE.DirectionalLight(0xffffff, 1.35)
    this.root.add(this.sunLight)
    this.root.add(new ctx.THREE.AmbientLight(0x223355, 0.35))

    this.userMarker = new ctx.THREE.Mesh(
      new ctx.THREE.SphereGeometry(0.08, 16, 16),
      new ctx.THREE.MeshBasicMaterial({ color: 0xff3355 })
    )
    earth.add(this.userMarker)
  }

  sync(snapshot: UniverseSnapshot): void {
    const earth = this.meshes.get('earth')
    if (!earth) return
    const earthState = snapshot.bodies.find((b) => b.id === 'earth')
    if (earthState) {
      earth.rotation.y = earthState.rotationRad
    }
    if (this.sunLight && snapshot.earth) {
      const d = snapshot.earth.sunDirection
      this.sunLight.position.set(-d.x, -d.z, d.y).normalize().multiplyScalar(10)
    }
    if (this.userMarker && snapshot.earth) {
      placeOnSphere(this.userMarker, snapshot.earth.userLat, snapshot.earth.userLng, 3.05)
    }
  }
}

export class YouScene extends EarthScene {
  constructor(ctx: SceneContext) {
    super(ctx)
    this.root.name = 'you'
  }
}

export class EarthMoonScene extends BaseLevelScene {
  constructor(ctx: SceneContext) {
    super(ctx)
    this.root.name = 'earth-moon'
    const earth = createBodyMesh(ctx, 'earth', 6371)
    earth.scale.setScalar(2.5 / radiusKmToScene(6371, 'earth'))
    this.root.add(earth)
    this.meshes.set('earth', earth)

    const moon = createBodyMesh(ctx, 'moon', 1737.4)
    moon.scale.setScalar(0.9 / radiusKmToScene(1737.4, 'moon'))
    this.root.add(moon)
    this.meshes.set('moon', moon)

    this.root.add(new ctx.THREE.AmbientLight(0xffffff, 0.55))
    const light = new ctx.THREE.DirectionalLight(0xffffff, 1.1)
    light.position.set(8, 4, 2)
    this.root.add(light)
  }

  sync(snapshot: UniverseSnapshot): void {
    const earth = this.meshes.get('earth')
    const moon = this.meshes.get('moon')
    const earthState = snapshot.bodies.find((b) => b.id === 'earth')
    if (earth && earthState) {
      earth.rotation.y = earthState.rotationRad
    }
    if (moon && snapshot.moon) {
      // Place moon on XY plane circle using distance educational scale
      const dist = Math.max(6, Math.min(14, snapshot.moon.distanceKm / 40_000))
      const phase = snapshot.moon.phaseFraction
      const angle = phase * Math.PI * 2
      moon.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist)
    }
  }

  override getTrackedForOverlays() {
    return [...this.meshes.entries()].map(([id, mesh]) => ({
      id,
      mesh,
      orbitRadius: id === 'moon' ? Math.hypot(mesh.position.x, mesh.position.z) : 0
    }))
  }
}

function placeOnSphere(
  marker: { position: { set: (x: number, y: number, z: number) => void } },
  lat: number,
  lng: number,
  radius: number
): void {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  marker.position.set(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

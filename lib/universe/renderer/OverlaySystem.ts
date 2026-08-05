import type { CelestialBodyId, OverlayFlags } from '../../../types/universe'
import { BODY_COLORS } from './materials'

type ThreeModule = typeof import('three')

interface TrackedBody {
  id: CelestialBodyId
  mesh: InstanceType<ThreeModule['Object3D']>
  orbitRadius: number
}

export class OverlaySystem {
  private readonly THREE: ThreeModule
  private readonly root: InstanceType<ThreeModule['Group']>
  private readonly labelSprites = new Map<CelestialBodyId, InstanceType<ThreeModule['Sprite']>>()
  private readonly orbitLines = new Map<CelestialBodyId, InstanceType<ThreeModule['Line']>>()
  private readonly distanceSprites = new Map<CelestialBodyId, InstanceType<ThreeModule['Sprite']>>()
  private flags: OverlayFlags = { labels: true, orbits: true, distances: false }
  private tracked: TrackedBody[] = []

  constructor(THREE: ThreeModule, parent: InstanceType<ThreeModule['Object3D']>) {
    this.THREE = THREE
    this.root = new THREE.Group()
    this.root.name = 'overlays'
    parent.add(this.root)
  }

  setTracked(bodies: TrackedBody[]): void {
    this.clear()
    this.tracked = bodies
    for (const body of bodies) {
      this.labelSprites.set(body.id, this.createLabel(body.id))
      if (body.orbitRadius > 0) {
        this.orbitLines.set(body.id, this.createOrbit(body.orbitRadius, body.id))
      }
      this.distanceSprites.set(body.id, this.createDistanceLabel(body.id))
    }
    this.applyFlags()
  }

  setFlags(flags: OverlayFlags): void {
    this.flags = flags
    this.applyFlags()
  }

  update(auDistances: Map<CelestialBodyId, number>): void {
    for (const body of this.tracked) {
      const label = this.labelSprites.get(body.id)
      if (label) {
        label.position.copy(body.mesh.position)
        label.position.y += 1.5
      }
      const dist = this.distanceSprites.get(body.id)
      if (dist) {
        dist.position.copy(body.mesh.position)
        dist.position.y += 2.4
        const au = auDistances.get(body.id)
        if (au !== undefined && body.id !== 'sun' && body.id !== 'moon') {
          this.updateDistanceTexture(dist, `${au.toFixed(2)} AU`)
        }
      }
    }
  }

  dispose(): void {
    this.clear()
    this.root.removeFromParent()
  }

  private applyFlags(): void {
    for (const sprite of this.labelSprites.values()) {
      sprite.visible = this.flags.labels
    }
    for (const line of this.orbitLines.values()) {
      line.visible = this.flags.orbits
    }
    for (const sprite of this.distanceSprites.values()) {
      sprite.visible = this.flags.distances
    }
  }

  private clear(): void {
    for (const sprite of this.labelSprites.values()) {
      this.root.remove(sprite)
      sprite.material.map?.dispose()
      sprite.material.dispose()
    }
    for (const line of this.orbitLines.values()) {
      this.root.remove(line)
      line.geometry.dispose()
      ;(line.material as InstanceType<ThreeModule['Material']>).dispose()
    }
    for (const sprite of this.distanceSprites.values()) {
      this.root.remove(sprite)
      sprite.material.map?.dispose()
      sprite.material.dispose()
    }
    this.labelSprites.clear()
    this.orbitLines.clear()
    this.distanceSprites.clear()
  }

  private createLabel(id: CelestialBodyId): InstanceType<ThreeModule['Sprite']> {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.fillRect(0, 0, 256, 64)
    ctx.fillStyle = '#ffffff'
    ctx.font = '28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(id, 128, 40)
    const texture = new this.THREE.CanvasTexture(canvas)
    const material = new this.THREE.SpriteMaterial({ map: texture, transparent: true })
    const sprite = new this.THREE.Sprite(material)
    sprite.scale.set(6, 1.5, 1)
    this.root.add(sprite)
    return sprite
  }

  private createDistanceLabel(id: CelestialBodyId): InstanceType<ThreeModule['Sprite']> {
    const sprite = this.createLabel(id)
    sprite.scale.set(7, 1.6, 1)
    sprite.visible = false
    return sprite
  }

  private updateDistanceTexture(
    sprite: InstanceType<ThreeModule['Sprite']>,
    text: string
  ): void {
    const material = sprite.material as InstanceType<ThreeModule['SpriteMaterial']>
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.fillRect(0, 0, 256, 64)
    ctx.fillStyle = '#a5f3fc'
    ctx.font = '26px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(text, 128, 40)
    material.map?.dispose()
    material.map = new this.THREE.CanvasTexture(canvas)
    material.needsUpdate = true
  }

  private createOrbit(
    radius: number,
    id: CelestialBodyId
  ): InstanceType<ThreeModule['Line']> {
    const points: InstanceType<ThreeModule['Vector3']>[] = []
    const segments = 128
    for (let i = 0; i <= segments; i += 1) {
      const a = (i / segments) * Math.PI * 2
      points.push(new this.THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
    }
    const geometry = new this.THREE.BufferGeometry().setFromPoints(points)
    const color = BODY_COLORS[id] ?? 0x888888
    const material = new this.THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.35
    })
    const line = new this.THREE.Line(geometry, material)
    this.root.add(line)
    return line
  }
}

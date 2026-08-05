import type { CameraKeyframe } from '../../../types/journey'
import type {
  CameraMode,
  CelestialBodyId,
  OverlayFlags,
  UniverseLevel,
  UniverseSnapshot
} from '../../../types/universe'
import { CameraController } from './CameraController'
import { LevelController } from './LevelController'
import { loadBodyTextures } from './loadTextures'
import { OverlaySystem } from './OverlaySystem'
import type { UniverseRenderer } from './types'

const AU_KM = 149_597_870.7

export async function createUniverseRenderer(): Promise<UniverseRenderer> {
  const THREE = await import('three')
  const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

  let renderer: InstanceType<typeof THREE.WebGLRenderer> | null = null
  let scene: InstanceType<typeof THREE.Scene> | null = null
  let camera: InstanceType<typeof THREE.PerspectiveCamera> | null = null
  let controls: InstanceType<typeof OrbitControls> | null = null
  let cameraController: CameraController | null = null
  let levelController: LevelController | null = null
  let overlays: OverlaySystem | null = null
  let raf = 0
  let lastTs = 0
  let snapshot: UniverseSnapshot | null = null
  let selectHandler: ((id: CelestialBodyId | null) => void) | null = null
  let disposed = false
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()

  function onPointerDown(event: PointerEvent): void {
    if (!renderer || !camera || !levelController?.current) return
    const rect = renderer.domElement.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
    const meshes = levelController.current.getPickableObjects()
    const hits = raycaster.intersectObjects(meshes, true)
    const hit = hits[0]
    if (!hit) {
      selectHandler?.(null)
      return
    }
    let obj: InstanceType<typeof THREE.Object3D> | null = hit.object
    while (obj) {
      const id = obj.userData.bodyId as CelestialBodyId | undefined
      if (id) {
        selectHandler?.(id)
        return
      }
      obj = obj.parent
    }
  }

  function frame(ts: number): void {
    if (disposed || !renderer || !scene || !camera || !controls) return
    const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016
    lastTs = ts
    cameraController?.update(dt)
    if (snapshot && levelController?.current && overlays) {
      const distances = new Map<CelestialBodyId, number>()
      for (const body of snapshot.bodies) {
        const r = Math.hypot(body.positionKm.x, body.positionKm.y, body.positionKm.z)
        distances.set(body.id, r / AU_KM)
      }
      overlays.update(distances)
    }
    controls.update()
    renderer.render(scene, camera)
    raf = requestAnimationFrame(frame)
  }

  return {
    async mount(canvas: HTMLCanvasElement) {
      disposed = false
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      })
      const parent = canvas.parentElement
      const width = Math.max(parent?.clientWidth || canvas.clientWidth || 800, 2)
      const height = Math.max(parent?.clientHeight || canvas.clientHeight || 600, 2)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(width, height, false)
      renderer.outputColorSpace = THREE.SRGBColorSpace

      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x030712)

      // Starfield
      const starGeo = new THREE.BufferGeometry()
      const starCount = 2000
      const positions = new Float32Array(starCount * 3)
      for (let i = 0; i < starCount * 3; i += 1) {
        positions[i] = (Math.random() - 0.5) * 2000
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      scene.add(new THREE.Points(
        starGeo,
        new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, sizeAttenuation: true })
      ))

      camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 5000)
      camera.position.set(0, 80, 180)

      controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true
      controls.dampingFactor = 0.08
      controls.minDistance = 1.5
      controls.maxDistance = 800

      cameraController = new CameraController(THREE, camera, controls)

      const textures = await loadBodyTextures(THREE)
      const ctx = { THREE, textures }
      levelController = new LevelController(ctx, scene)
      overlays = new OverlaySystem(THREE, scene)

      scene.add(new THREE.AmbientLight(0xffffff, 0.65))
      const sunLight = new THREE.PointLight(0xfff2cc, 3.0, 0, 0)
      sunLight.position.set(0, 0, 0)
      scene.add(sunLight)

      levelController.setLevel(4, snapshot)
      cameraController.beginLevelTransition(4)
      cameraController.setBodyPositionGetter((id) => levelController?.current?.getBodyPosition(id) ?? null)

      const tracked = levelController.current?.getTrackedForOverlays() ?? []
      overlays.setTracked(tracked)

      canvas.addEventListener('pointerdown', onPointerDown)
      raf = requestAnimationFrame(frame)
    },

    setLevel(level: UniverseLevel, options?: { animateCamera?: boolean }) {
      if (!levelController || !cameraController || !overlays) return
      levelController.setLevel(level, snapshot)
      if (options?.animateCamera !== false) {
        cameraController.beginLevelTransition(level)
      }
      overlays.setTracked(levelController.current?.getTrackedForOverlays() ?? [])
    },

    setSnapshot(next: UniverseSnapshot) {
      snapshot = next
      levelController?.sync(next)
      if (levelController?.current && overlays) {
        // Refresh orbit radii when bodies move significantly at solar level
        if (levelController.currentLevel === 4) {
          overlays.setTracked(levelController.current.getTrackedForOverlays())
        }
      }
    },

    setOverlays(flags: OverlayFlags) {
      overlays?.setFlags(flags)
    },

    setCameraMode(mode: CameraMode, bodyId?: CelestialBodyId | null) {
      cameraController?.setMode(mode, bodyId)
    },

    animateCamera(keyframe: CameraKeyframe) {
      return new Promise<void>((resolve) => {
        if (!cameraController) {
          resolve()
          return
        }
        cameraController.animateTo(keyframe, () => resolve())
      })
    },

    cancelCameraAnimation() {
      cameraController?.cancelAnimation()
    },

    setControlsEnabled(enabled: boolean) {
      cameraController?.setControlsEnabled(enabled)
    },

    onCameraIdle(handler: () => void) {
      if (!cameraController) {
        return () => {}
      }
      return cameraController.onIdle(handler)
    },

    onSelectBody(handler: (id: CelestialBodyId | null) => void) {
      selectHandler = handler
    },

    resize(width: number, height: number) {
      if (!renderer || !camera) return
      const w = Math.max(1, width)
      const h = Math.max(1, height)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    },

    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      renderer?.domElement.removeEventListener('pointerdown', onPointerDown)
      levelController?.dispose()
      overlays?.dispose()
      controls?.dispose()
      renderer?.dispose()
      renderer = null
      scene = null
      camera = null
      controls = null
      cameraController = null
      levelController = null
      overlays = null
      selectHandler = null
      snapshot = null
    }
  }
}

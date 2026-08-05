import type { CelestialBodyId } from '../../../types/universe'
import { TEXTURE_PATHS } from './materials'

type ThreeModule = typeof import('three')

async function textureExists(path: string): Promise<boolean> {
  try {
    const response = await fetch(path, { method: 'HEAD' })
    if (response.ok) return true
    // Some hosts disallow HEAD — try a tiny ranged GET only when HEAD fails oddly
    if (response.status === 405 || response.status === 501) {
      const get = await fetch(path, { method: 'GET' })
      return get.ok
    }
    return false
  } catch {
    return false
  }
}

export async function loadBodyTextures(
  THREE: ThreeModule
): Promise<Map<CelestialBodyId, InstanceType<ThreeModule['Texture']>>> {
  const loader = new THREE.TextureLoader()
  const map = new Map<CelestialBodyId, InstanceType<ThreeModule['Texture']>>()

  await Promise.all(
    (Object.entries(TEXTURE_PATHS) as Array<[CelestialBodyId, string]>).map(
      async ([id, path]) => {
        if (!(await textureExists(path))) {
          return
        }
        try {
          const texture = await loader.loadAsync(path)
          texture.colorSpace = THREE.SRGBColorSpace
          map.set(id, texture)
        } catch {
          // Colored fallback materials handle missing / invalid files.
        }
      }
    )
  )

  return map
}

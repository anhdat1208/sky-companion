import type { CelestialBodyId } from '../../../types/universe'
import { TEXTURE_PATHS } from './materials'

type ThreeModule = typeof import('three')

export async function loadBodyTextures(
  THREE: ThreeModule
): Promise<Map<CelestialBodyId, InstanceType<ThreeModule['Texture']>>> {
  const loader = new THREE.TextureLoader()
  const map = new Map<CelestialBodyId, InstanceType<ThreeModule['Texture']>>()

  await Promise.all(
    (Object.entries(TEXTURE_PATHS) as Array<[CelestialBodyId, string]>).map(
      async ([id, path]) => {
        try {
          const texture = await loader.loadAsync(path)
          texture.colorSpace = THREE.SRGBColorSpace
          map.set(id, texture)
        } catch {
          // Colored fallback materials handle missing files.
        }
      }
    )
  )

  return map
}

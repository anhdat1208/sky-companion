import type { CelestialBodyId } from '../../../types/universe'

export const BODY_COLORS: Partial<Record<CelestialBodyId, number>> = {
  sun: 0xffcc33,
  mercury: 0xb1b1b1,
  venus: 0xe8cda0,
  earth: 0x2b6cb0,
  moon: 0xcfd3d8,
  mars: 0xc1440e,
  jupiter: 0xd9a066,
  saturn: 0xe6d5a8,
  uranus: 0x7fdbda,
  neptune: 0x4169e1,
  'alpha-centauri': 0xffe4b5,
  sirius: 0xaaccff,
  betelgeuse: 0xff6633,
  rigel: 0x99ccff,
  polaris: 0xffffff,
  'milky-way': 0xddd6fe,
  'galactic-center': 0xffaa44,
  'orion-arm': 0x93c5fd,
  'local-group': 0xc4b5fd,
  'virgo-supercluster': 0xa78bfa,
  'observable-universe': 0x818cf8
}

export const TEXTURE_PATHS: Partial<Record<CelestialBodyId, string>> = {
  sun: '/universe/textures/sun.jpg',
  earth: '/universe/textures/earth.jpg',
  moon: '/universe/textures/moon.jpg',
  mars: '/universe/textures/mars.jpg',
  jupiter: '/universe/textures/jupiter.jpg',
  saturn: '/universe/textures/saturn.jpg'
}

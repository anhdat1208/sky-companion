# Texture attribution

Place optional JPEG/PNG maps in this folder. The renderer loads:

- `sun.jpg`
- `earth.jpg`
- `moon.jpg`
- `mars.jpg`
- `jupiter.jpg`
- `saturn.jpg`

Recommended public-domain / NASA sources:

- [NASA Solar System Treks](https://trek.nasa.gov/)
- [Solar System Scope media (check license)](https://www.solarsystemscope.com/textures/)
- [NASA Visible Earth](https://visibleearth.nasa.gov/)

If a file is missing, leave `TEXTURE_PATHS` empty in
`lib/universe/renderer/materials.ts` (default) so the explorer uses solid
colors without console 404s. When you add maps here, uncomment the matching
entries in `TEXTURE_PATHS`.

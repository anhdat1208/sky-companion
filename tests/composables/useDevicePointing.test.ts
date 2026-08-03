import { describe, expect, it, vi, afterEach } from 'vitest'
import { useDevicePointing } from '../../app/composables/useDevicePointing'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useDevicePointing', () => {
  it('starts in manual mode with default pointing', () => {
    const api = useDevicePointing()
    expect(api.pointing.value.source).toBe('manual')
    expect(api.pointing.value.altitude).toBe(30)
    expect(api.pointing.value.azimuth).toBe(0)
  })

  it('updates manual pointing', () => {
    const api = useDevicePointing()
    api.setManualPointing({ azimuth: 120, altitude: 45 })
    expect(api.pointing.value).toMatchObject({
      azimuth: 120,
      altitude: 45,
      source: 'manual'
    })
  })

  it('falls back to manual when DeviceOrientation is unavailable', async () => {
    vi.stubGlobal('window', { DeviceOrientationEvent: undefined })
    const api = useDevicePointing()
    await api.enableSensor()
    expect(api.pointing.value.source).toBe('manual')
    expect(api.sensorError.value).not.toBeNull()
  })

  it('clears sensor source on permission denial while keeping az/alt', async () => {
    vi.stubGlobal('window', {
      DeviceOrientationEvent: class {
        static requestPermission = vi.fn().mockResolvedValue('denied')
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    })
    const api = useDevicePointing()
    api.pointing.value = { azimuth: 90, altitude: 45, source: 'sensor' }
    await api.enableSensor()
    expect(api.pointing.value).toMatchObject({
      azimuth: 90,
      altitude: 45,
      source: 'manual'
    })
    expect(api.mode.value).toBe('manual')
    expect(api.sensorError.value).not.toBeNull()
  })
})

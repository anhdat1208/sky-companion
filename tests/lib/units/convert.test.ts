import { describe, expect, it } from 'vitest'
import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  kmhToMph,
  kmToMiles,
  milesToKm,
  mphToKmh
} from '../../../lib/units/convert'

describe('unit conversions', () => {
  it('converts kilometers and miles', () => {
    expect(kmToMiles(1)).toBeCloseTo(0.621371, 5)
    expect(milesToKm(1)).toBeCloseTo(1.609344, 5)
  })

  it('converts celsius and fahrenheit', () => {
    expect(celsiusToFahrenheit(0)).toBe(32)
    expect(celsiusToFahrenheit(100)).toBe(212)
    expect(fahrenheitToCelsius(32)).toBe(0)
  })

  it('converts km/h and mph', () => {
    expect(kmhToMph(100)).toBeCloseTo(62.1371, 4)
    expect(mphToKmh(60)).toBeCloseTo(96.5606, 4)
  })
})

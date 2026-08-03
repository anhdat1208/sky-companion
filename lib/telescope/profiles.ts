// lib/telescope/profiles.ts
import type {
  Eyepiece,
  FieldOfView,
  Magnification,
  Telescope,
  TelescopeProfile
} from '../../types/telescope'

export function computeMagnification(
  telescope: Telescope,
  eyepiece: Eyepiece
): Magnification {
  return {
    value: Math.round(telescope.focalLengthMm / eyepiece.focalLengthMm)
  }
}

export function computeTrueFov(
  eyepiece: Eyepiece,
  magnification: Magnification
): FieldOfView {
  return {
    trueFovDeg: eyepiece.apparentFovDeg / magnification.value
  }
}

export function lockThresholdDeg(trueFovDeg: number): number {
  const raw = trueFovDeg * 0.25
  return Math.min(2, Math.max(0.5, raw))
}

export function getMockProfiles(): TelescopeProfile[] {
  const reflector: Telescope = {
    id: 'newton-130-650',
    name: 'Newtonian 130/650',
    apertureMm: 130,
    focalLengthMm: 650,
    type: 'reflector'
  }

  const ep25: Eyepiece = {
    id: 'ep-25',
    name: '25mm Plössl',
    focalLengthMm: 25,
    apparentFovDeg: 50
  }

  const ep10: Eyepiece = {
    id: 'ep-10',
    name: '10mm Plössl',
    focalLengthMm: 10,
    apparentFovDeg: 50
  }

  const mag25 = computeMagnification(reflector, ep25)
  const mag10 = computeMagnification(reflector, ep10)

  const binoculars: Telescope = {
    id: 'bino-10x50',
    name: 'Binoculars 10×50',
    apertureMm: 50,
    focalLengthMm: 500,
    type: 'binocular'
  }

  return [
    {
      id: 'bino-10x50',
      label: 'Ống nhòm 10×50',
      telescope: binoculars,
      eyepiece: null,
      magnification: { value: 10 },
      fieldOfView: { trueFovDeg: 6.5 }
    },
    {
      id: 'newton-25',
      label: 'Newtonian 130/650 + 25mm',
      telescope: reflector,
      eyepiece: ep25,
      magnification: mag25,
      fieldOfView: computeTrueFov(ep25, mag25)
    },
    {
      id: 'newton-10',
      label: 'Newtonian 130/650 + 10mm',
      telescope: reflector,
      eyepiece: ep10,
      magnification: mag10,
      fieldOfView: computeTrueFov(ep10, mag10)
    }
  ]
}

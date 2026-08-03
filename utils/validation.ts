import { z } from 'zod'

const queryNumber = z.union([
  z.number(),
  z.string().trim().min(1)
]).pipe(z.coerce.number())

export const skyQuerySchema = z.object({
  lat: queryNumber.pipe(z.number().min(-90).max(90)),
  lng: queryNumber.pipe(z.number().min(-180).max(180)),
  time: z.iso.datetime().optional()
})

export type SkyQuery = z.infer<typeof skyQuerySchema>

/** Optional observer coords for ISS; lat and lng must both be present or both absent. */
export const issQuerySchema = z.object({
  lat: queryNumber.pipe(z.number().min(-90).max(90)).optional(),
  lng: queryNumber.pipe(z.number().min(-180).max(180)).optional()
}).superRefine((value, ctx) => {
  const hasLat = value.lat !== undefined
  const hasLng = value.lng !== undefined
  if (hasLat !== hasLng) {
    ctx.addIssue({
      code: 'custom',
      message: 'lat and lng must be provided together.'
    })
  }
})

export type IssQuery = z.infer<typeof issQuerySchema>

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

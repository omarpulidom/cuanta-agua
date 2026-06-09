import { z } from 'zod'

export const CorrelacionRowSchema = z.object({
  anio: z.number().int(),
  bimestre: z.number().int(),
  total_agua: z.number(),
  temp_promedio: z.number(),
  dias_ola_calor: z.number().int(),
  dias_frio: z.number().int(),
  total_lluvia: z.number(),
})

export type CorrelacionRow = z.infer<typeof CorrelacionRowSchema>

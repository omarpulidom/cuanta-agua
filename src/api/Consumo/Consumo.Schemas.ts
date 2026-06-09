import { z } from 'zod'

export const IndiceDesBackendSchema = z.enum(['ALTO', 'MEDIO', 'BAJO', 'POPULAR'])

export const ConsumoRowSchema = z.object({
  anio: z.number().int(),
  bimestre: z.number().int(),
  fecha: z.string().nullable().optional(),
  alcaldia: z.string(),
  colonia: z.string().nullable().optional(),
  indice_des: IndiceDesBackendSchema.nullable().optional(),
  consumo_total: z.number(),
  consumo_prom: z.number(),
  consumo_total_dom: z.number(),
  consumo_prom_dom: z.number(),
  consumo_total_mixto: z.number(),
  consumo_total_no_dom: z.number(),
})

export type ConsumoRow = z.infer<typeof ConsumoRowSchema>

export const ConsumoListResponseSchema = z.object({
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
  data: z.array(ConsumoRowSchema),
})

export const ConsumoAlcaldiaSchema = z.object({
  alcaldia: z.string(),
  consumo_total: z.number(),
  consumo_prom: z.number(),
  consumo_total_dom: z.number(),
  consumo_prom_dom: z.number(),
  consumo_total_mixto: z.number(),
  consumo_prom_mixto: z.number(),
  consumo_total_no_dom: z.number(),
  consumo_prom_no_dom: z.number(),
  num_colonias: z.number().int(),
  num_registros: z.number().int(),
  anio_min: z.number().int().nullable(),
  anio_max: z.number().int().nullable(),
  sin_datos: z.boolean().optional(),
})

export type ConsumoAlcaldia = z.infer<typeof ConsumoAlcaldiaSchema>

export const ConsumoResumenRowSchema = z.object({
  alcaldia: z.string(),
  colonia: z.string().nullable().optional(),
  total_agua: z.number(),
  promedio: z.number(),
})

export const TopConsumoRowSchema = z.object({
  colonia: z.string(),
  alcaldia: z.string(),
  total_agua: z.number(),
})

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
export type TopConsumoRow = z.infer<typeof TopConsumoRowSchema>
export type ConsumoResumenRow = z.infer<typeof ConsumoResumenRowSchema>

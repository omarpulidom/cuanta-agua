import { z } from 'zod'
import { generateClima, type ClimaRow } from '@/lib/mockData'
import type { Bimestre } from '@/lib/bimestre'

export const ClimaRowSchema = z.object({
  id_fact_clima: z.number(),
  id_tiempo: z.number(),
  alcaldia: z.string(),
  temp_maxima: z.number(),
  temp_minima: z.number(),
  temp_promedio: z.number(),
  humedad_promedio: z.number(),
  lluvia_total: z.number(),
})

export { type ClimaRow }

export class ClimaService {
  static getClima(alcaldia: string, bimestre: Bimestre, anio: number): ClimaRow {
    return generateClima(alcaldia, bimestre, anio)
  }
}

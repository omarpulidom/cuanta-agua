import { z } from 'zod'

export const IndiceDesSchema = z.enum(['ALTO', 'MEDIO', 'BAJO', 'POPULAR'])

export type IndiceDes = z.infer<typeof IndiceDesSchema>

export const IndiceDesRowSchema = z.object({
  id_indice_des: z.number().int(),
  indice_des: IndiceDesSchema,
})

export type IndiceDesRow = z.infer<typeof IndiceDesRowSchema>

export const INDICE_DES_LABELS: Record<IndiceDes, string> = {
  ALTO: 'Alto',
  MEDIO: 'Medio',
  BAJO: 'Bajo',
  POPULAR: 'Popular',
}

export const INDICE_DES_COLORS: Record<IndiceDes, string> = {
  ALTO: '#3b82f6',
  MEDIO: '#06b6d4',
  BAJO: '#f59e0b',
  POPULAR: '#ef4444',
}

export const INDICE_DES_VALUES: IndiceDes[] = ['ALTO', 'MEDIO', 'BAJO', 'POPULAR']

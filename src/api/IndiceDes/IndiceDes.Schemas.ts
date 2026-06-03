import { z } from 'zod'
import {
  INDICE_DES_COLORS,
  INDICE_DES_LABELS,
  INDICE_DES_VALUES,
  type IndiceDes,
  pickIndiceDes,
} from '@/lib/mockData'

export const IndiceDesSchema = z.enum(['ALTO', 'MEDIO', 'BAJO', 'POPULAR'])

export { INDICE_DES_COLORS, INDICE_DES_LABELS, INDICE_DES_VALUES, type IndiceDes, pickIndiceDes }

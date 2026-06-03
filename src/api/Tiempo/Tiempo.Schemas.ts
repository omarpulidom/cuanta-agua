import { z } from 'zod'
import {
  BIMESTRE_LABELS,
  type Bimestre,
  getAniosDisponibles,
  getBimestreRange,
  getCurrentBimestre,
} from '@/lib/bimestre'

export const BimestreSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
])

export const TiempoKeySchema = z.object({
  bimestre: BimestreSchema,
  anio: z.number().int().min(2000).max(2100),
})

export type TiempoKey = z.infer<typeof TiempoKeySchema>

export class TiempoService {
  static getCurrent(): TiempoKey {
    return getCurrentBimestre()
  }

  static getBimestresDelAnio(anio: number): Bimestre[] {
    return getBimestreRange(anio)
  }

  static getAnios(): number[] {
    return getAniosDisponibles()
  }

  static formatBimestre(b: Bimestre): string {
    return BIMESTRE_LABELS[b]
  }
}

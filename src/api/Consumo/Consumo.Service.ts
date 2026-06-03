import {
  generateConsumo,
  generateSources,
  generateTrend,
  getDisponibilidadIndex,
  getDisponibilidadStatus,
  type ConsumoRow,
  type DisponibilidadStatus,
} from '@/lib/mockData'
import type { Bimestre } from '@/lib/bimestre'

export type ConsumoCompleto = ConsumoRow & {
  sources: ReturnType<typeof generateSources>
  trend: number[]
  status: DisponibilidadStatus
  disponibilidadIndex: number
}

export class ConsumoService {
  static getConsumo(
    codigo_id: string,
    bimestre: Bimestre,
    anio: number,
  ): ConsumoCompleto {
    const row = generateConsumo(codigo_id, bimestre, anio)
    const sources = generateSources(codigo_id)
    const trend = generateTrend(codigo_id, bimestre, anio)
    const status = getDisponibilidadStatus(row.consumo_total)
    const disponibilidadIndex = getDisponibilidadIndex(row.consumo_total)
    return { ...row, sources, trend, status, disponibilidadIndex }
  }

  static getTrend(
    codigo_id: string,
    bimestre: Bimestre,
    anio: number,
  ): number[] {
    return generateTrend(codigo_id, bimestre, anio)
  }
}

import type { IndiceDes } from '@/api/IndiceDes/IndiceDes.Schemas'

export {
  INDICE_DES_COLORS,
  INDICE_DES_LABELS,
  INDICE_DES_VALUES,
  type IndiceDes,
} from '@/api/IndiceDes/IndiceDes.Schemas'

export type DisponibilidadStatus = 'ok' | 'warn' | 'alert'

export function getDisponibilidadStatus(consumo_total: number): DisponibilidadStatus {
  if (consumo_total <= 0) return 'ok'
  if (consumo_total < 1_200_000) return 'ok'
  if (consumo_total < 9_000_000) return 'warn'
  return 'alert'
}

export function getDisponibilidadIndex(consumo_total: number): number {
  if (consumo_total <= 0) return 100
  // map [0, 20M] to [100, 20]
  const max = 20_000_000
  const ratio = Math.min(1, consumo_total / max)
  return Math.max(20, Math.min(100, Math.round(100 - ratio * 80)))
}

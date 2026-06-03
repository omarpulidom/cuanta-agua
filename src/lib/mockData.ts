import type { Bimestre } from './bimestre'
import { getBimestreId } from './bimestre'

export type IndiceDes = 'ALTO' | 'MEDIO' | 'BAJO' | 'POPULAR'

export const INDICE_DES_VALUES: IndiceDes[] = ['ALTO', 'MEDIO', 'BAJO', 'POPULAR']

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

function hash32(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function rngFromHash(seed: number) {
  let s = seed || 1
  return () => {
    s = Math.imul(48271, s) % 0x7fffffff
    return s / 0x7fffffff
  }
}

function inRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min)
}

export type ConsumoRow = {
  id_fact: number
  id_tiempo: number
  id_ubicacion: number
  id_indice_des: number
  consumo_total: number
  consumo_prom: number
  consumo_total_dom: number
  consumo_prom_dom: number
  consumo_total_no_dom: number
  consumo_prom_no_dom: number
  consumo_total_mixto: number
  consumo_prom_mixto: number
  indice_des: IndiceDes
}

export type ClimaRow = {
  id_fact_clima: number
  id_tiempo: number
  alcaldia: string
  temp_maxima: number
  temp_minima: number
  temp_promedio: number
  humedad_promedio: number
  lluvia_total: number
}

export function pickIndiceDes(codigo_id: string): IndiceDes {
  const seed = hash32(`indice::${codigo_id}`)
  const r = (seed % 100) / 100
  if (r < 0.15) return 'ALTO'
  if (r < 0.5) return 'MEDIO'
  if (r < 0.85) return 'BAJO'
  return 'POPULAR'
}

export function generateConsumo(
  codigo_id: string,
  bimestre: Bimestre,
  anio: number,
  indice_des?: IndiceDes,
): ConsumoRow {
  const id_indice_des = indice_des ?? pickIndiceDes(codigo_id)
  const id_tiempo = getBimestreId(bimestre, anio)
  const id_ubicacion = hash32(codigo_id) % 1_000_000

  const seed = hash32(`consumo::${codigo_id}::${id_tiempo}::${id_indice_des}`)
  const rng = rngFromHash(seed)

  const factorPorIndice: Record<IndiceDes, number> = {
    ALTO: 1.6,
    MEDIO: 1.0,
    BAJO: 0.7,
    POPULAR: 0.55,
  }
  const factor = factorPorIndice[id_indice_des]

  const factorBimestral: Record<Bimestre, number> = {
    1: 0.85,
    2: 1.05,
    3: 1.25,
    4: 1.35,
    5: 1.15,
    6: 0.95,
  }
  const fb = factorBimestral[bimestre]

  const consumo_total_base = inRange(rng, 800, 2200) * factor * fb
  const consumo_total = Math.round(consumo_total_base)
  const consumo_prom = Math.round((consumo_total / 60) * 10) / 10

  const domPct = 0.55 + rng() * 0.15
  const noDomPct = 0.18 + rng() * 0.12
  const mixtoPct = 1 - domPct - noDomPct

  const consumo_total_dom = Math.round(consumo_total * domPct)
  const consumo_prom_dom = Math.round((consumo_total_dom / 60) * 10) / 10
  const consumo_total_no_dom = Math.round(consumo_total * noDomPct)
  const consumo_prom_no_dom = Math.round((consumo_total_no_dom / 60) * 10) / 10
  const consumo_total_mixto = Math.round(consumo_total * mixtoPct)
  const consumo_prom_mixto = Math.round((consumo_total_mixto / 60) * 10) / 10

  return {
    id_fact: hash32(`fact::${codigo_id}::${id_tiempo}`),
    id_tiempo,
    id_ubicacion,
    id_indice_des: ['ALTO', 'MEDIO', 'BAJO', 'POPULAR'].indexOf(id_indice_des) + 1,
    consumo_total,
    consumo_prom,
    consumo_total_dom,
    consumo_prom_dom,
    consumo_total_no_dom,
    consumo_prom_no_dom,
    consumo_total_mixto,
    consumo_prom_mixto,
    indice_des: id_indice_des,
  }
}

export function generateClima(alcaldia: string, bimestre: Bimestre, anio: number): ClimaRow {
  const id_tiempo = getBimestreId(bimestre, anio)
  const seed = hash32(`clima::${alcaldia.toLowerCase()}::${id_tiempo}`)
  const rng = rngFromHash(seed)

  const baseTemp: Record<Bimestre, number> = {
    1: 14,
    2: 19,
    3: 21,
    4: 19,
    5: 18,
    6: 15,
  }
  const base = baseTemp[bimestre]
  const temp_promedio = Math.round((base + inRange(rng, -2, 2)) * 10) / 10
  const temp_maxima = Math.round((temp_promedio + 5 + rng() * 3) * 10) / 10
  const temp_minima = Math.round((temp_promedio - 5 - rng() * 2) * 10) / 10
  const humedad_promedio = Math.round(inRange(rng, 35, 80))
  const lluviaTotalBase: Record<Bimestre, number> = {
    1: 25,
    2: 50,
    3: 130,
    4: 180,
    5: 110,
    6: 30,
  }
  const lluvia_total = Math.round(lluviaTotalBase[bimestre] * inRange(rng, 0.7, 1.3))

  return {
    id_fact_clima: hash32(`clima_fact::${alcaldia}::${id_tiempo}`),
    id_tiempo,
    alcaldia,
    temp_maxima,
    temp_minima,
    temp_promedio,
    humedad_promedio,
    lluvia_total,
  }
}

export function generateTrend(codigo_id: string, bimestre: Bimestre, anio: number, points = 6): number[] {
  const seed = hash32(`trend::${codigo_id}::${anio}::${bimestre}`)
  const rng = rngFromHash(seed)
  const base = 300 + rng() * 400
  const trend: number[] = []
  for (let i = 0; i < points; i++) {
    trend.push(Math.round(base + (rng() - 0.5) * 150 + i * 8))
  }
  return trend
}

export function generateSources(codigo_id: string) {
  const seed = hash32(`sources::${codigo_id}`)
  const rng = rngFromHash(seed)
  const potable = Math.round(45 + rng() * 35)
  const residual = Math.round(5 + rng() * 15)
  const rain = Math.round(2 + rng() * 18)
  const recycled = Math.max(0, 100 - potable - residual - rain)
  return {
    potable,
    residual,
    rain,
    recycled,
  }
}

export type DisponibilidadStatus = 'ok' | 'warn' | 'alert'

export function getDisponibilidadStatus(consumo_total: number): DisponibilidadStatus {
  if (consumo_total < 1200) return 'ok'
  if (consumo_total < 1800) return 'warn'
  return 'alert'
}

export function getDisponibilidadIndex(consumo_total: number): number {
  return Math.max(20, Math.min(100, Math.round(100 - (consumo_total / 22))))
}

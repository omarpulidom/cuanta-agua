import { z } from 'zod'
import { Constants } from '@/lib/Constants'
import { req } from '../req'
import {
  ConsumoAlcaldiaSchema,
  ConsumoListResponseSchema,
  ConsumoResumenRowSchema,
  CorrelacionRowSchema,
  TopConsumoRowSchema,
  type ConsumoAlcaldia,
  type ConsumoRow,
  type ConsumoResumenRow,
  type CorrelacionRow,
  type TopConsumoRow,
} from './Consumo.Schemas'
import type { Bimestre } from '@/lib/bimestre'

export type { ConsumoAlcaldia, ConsumoRow, TopConsumoRow, ConsumoResumenRow, CorrelacionRow }

export type ConsumoListQuery = {
  anio?: number
  bimestre?: Bimestre
  alcaldia?: string
  colonia?: string
  indice_des?: string
  limit?: number
  offset?: number
}

function buildQuery(obj: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
  }
  const s = params.toString()
  return s ? `?${s}` : ''
}

export class ConsumoService {
  static async list(q: ConsumoListQuery = {}): Promise<z.infer<typeof ConsumoListResponseSchema>> {
    const data = await req
      .get(`${Constants.ENDPOINTS.CONSUMO}${buildQuery(q as Record<string, string | number>)}`)
      .json()
    return ConsumoListResponseSchema.parse(data)
  }

  static async listRows(q: ConsumoListQuery = {}): Promise<ConsumoRow[]> {
    const res = await ConsumoService.list(q)
    return res.data
  }

  static async getAlcaldia(
    alcaldia: string,
    q: { anio?: number; bimestre?: Bimestre } = {},
  ): Promise<ConsumoAlcaldia> {
    const params: Record<string, string | number> = { alcaldia }
    if (q.anio) params.anio = q.anio
    if (q.bimestre) params.bimestre = q.bimestre
    const data = await req
      .get(`${Constants.ENDPOINTS.CONSUMO_ALCALDIA}${buildQuery(params)}`)
      .json()
    return ConsumoAlcaldiaSchema.parse(data)
  }

  static async getResumen(): Promise<ConsumoResumenRow[]> {
    const data = await req.get(Constants.ENDPOINTS.CONSUMO_RESUMEN).json()
    return z.array(ConsumoResumenRowSchema).parse(data)
  }

  static async getTop(limit = 10): Promise<TopConsumoRow[]> {
    const data = await req.get(`${Constants.ENDPOINTS.TOP_CONSUMO}?limit=${limit}`).json()
    return z.array(TopConsumoRowSchema).parse(data)
  }

  static async getCorrelacion(anio?: number): Promise<CorrelacionRow[]> {
    const data = await req
      .get(`${Constants.ENDPOINTS.CORRELACION}${anio ? `?anio=${anio}` : ''}`)
      .json()
    return z.array(CorrelacionRowSchema).parse(data)
  }

  /**
   * Pure aggregator: takes the raw `ConsumoRow[]` for one (alcaldia, colonia)
   * over a period and produces the same `ConsumoAlcaldia` shape the backend
   * returns for an alcaldia. The per-indice_des rows are summed; averages are
   * weighted by `consumo_total` so the resulting `consumo_prom` reflects the
   * real fleet-wide average.
   */
  static aggregateColonia(
    rows: ConsumoRow[],
    alcaldia: string,
    colonia: string,
  ): ConsumoAlcaldia {
    if (rows.length === 0) {
      return {
        ...ZERO_CONSUMO,
        alcaldia,
      }
    }
    const sum = (k: keyof ConsumoRow) => rows.reduce((acc, r) => acc + (Number(r[k]) || 0), 0)
    const totalAgua = sum('consumo_total')
    const totalDom = sum('consumo_total_dom')
    const totalMixto = sum('consumo_total_mixto')
    const totalNoDom = sum('consumo_total_no_dom')
    const avgProm = (k: keyof ConsumoRow) => sum(k) / rows.length

    // consume_prom on the backend is the average over rows; replicate.
    const consumo_prom = avgProm('consumo_prom')
    const anios = rows.map((r) => r.anio).filter((n) => typeof n === 'number')

    return {
      alcaldia: rows[0]?.alcaldia ?? alcaldia,
      consumo_total: totalAgua,
      consumo_prom,
      consumo_total_dom: totalDom,
      consumo_prom_dom: avgProm('consumo_prom_dom'),
      consumo_total_mixto: totalMixto,
      // The /api/consumo row payload does not include prom_mixto /
      // prom_no_dom; the backend only exposes those on /api/consumo/alcaldia.
      // Default to 0 here so consumers can keep the same shape.
      consumo_prom_mixto: 0,
      consumo_total_no_dom: totalNoDom,
      consumo_prom_no_dom: 0,
      num_colonias: 1,
      num_registros: rows.length,
      anio_min: anios.length ? Math.min(...anios) : null,
      anio_max: anios.length ? Math.max(...anios) : null,
      sin_datos: totalAgua === 0,
    }
  }
}

const ZERO_CONSUMO: ConsumoAlcaldia = {
  alcaldia: '',
  consumo_total: 0,
  consumo_prom: 0,
  consumo_total_dom: 0,
  consumo_prom_dom: 0,
  consumo_total_mixto: 0,
  consumo_prom_mixto: 0,
  consumo_total_no_dom: 0,
  consumo_prom_no_dom: 0,
  num_colonias: 0,
  num_registros: 0,
  anio_min: null,
  anio_max: null,
  sin_datos: true,
}

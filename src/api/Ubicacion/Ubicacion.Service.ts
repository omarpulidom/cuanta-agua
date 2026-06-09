import { z } from 'zod'
import { Constants } from '@/lib/Constants'
import { req } from '../req'
import {
  AlcaldiaNameSchema,
  AlcaldiaRowSchema,
  ColoniaUbicacionRowSchema,
  GeoJsonFeatureCollectionSchema,
  type AlcaldiaRow,
  type GeoJsonFeatureCollection,
} from './Ubicacion.Schemas'
import type { Bimestre } from '@/lib/bimestre'

export type {
  AlcaldiaRow,
  GeoJsonFeatureCollection,
  GeoJsonFeature,
  AlcaldiaProperties,
  ColoniaUbicacionRow,
} from './Ubicacion.Schemas'

export type UbicacionQuery = {
  anio?: number
  bimestre?: Bimestre
  alcaldia?: string
}

function buildQuery(q: UbicacionQuery): string {
  const params = new URLSearchParams()
  if (q.anio) params.set('anio', String(q.anio))
  if (q.bimestre) params.set('bimestre', String(q.bimestre))
  if (q.alcaldia) params.set('alcaldia', q.alcaldia)
  const s = params.toString()
  return s ? `?${s}` : ''
}

export class UbicacionService {
  static async getAlcaldiasForMap(q: UbicacionQuery = {}): Promise<AlcaldiaRow[]> {
    const data = await req
      .get(`${Constants.ENDPOINTS.UBICACIONES_ALCALDIAS}${buildQuery(q)}`)
      .json()
    return z.array(AlcaldiaRowSchema).parse(data)
  }

  static async getColoniasForMap(
    q: UbicacionQuery & { limit?: number } = {},
  ): Promise<z.infer<typeof ColoniaUbicacionRowSchema>[]> {
    const params = new URLSearchParams()
    if (q.anio) params.set('anio', String(q.anio))
    if (q.bimestre) params.set('bimestre', String(q.bimestre))
    if (q.alcaldia) params.set('alcaldia', q.alcaldia)
    if (q.limit) params.set('limit', String(q.limit))
    const s = params.toString()
    const data = await req
      .get(`${Constants.ENDPOINTS.UBICACIONES_COLONIAS}${s ? `?${s}` : ''}`)
      .json()
    return z.array(ColoniaUbicacionRowSchema).parse(data)
  }

  static async listAlcaldias(): Promise<string[]> {
    const data = await req.get(Constants.ENDPOINTS.ALCALDIAS).json()
    return z.array(AlcaldiaNameSchema).parse(data)
  }

  static async listColonias(alcaldia?: string): Promise<string[]> {
    const q = alcaldia ? `?alcaldia=${encodeURIComponent(alcaldia)}` : ''
    const data = await req.get(`${Constants.ENDPOINTS.COLONIAS}${q}`).json()
    return z.array(z.string()).parse(data)
  }

  static async getAlcaldiasGeoJson(): Promise<GeoJsonFeatureCollection> {
    const data = await req.get(Constants.ENDPOINTS.GEOJSON_ALCALDIAS).json()
    return GeoJsonFeatureCollectionSchema.parse(data)
  }
}

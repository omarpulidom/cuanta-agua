import {
  type ColoniaRow,
  GeoJsonFeatureCollectionSchema,
  type GeoJsonFeatureCollection,
} from './Ubicacion.Schemas'
import {
  getAllColoniasForMap,
  getColoniaByCodigoId,
  getColoniasByCodigoPostal,
  getMunicipios,
  searchColonias,
} from '@/api/db/queries'

export class UbicacionService {
  static async getColoniasForMap(): Promise<GeoJsonFeatureCollection> {
    const rows = await getAllColoniasForMap()
    return buildFeatureCollection(rows)
  }

  static async getColonia(codigoId: string): Promise<ColoniaRow | null> {
    return getColoniaByCodigoId(codigoId)
  }

  static async getColoniasPorCp(cp: string): Promise<ColoniaRow[]> {
    return getColoniasByCodigoPostal(cp)
  }

  static async buscarColonias(query: string, limit = 20): Promise<ColoniaRow[]> {
    return searchColonias(query, limit)
  }

  static async getAlcaldias() {
    return getMunicipios()
  }
}

function buildFeatureCollection(rows: ColoniaRow[]): GeoJsonFeatureCollection {
  const features: GeoJsonFeatureCollection['features'] = []

  for (const r of rows) {
    if (!r.geometria) continue
    let geometry: any
    try {
      geometry = JSON.parse(r.geometria)
    } catch {
      continue
    }
    features.push({
      type: 'Feature',
      geometry,
      properties: {
        codigo_id: r.codigo_id,
        codigo: r.codigo,
        colonia_nombre: r.colonia_nombre,
        municipio_nombre: r.municipio_nombre ?? '',
        municipio_id: r.municipio_id,
        centro_lon: r.centro_lon,
        centro_lat: r.centro_lat,
      },
    })
  }

  const fc: GeoJsonFeatureCollection = {
    type: 'FeatureCollection',
    features,
  }
  return GeoJsonFeatureCollectionSchema.parse(fc)
}

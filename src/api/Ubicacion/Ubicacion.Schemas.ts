import { z } from 'zod'

export const CoordenadasSchema = z.object({
  lon: z.number(),
  lat: z.number(),
})

export const BboxSchema = z.object({
  min_lon: z.number(),
  min_lat: z.number(),
  max_lon: z.number(),
  max_lat: z.number(),
})

export const ColoniaRowSchema = z.object({
  codigo_id: z.string(),
  codigo: z.string(),
  colonia_nombre: z.string(),
  colonia_nombre_normalizado: z.string(),
  tipo: z.string().nullable(),
  ciudad: z.string().nullable(),
  zona: z.string().nullable(),
  estado_id: z.string(),
  municipio_id: z.string(),
  municipio_uid: z.string(),
  municipio_nombre: z.string().nullable(),
  municipio_nombre_normalizado: z.string().nullable(),
  geometria: z.string().nullable(),
  min_lon: z.number().nullable(),
  min_lat: z.number().nullable(),
  max_lon: z.number().nullable(),
  max_lat: z.number().nullable(),
  centro_lon: z.number().nullable(),
  centro_lat: z.number().nullable(),
})

export type ColoniaRow = z.infer<typeof ColoniaRowSchema>

export const MunicipioRowSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  estado_id: z.string(),
  municipio_uid: z.string(),
  nombre_normalizado: z.string(),
})

export type MunicipioRow = z.infer<typeof MunicipioRowSchema>

export const GeoJsonFeatureSchema = z.object({
  type: z.literal('Feature'),
  geometry: z.object({
    type: z.union([z.literal('Polygon'), z.literal('MultiPolygon')]),
    coordinates: z.array(z.unknown()),
  }),
  properties: z.object({
    codigo_id: z.string(),
    codigo: z.string(),
    colonia_nombre: z.string(),
    municipio_nombre: z.string(),
    municipio_id: z.string(),
    centro_lon: z.number().nullable().optional(),
    centro_lat: z.number().nullable().optional(),
  }),
})

export const GeoJsonFeatureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(GeoJsonFeatureSchema),
})

export type GeoJsonFeature = z.infer<typeof GeoJsonFeatureSchema>
export type GeoJsonFeatureCollection = z.infer<typeof GeoJsonFeatureCollectionSchema>

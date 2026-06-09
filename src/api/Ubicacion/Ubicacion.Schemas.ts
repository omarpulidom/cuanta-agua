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

export const AlcaldiaRowSchema = z.object({
  alcaldia: z.string(),
  lat: z.number().nullable(),
  lon: z.number().nullable(),
  consumo_total: z.number(),
  consumo_prom: z.number(),
  consumo_total_dom: z.number(),
  consumo_prom_dom: z.number(),
  consumo_total_mixto: z.number(),
  consumo_prom_mixto: z.number(),
  consumo_total_no_dom: z.number(),
  consumo_prom_no_dom: z.number(),
  num_colonias: z.number().int(),
  num_registros: z.number().int(),
})

export type AlcaldiaRow = z.infer<typeof AlcaldiaRowSchema>

export const AlcaldiaNameSchema = z.string()

export const ColoniaUbicacionRowSchema = z.object({
  alcaldia: z.string(),
  colonia: z.string(),
  lat: z.number(),
  lon: z.number(),
  consumo_total: z.number(),
  consumo_prom: z.number(),
})

export type ColoniaUbicacionRow = z.infer<typeof ColoniaUbicacionRowSchema>

export const GeoJsonFeatureSchema = z.object({
  type: z.literal('Feature'),
  geometry: z.object({
    type: z.union([z.literal('Polygon'), z.literal('MultiPolygon')]),
    coordinates: z.array(z.unknown()),
  }),
  properties: z.record(z.string(), z.unknown()),
})

export const GeoJsonFeatureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(GeoJsonFeatureSchema),
  crs: z.unknown().optional(),
})

export type GeoJsonFeature = z.infer<typeof GeoJsonFeatureSchema>
export type GeoJsonFeatureCollection = z.infer<typeof GeoJsonFeatureCollectionSchema>
export type AlcaldiaProperties = {
  CVEGEO?: string
  CVE_ENT?: string
  CVE_MUN?: string
  NOMGEO?: string
  nomgeo?: string
  alcaldia?: string
}

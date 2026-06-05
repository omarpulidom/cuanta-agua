import { ShapeSource, FillLayer, LineLayer } from '@rnmapbox/maps'
import { useCallback } from 'react'
import { Colors } from '@/components/colors'
import type { GeoJsonFeatureCollection } from '@/api/Ubicacion/Ubicacion.Schemas'

type GeoJsonLayerProps = {
  id: string
  data: GeoJsonFeatureCollection
  selectedId?: string | null
  active: boolean
  onSelectZone?: (
    codigoId: string,
    cp: string,
    center: [number, number],
    tapCoord: [number, number],
    coloniaNombre: string,
    alcaldia: string,
  ) => void
}

type ShapePressEvent = {
  features?: Array<{
    id?: string | number
    properties?: Record<string, unknown> | null
    geometry?: GeoJSON.Polygon | GeoJSON.MultiPolygon
  }>
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export function GeoJsonLayer({
  id,
  data,
  selectedId,
  onSelectZone,
}: GeoJsonLayerProps) {
  const handleShapePress = useCallback(
    (rawEvent: unknown) => {
      const e = rawEvent as ShapePressEvent
      const feature = e.features?.[0]
      if (!feature) return
      const props = feature.properties
      const codigoId =
        (props?.codigo_id as string | undefined) ??
        feature.id?.toString()
      const cp = props?.codigo as string | undefined
      if (!codigoId || !cp) return

      const centroLon = props?.centro_lon as number | null | undefined
      const centroLat = props?.centro_lat as number | null | undefined
      const tapCoord: [number, number] = e.coordinates
        ? [e.coordinates.longitude, e.coordinates.latitude]
        : [0, 0]
      const center: [number, number] =
        centroLon != null && centroLat != null
          ? [centroLon, centroLat]
          : tapCoord
      const coloniaNombre =
        (props?.colonia_nombre as string | undefined) ?? ''
      const alcaldia =
        (props?.municipio_nombre as string | undefined) ?? ''

      onSelectZone?.(codigoId, cp, center, tapCoord, coloniaNombre, alcaldia)
    },
    [onSelectZone],
  )

  return (
    <ShapeSource
      id={`${id}-source`}
      shape={data as unknown as GeoJSON.FeatureCollection}
      cluster={false}
      onPress={handleShapePress}
    >
      <FillLayer
        id={`${id}-fill`}
        style={{
          fillColor: Colors.water.sourcePotable,
          fillOpacity: [
            'case',
            [
              '==',
              [
                'get',
                'codigo_id',
              ],
              selectedId ?? '',
            ],
            0.55,
            0.18,
          ],
          fillOpacityTransition: {
            duration: 400,
            delay: 0,
          },
        }}
      />
      <LineLayer
        id={`${id}-line`}
        style={{
          lineColor: Colors.shine.glowStrong,
          lineWidth: [
            'case',
            [
              '==',
              [
                'get',
                'codigo_id',
              ],
              selectedId ?? '',
            ],
            2.4,
            0.6,
          ],
          lineOpacity: 0.7,
          lineOpacityTransition: {
            duration: 400,
            delay: 0,
          },
        }}
      />
    </ShapeSource>
  )
}

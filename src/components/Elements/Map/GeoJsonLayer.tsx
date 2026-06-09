import { ShapeSource, FillLayer, LineLayer } from '@rnmapbox/maps'
import { useCallback } from 'react'
import type { GeoJsonFeatureCollection } from '@/api/Ubicacion/Ubicacion.Schemas'

type GeoJsonLayerProps = {
  id: string
  data: GeoJsonFeatureCollection
  selectedId?: string | null
  active: boolean
  fillColor?: string
  fillOpacitySelected?: number
  fillOpacityDefault?: number
  lineColor?: string
  lineWidthSelected?: number
  lineWidthDefault?: number
  onPressFeature?: (
    properties: Record<string, unknown>,
    geometry?: { type: string; coordinates: unknown },
  ) => void
}

type ShapePressEvent = {
  features?: Array<{
    id?: string | number
    properties?: Record<string, unknown> | null
    geometry?: { type: string; coordinates: unknown }
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
  fillColor = '#0ea5e9',
  fillOpacitySelected = 0.55,
  fillOpacityDefault = 0.18,
  lineColor = '#ffffff',
  lineWidthSelected = 2.4,
  lineWidthDefault = 0.6,
  onPressFeature,
}: GeoJsonLayerProps) {
  const handleShapePress = useCallback(
    (rawEvent: unknown) => {
      const e = rawEvent as ShapePressEvent
      const feature = e.features?.[0]
      if (!feature) return
      onPressFeature?.(feature.properties ?? {}, feature.geometry)
    },
    [onPressFeature],
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
          fillColor,
          fillOpacity: [
            'case',
            [
              '==',
              [
                'get',
                'selected',
              ],
              true,
            ],
            fillOpacitySelected,
            fillOpacityDefault,
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
          lineColor,
          lineWidth: [
            'case',
            [
              '==',
              [
                'get',
                'selected',
              ],
              true,
            ],
            lineWidthSelected,
            lineWidthDefault,
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

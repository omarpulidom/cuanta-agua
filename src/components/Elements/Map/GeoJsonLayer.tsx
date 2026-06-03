import { ShapeSource, FillLayer, LineLayer } from '@rnmapbox/maps'
import { Colors } from '@/components/colors'
import type { GeoJsonFeatureCollection } from '@/api/Ubicacion/Ubicacion.Schemas'

type GeoJsonLayerProps = {
  id: string
  data: GeoJsonFeatureCollection
  selectedId?: string | null
  active: boolean
}

export function GeoJsonLayer({ id, data, selectedId }: GeoJsonLayerProps) {
  return (
    <ShapeSource
      id={`${id}-source`}
      shape={data as unknown as GeoJSON.FeatureCollection}
      cluster={false}
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

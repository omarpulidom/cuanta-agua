import Mapbox, { FillLayer, LineLayer } from '@rnmapbox/maps'
import { useMemo } from 'react'

type HighlightCircleProps = {
  /** Center coordinate as [lon, lat]. */
  center: [number, number]
  /** Real-world radius in meters. Defaults to 200. */
  radiusMeters?: number
  /** Fill color. Defaults to the brand glowStrong blue. */
  color?: string
  /** Outline color. Defaults to a darker blue. */
  outlineColor?: string
  /** Outline width in screen pixels. Defaults to 1.5. */
  outlineWidth?: number
  /** Opacity of the fill (0..1). */
  fillOpacity?: number
  /** id prefix; useful when stacking multiple highlights. */
  id?: string
}

/**
 * Build a closed ring of `segments` vertices around a center point, with
 * each vertex at `radiusMeters` meters on the ground. This approximates a
 * circle on a plane (good enough at a single zoom for small radii).
 */
function circlePolygon(
  center: [number, number],
  radiusMeters: number,
  segments = 48,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const [lon, lat] = center
  const metersPerDegLat = 111_320
  const metersPerDegLon = 111_320 * Math.cos((lat * Math.PI) / 180)
  const dLat = radiusMeters / metersPerDegLat
  const dLon = radiusMeters / metersPerDegLon
  const ring: [number, number][] = []
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * 2 * Math.PI
    ring.push([lon + dLon * Math.cos(theta), lat + dLat * Math.sin(theta)])
  }
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [ring] },
    properties: {},
  }
}

/**
 * Drop-in highlight ring for a single [lon, lat] point, drawn as a
 * real-world meter-radius Polygon. Unlike a CircleLayer, this ring keeps
 * the same ground radius at every zoom level — zoom all the way in and it
 * still covers ~200m, not "one street" worth of pixels.
 */
export function HighlightCircle({
  center,
  radiusMeters = 600,
  color = '#0284c7',
  outlineColor = '#0c4a6e',
  outlineWidth = 1.5,
  fillOpacity = 0.22,
  id = 'highlight-circle',
}: HighlightCircleProps) {
  const feature = useMemo(
    () => circlePolygon(center, radiusMeters),
    [center[0], center[1], radiusMeters],
  )

  return (
    <Mapbox.ShapeSource id={`${id}-source`} shape={feature}>
      <FillLayer
        id={`${id}-fill`}
        style={{
          fillColor: color,
          fillOpacity,
        }}
      />
      <LineLayer
        id={`${id}-line`}
        style={{
          lineColor: outlineColor,
          lineWidth: outlineWidth,
          lineOpacity: 1,
        }}
      />
    </Mapbox.ShapeSource>
  )
}

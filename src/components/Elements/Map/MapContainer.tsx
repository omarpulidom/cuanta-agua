import Mapbox, { Camera } from '@rnmapbox/maps'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLayerStore } from '@/store/useLayerStore'
import { Constants } from '@/lib/Constants'
import { nomgeoToAlcaldiaDb } from '@/lib/alcaldia'
import { UbicacionHooks } from '@/api/Ubicacion/Ubicacion.Hooks'
import { GeoJsonLayer } from './GeoJsonLayer'
import { HighlightCircle } from './HighlightCircle'
import { Colors } from '@/components/colors'

const ALCALDIA_TO_COLONIA_ZOOM = 12

type MapContainerProps = {
  /** Canonical DB name of the selected alcaldia (e.g. "CUAUHTEMOC"). */
  selectedAlcaldia?: string | null
  /** Center of the selected colonia to highlight with a ring. */
  highlightColonia?: [number, number] | null
  onSelectAlcaldia?: (alcaldia: string, center: [number, number]) => void
  onSelectColonia?: (
    alcaldia: string,
    colonia: string,
    center: [number, number],
  ) => void
}

export function MapContainer({
  selectedAlcaldia,
  highlightColonia,
  onSelectAlcaldia,
  onSelectColonia,
}: MapContainerProps) {
  const cameraRef = useRef<Camera>(null)
  const activeLayer = useLayerStore((s) => s.activeLayer)
  const { data: alcaldiasGeoJson, isLoading } = UbicacionHooks.useAlcaldiasGeoJson()
  const [zoom, setZoom] = useState<number>(Constants.MAP_INITIAL_CAMERA.zoomLevel)

  const showColonias = zoom >= ALCALDIA_TO_COLONIA_ZOOM

  const enrichedAlcaldias = useMemo(() => {
    if (!alcaldiasGeoJson) return null
    if (!selectedAlcaldia) return alcaldiasGeoJson
    // selectedAlcaldia is the canonical DB form (e.g. "CUAUHTEMOC"). Each
    // feature carries the GeoJSON NOMGEO ("Cuauhtémoc"). Map both to canonical
    // and compare.
    const target = nomgeoToAlcaldiaDb(selectedAlcaldia)
    return {
      ...alcaldiasGeoJson,
      features: alcaldiasGeoJson.features.map((f) => {
        const name = f.properties.NOMGEO ?? f.properties.nomgeo ?? f.properties.alcaldia
        return {
          ...f,
          properties: {
            ...f.properties,
            selected: nomgeoToAlcaldiaDb(name as string) === target,
          },
        }
      }),
    }
  }, [alcaldiasGeoJson, selectedAlcaldia])

  useEffect(() => {
    Mapbox.setAccessToken(Constants.MAPBOX_TOKEN)
  }, [])

  const handleAlcaldiaPress = (
    props: Record<string, unknown>,
    geometry: { type: string; coordinates: unknown } | undefined,
  ) => {
    const name =
      (props.NOMGEO as string) || (props.nomgeo as string) || (props.alcaldia as string)
    if (!name) return
    const canonical = nomgeoToAlcaldiaDb(name)
    const centroid = geometry ? polygonCentroid(geometry) : null
    const lat = (props.centro_lat as number) ?? centroid?.[1]
    const lon = (props.centro_lon as number) ?? centroid?.[0]
    const center: [number, number] =
      typeof lat === 'number' && typeof lon === 'number'
        ? [lon, lat]
        : Constants.MAP_INITIAL_CAMERA.centerCoordinate
    onSelectAlcaldia?.(canonical, center)
  }

  const handleColoniaPress = (props: Record<string, unknown>) => {
    const alcaldia = props.municipio_nombre as string
    const colonia = props.colonia_nombre as string
    const lat = props.centro_lat as number
    const lon = props.centro_lon as number
    if (!alcaldia || !colonia) return
    const center: [number, number] =
      typeof lat === 'number' && typeof lon === 'number'
        ? [lon, lat]
        : Constants.MAP_INITIAL_CAMERA.centerCoordinate
    onSelectColonia?.(alcaldia, colonia, center)
  }

  const onRegionDidChange = (feature: unknown) => {
    const properties = (feature as { properties?: { zoomLevel?: number } } | null | undefined)
      ?.properties
    if (properties && typeof properties.zoomLevel === 'number') {
      setZoom(properties.zoomLevel)
    }
  }

  void activeLayer

  return (
    <Mapbox.MapView
      style={{ flex: 1 }}
      styleURL={Constants.MAP_STYLE_URL}
      logoEnabled={false}
      attributionEnabled={false}
      scaleBarEnabled={false}
      compassEnabled={false}
      onRegionDidChange={onRegionDidChange}
    >
      <Camera
        ref={cameraRef}
        defaultSettings={{
          centerCoordinate: Constants.MAP_INITIAL_CAMERA.centerCoordinate,
          zoomLevel: Constants.MAP_INITIAL_CAMERA.zoomLevel,
        }}
        minZoomLevel={Constants.MAP_INITIAL_CAMERA.minZoomLevel}
        maxZoomLevel={Constants.MAP_INITIAL_CAMERA.maxZoomLevel}
      />

      {enrichedAlcaldias ? (
        <GeoJsonLayer
          id='alcaldias-layer'
          data={enrichedAlcaldias}
          selectedId={selectedAlcaldia}
          active={true}
          fillColor={Colors.water.sourcePotable}
          fillOpacitySelected={0.55}
          fillOpacityDefault={0.18}
          lineColor={Colors.shine.glowStrong}
          onPressFeature={handleAlcaldiaPress}
        />
      ) : null}

      {highlightColonia ? (
        <HighlightCircle
          id='colonia-highlight'
          center={highlightColonia}
          radiusMeters={600}
          color={Colors.shine.glowStrong}
          outlineColor={Colors.shine.glow}
          outlineWidth={1.5}
          fillOpacity={0.22}
        />
      ) : null}

      {isLoading ? null : null}
    </Mapbox.MapView>
  )
}

type GeoGeometry = { type: string; coordinates: unknown }

/**
 * Cheap centroid of a Polygon or MultiPolygon. Good enough to center the camera
 * on the clicked alcaldia; not a true geodesic centroid.
 */
function polygonCentroid(geometry: GeoGeometry): [number, number] | null {
  const rings: number[][][] = []
  if (geometry.type === 'Polygon') {
    const coords = geometry.coordinates as number[][][]
    if (coords.length > 0 && coords[0]) rings.push(coords[0])
  } else if (geometry.type === 'MultiPolygon') {
    const coords = geometry.coordinates as number[][][][]
    for (const poly of coords) {
      if (poly.length > 0 && poly[0]) rings.push(poly[0])
    }
  }
  if (rings.length === 0) return null
  let sumLon = 0
  let sumLat = 0
  let count = 0
  for (const ring of rings) {
    for (const point of ring) {
      const lon = point[0]
      const lat = point[1]
      if (typeof lon === 'number' && typeof lat === 'number') {
        sumLon += lon
        sumLat += lat
        count += 1
      }
    }
  }
  if (count === 0) return null
  return [sumLon / count, sumLat / count]
}

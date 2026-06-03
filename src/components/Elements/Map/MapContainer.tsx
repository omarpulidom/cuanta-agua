import Mapbox, { Camera } from '@rnmapbox/maps'

type MapPressEvent = GeoJSON.Feature<GeoJSON.Point, { screenPointX: number; screenPointY: number }>
import { useEffect, useRef } from 'react'
import { useLayerStore } from '@/store/useLayerStore'
import { Constants } from '@/lib/Constants'
import { UbicacionHooks } from '@/api/Ubicacion/Ubicacion.Hooks'
import { GeoJsonLayer } from './GeoJsonLayer'

type MapContainerProps = {
  selectedId?: string | null
  onSelectZone?: (
    codigoId: string,
    cp: string,
    coordinates: [number, number],
  ) => void
  onCameraIdle?: (center: [number, number], zoom: number) => void
}

export function MapContainer({
  selectedId,
  onSelectZone,
  onCameraIdle,
}: MapContainerProps) {
  const cameraRef = useRef<Camera>(null)
  const activeLayer = useLayerStore((s) => s.activeLayer)
  const { data: colonias, isLoading } = UbicacionHooks.useColoniasForMap()
  const initialConfig = useRef(true)

  useEffect(() => {
    if (!initialConfig.current) return
    if (!Constants.MAPBOX_TOKEN) {
      console.warn('[MapContainer] No MAPBOX_TOKEN set, map will be blank.')
    }
    Mapbox.setAccessToken(Constants.MAPBOX_TOKEN)
    initialConfig.current = false
  }, [])

  const onMapPress = (e: MapPressEvent) => {
    const feature = e
    const props = feature.properties as
      | Record<string, unknown>
      | undefined
    const codigoId = (props?.codigo_id as string | undefined) ?? feature.id?.toString()
    const cp = props?.codigo as string | undefined
    if (!codigoId || !cp) return

    const pointCoords = feature.geometry?.coordinates
    if (!pointCoords) return
    const center: [number, number] = [pointCoords[0], pointCoords[1]]
    onSelectZone?.(codigoId, cp, center)
  }

  return (
    <Mapbox.MapView
      style={{ flex: 1 }}
      styleURL={Constants.MAP_STYLE_URL}
      onPress={onMapPress}
      logoEnabled={false}
      attributionEnabled={false}
      scaleBarEnabled={false}
      compassEnabled={false}
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

      {colonias && activeLayer !== 'water' && (
        <GeoJsonLayer
          id='weather-layer'
          data={colonias}
          selectedId={selectedId}
          active={true}
        />
      )}

      {colonias && activeLayer !== 'weather' && (
        <GeoJsonLayer
          id='water-layer'
          data={colonias}
          selectedId={selectedId}
          active={true}
        />
      )}

      {isLoading ? null : null}
    </Mapbox.MapView>
  )
}

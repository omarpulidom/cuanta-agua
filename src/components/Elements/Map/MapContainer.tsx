import Mapbox, { Camera } from '@rnmapbox/maps'
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
    center: [number, number],
    tapCoord: [number, number],
    coloniaNombre: string,
    alcaldia: string,
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

  void onCameraIdle

  return (
    <Mapbox.MapView
      style={{ flex: 1 }}
      styleURL={Constants.MAP_STYLE_URL}
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
          onSelectZone={onSelectZone}
        />
      )}

      {colonias && activeLayer !== 'weather' && (
        <GeoJsonLayer
          id='water-layer'
          data={colonias}
          selectedId={selectedId}
          active={true}
          onSelectZone={onSelectZone}
        />
      )}

      {isLoading ? null : null}
    </Mapbox.MapView>
  )
}

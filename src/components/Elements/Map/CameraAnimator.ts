import { useRef } from 'react'
import { type Camera } from '@rnmapbox/maps'
import { useLayerStore } from '@/store/useLayerStore'
import { Easings } from '@/lib/animation'

type UseCameraFocus = (
  cameraRef: React.RefObject<Camera | null>,
) => (center: [number, number], zoom?: number) => void

export const useCameraFocus: UseCameraFocus = (cameraRef) => {
  const lastCenter = useRef<[number, number] | null>(null)
  return (center, zoom = 9) => {
    const last = lastCenter.current
    if (
      last
      && Math.abs(last[0] - center[0]) < 0.0005
      && Math.abs(last[1] - center[1]) < 0.0005
    ) {
      return
    }
    lastCenter.current = center
    cameraRef.current?.setCamera({
      centerCoordinate: center,
      zoomLevel: zoom,
      animationMode: 'flyTo',
      animationDuration: 1200,
    })
  }
}

// re-export easings for the file's consumers
export { Easings }

import { useQuery } from '@tanstack/react-query'
import { TiempoFacade } from './Tiempo.Service'

export class TiempoHooks {
  static KEYS = {
    current: ['tiempo', 'current'] as const,
  }

  static useCurrentTiempo() {
    return useQuery({
      queryKey: TiempoHooks.KEYS.current,
      queryFn: () => TiempoFacade.getCurrent(),
      staleTime: Infinity,
      gcTime: Infinity,
    })
  }

  static useAnios() {
    return useQuery({
      queryKey: ['tiempo', 'anios'],
      queryFn: () => TiempoFacade.getAnios(),
      staleTime: Infinity,
    })
  }
}

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { TiempoService } from './Tiempo.Service'

export class TiempoHooks {
  static KEYS = {
    anios: [
      'tiempo',
      'anios',
    ] as const,
    bimestres: [
      'tiempo',
      'bimestres',
    ] as const,
  }

  static useAnios(options?: Omit<UseQueryOptions<number[]>, 'queryKey' | 'queryFn'>) {
    return useQuery({
      queryKey: TiempoHooks.KEYS.anios,
      queryFn: () => TiempoService.getAnios(),
      staleTime: 24 * 60 * 60 * 1000,
      ...options,
    })
  }

  static useBimestres(options?: Omit<UseQueryOptions<number[]>, 'queryKey' | 'queryFn'>) {
    return useQuery({
      queryKey: TiempoHooks.KEYS.bimestres,
      queryFn: () => TiempoService.getBimestres(),
      staleTime: 24 * 60 * 60 * 1000,
      ...options,
    })
  }
}

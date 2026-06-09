import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { ClimaService } from './Clima.Service'
import { type CorrelacionRow } from './Clima.Schemas'

export class ClimaHooks {
  static KEYS = {
    correlacion: (anio?: number) => [
      'clima',
      'correlacion',
      anio ?? null,
    ] as const,
  }

  static useCorrelacion(
    anio?: number,
    options?: Omit<UseQueryOptions<CorrelacionRow[]>, 'queryKey' | 'queryFn'>,
  ) {
    return useQuery({
      queryKey: ClimaHooks.KEYS.correlacion(anio),
      queryFn: () => ClimaService.getCorrelacion(anio),
      staleTime: 5 * 60 * 1000,
      ...options,
    })
  }
}

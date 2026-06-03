import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import type { Bimestre } from '@/lib/bimestre'
import type { ClimaRow } from './Clima.Schemas'
import { ClimaFacade } from './Clima.Service'

export class ClimaHooks {
  static KEYS = {
    byAlcaldia: (alcaldia: string, bimestre: number, anio: number) =>
      ['clima', 'alcaldia', alcaldia, bimestre, anio] as const,
  }

  static useClimaByAlcaldia(
    alcaldia: string | null,
    bimestre: Bimestre,
    anio: number,
    options?: Omit<UseQueryOptions<ClimaRow>, 'queryKey' | 'queryFn'>,
  ) {
    return useQuery({
      queryKey: alcaldia
        ? ClimaHooks.KEYS.byAlcaldia(alcaldia, bimestre, anio)
        : ['clima', 'none'],
      queryFn: () =>
        alcaldia
          ? Promise.resolve(ClimaFacade.getClima(alcaldia, bimestre, anio))
          : Promise.resolve({
              id_fact_clima: 0,
              id_tiempo: 0,
              alcaldia: '',
              temp_maxima: 0,
              temp_minima: 0,
              temp_promedio: 0,
              humedad_promedio: 0,
              lluvia_total: 0,
            }),
      enabled: !!alcaldia,
      staleTime: Infinity,
      ...options,
    })
  }
}

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import type { ConsumoCompleto } from './Consumo.Service'
import { ConsumoService } from './Consumo.Service'

export class ConsumoHooks {
  static KEYS = {
    byColonia: (codigoId: string, bimestre: number, anio: number) =>
      ['consumo', 'colonia', codigoId, bimestre, anio] as const,
  }

  static useConsumoByColonia(
    codigoId: string | null,
    bimestre: number,
    anio: number,
    options?: Omit<UseQueryOptions<ConsumoCompleto>, 'queryKey' | 'queryFn'>,
  ) {
    return useQuery({
      queryKey: codigoId
        ? ConsumoHooks.KEYS.byColonia(codigoId, bimestre, anio)
        : ['consumo', 'none'],
      queryFn: () =>
        codigoId
          ? ConsumoService.getConsumo(codigoId, bimestre as 1 | 2 | 3 | 4 | 5 | 6, anio)
          : Promise.resolve({
              id_fact: 0,
              id_tiempo: 0,
              id_ubicacion: 0,
              id_indice_des: 0,
              consumo_total: 0,
              consumo_prom: 0,
              consumo_total_dom: 0,
              consumo_prom_dom: 0,
              consumo_total_no_dom: 0,
              consumo_prom_no_dom: 0,
              consumo_total_mixto: 0,
              consumo_prom_mixto: 0,
              indice_des: 'MEDIO' as const,
              sources: { potable: 0, residual: 0, rain: 0, recycled: 0 },
              trend: [],
              status: 'ok' as const,
              disponibilidadIndex: 0,
            }),
      enabled: !!codigoId,
      staleTime: Infinity,
      ...options,
    })
  }
}

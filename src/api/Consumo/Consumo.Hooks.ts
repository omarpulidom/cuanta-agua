import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { ConsumoService, type ConsumoAlcaldia, type ConsumoListQuery, type ConsumoRow, type ConsumoResumenRow, type CorrelacionRow, type TopConsumoRow } from './Consumo.Service'
import type { Bimestre } from '@/lib/bimestre'

export type { ConsumoAlcaldia, ConsumoRow, TopConsumoRow, ConsumoResumenRow, CorrelacionRow, ConsumoListQuery } from './Consumo.Service'

export class ConsumoHooks {
  static KEYS = {
    list: (q: ConsumoListQuery) => [
      'consumo',
      'list',
      q.anio ?? null,
      q.bimestre ?? null,
      q.alcaldia ?? null,
      q.colonia ?? null,
      q.indice_des ?? null,
      q.limit ?? null,
      q.offset ?? null,
    ] as const,
    alcaldia: (alcaldia: string, anio?: number, bimestre?: Bimestre) =>
      [
        'consumo',
        'alcaldia',
        alcaldia,
        anio ?? null,
        bimestre ?? null,
      ] as const,
    colonia: (alcaldia: string, colonia: string, anio?: number, bimestre?: Bimestre) =>
      [
        'consumo',
        'colonia',
        alcaldia,
        colonia,
        anio ?? null,
        bimestre ?? null,
      ] as const,
    resumen: [
      'consumo',
      'resumen',
    ] as const,
    top: (limit: number) => [
      'consumo',
      'top',
      limit,
    ] as const,
    correlacion: (anio?: number) => [
      'consumo',
      'correlacion',
      anio ?? null,
    ] as const,
  }

  static useList(
    q: ConsumoListQuery = {},
    options?: Omit<UseQueryOptions<ConsumoRow[]>, 'queryKey' | 'queryFn'>,
  ) {
    return useQuery({
      queryKey: ConsumoHooks.KEYS.list(q),
      queryFn: () => ConsumoService.listRows(q),
      staleTime: 5 * 60 * 1000,
      ...options,
    })
  }

  static useAlcaldia(
    alcaldia: string | null,
    anio?: number,
    bimestre?: Bimestre,
    options?: Omit<UseQueryOptions<ConsumoAlcaldia>, 'queryKey' | 'queryFn'>,
  ) {
    return useQuery({
      queryKey: alcaldia
        ? ConsumoHooks.KEYS.alcaldia(alcaldia, anio, bimestre)
        : (['consumo', 'alcaldia', 'none'] as const),
      queryFn: () => (alcaldia ? ConsumoService.getAlcaldia(alcaldia, { anio, bimestre }) : Promise.reject(new Error('alcaldia required'))),
      enabled: !!alcaldia,
      staleTime: 5 * 60 * 1000,
      ...options,
    })
  }

  /**
   * Aggregate consumo for a single colonia over a single (anio, bimestre).
   * Internally calls /api/consumo with the colonia filter and rolls the rows
   * up in the client into a ConsumoAlcaldia-shaped object so the rest of the
   * UI doesn't have to special-case the colonia path.
   */
  static useByColonia(
    alcaldia: string | null,
    colonia: string | null,
    anio?: number,
    bimestre?: Bimestre,
    options?: Omit<UseQueryOptions<ConsumoAlcaldia>, 'queryKey' | 'queryFn'>,
  ) {
    return useQuery({
      queryKey:
        alcaldia && colonia
          ? ConsumoHooks.KEYS.colonia(alcaldia, colonia, anio, bimestre)
          : (['consumo', 'colonia', 'none'] as const),
      queryFn: async () => {
        if (!alcaldia || !colonia) {
          throw new Error('alcaldia and colonia required')
        }
        const rows = await ConsumoService.listRows({
          alcaldia,
          colonia,
          anio,
          bimestre,
          limit: 500,
        })
        return ConsumoService.aggregateColonia(rows, alcaldia, colonia)
      },
      enabled: !!alcaldia && !!colonia,
      staleTime: 5 * 60 * 1000,
      ...options,
    })
  }

  static useResumen(options?: Omit<UseQueryOptions<ConsumoResumenRow[]>, 'queryKey' | 'queryFn'>) {
    return useQuery({
      queryKey: ConsumoHooks.KEYS.resumen,
      queryFn: () => ConsumoService.getResumen(),
      staleTime: 5 * 60 * 1000,
      ...options,
    })
  }

  static useTop(limit = 10, options?: Omit<UseQueryOptions<TopConsumoRow[]>, 'queryKey' | 'queryFn'>) {
    return useQuery({
      queryKey: ConsumoHooks.KEYS.top(limit),
      queryFn: () => ConsumoService.getTop(limit),
      staleTime: 5 * 60 * 1000,
      ...options,
    })
  }

  static useCorrelacion(anio?: number, options?: Omit<UseQueryOptions<CorrelacionRow[]>, 'queryKey' | 'queryFn'>) {
    return useQuery({
      queryKey: ConsumoHooks.KEYS.correlacion(anio),
      queryFn: () => ConsumoService.getCorrelacion(anio),
      staleTime: 5 * 60 * 1000,
      ...options,
    })
  }
}


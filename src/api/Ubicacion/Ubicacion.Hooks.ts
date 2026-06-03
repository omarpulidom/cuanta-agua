import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import type { ColoniaRow, GeoJsonFeatureCollection } from './Ubicacion.Schemas'
import { UbicacionService } from './Ubicacion.Service'

export class UbicacionHooks {
  static KEYS = {
    coloniasMap: ['ubicacion', 'colonias', 'map'] as const,
    colonia: (codigoId: string) => ['ubicacion', 'colonia', codigoId] as const,
    coloniasByCp: (cp: string) => ['ubicacion', 'colonias', 'cp', cp] as const,
    search: (q: string) => ['ubicacion', 'search', q] as const,
    alcaldias: ['ubicacion', 'alcaldias'] as const,
  }

  static useColoniasForMap(
    options?: Omit<UseQueryOptions<GeoJsonFeatureCollection>, 'queryKey' | 'queryFn'>,
  ) {
    return useQuery({
      queryKey: UbicacionHooks.KEYS.coloniasMap,
      queryFn: () => UbicacionService.getColoniasForMap(),
      staleTime: Infinity,
      ...options,
    })
  }

  static useColonia(
    codigoId: string | null,
    options?: Omit<UseQueryOptions<ColoniaRow | null>, 'queryKey' | 'queryFn'>,
  ) {
    return useQuery({
      queryKey: codigoId ? UbicacionHooks.KEYS.colonia(codigoId) : ['ubicacion', 'colonia', 'none'],
      queryFn: () => (codigoId ? UbicacionService.getColonia(codigoId) : null),
      enabled: !!codigoId,
      staleTime: Infinity,
      ...options,
    })
  }

  static useColoniasByCp(
    cp: string | null,
    options?: Omit<UseQueryOptions<ColoniaRow[]>, 'queryKey' | 'queryFn'>,
  ) {
    return useQuery({
      queryKey: cp ? UbicacionHooks.KEYS.coloniasByCp(cp) : ['ubicacion', 'colonias', 'cp', 'none'],
      queryFn: () => (cp ? UbicacionService.getColoniasPorCp(cp) : []),
      enabled: !!cp,
      staleTime: Infinity,
      ...options,
    })
  }

  static useSearchColonias(
    query: string,
    options?: Omit<UseQueryOptions<ColoniaRow[]>, 'queryKey' | 'queryFn'>,
  ) {
    return useQuery({
      queryKey: UbicacionHooks.KEYS.search(query),
      queryFn: () => UbicacionService.buscarColonias(query, 20),
      enabled: query.trim().length >= 2,
      staleTime: 60_000,
      ...options,
    })
  }
}

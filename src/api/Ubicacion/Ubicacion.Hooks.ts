import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'
import { UbicacionService, type AlcaldiaRow, type GeoJsonFeatureCollection, type UbicacionQuery } from './Ubicacion.Service'
import { ColoniaUbicacionRowSchema } from './Ubicacion.Schemas'

export class UbicacionHooks {
  static KEYS = {
    alcaldiasMap: (q: UbicacionQuery) =>
      [
        'ubicacion',
        'alcaldias',
        'map',
        q.anio ?? null,
        q.bimestre ?? null,
        q.alcaldia ?? null,
      ] as const,
    coloniasMap: (q: UbicacionQuery) =>
      [
        'ubicacion',
        'colonias',
        'map',
        q.anio ?? null,
        q.bimestre ?? null,
        q.alcaldia ?? null,
      ] as const,
    alcaldiasList: [
      'ubicacion',
      'alcaldias',
      'list',
    ] as const,
    coloniasList: (alcaldia?: string) =>
      [
        'ubicacion',
        'colonias',
        'list',
        alcaldia ?? null,
      ] as const,
    geojsonAlcaldias: [
      'ubicacion',
      'geojson',
      'alcaldias',
    ] as const,
  }

  static useAlcaldiasForMap(
    q: UbicacionQuery = {},
    options?: Omit<UseQueryOptions<AlcaldiaRow[]>, 'queryKey' | 'queryFn'>,
  ) {
    return useQuery({
      queryKey: UbicacionHooks.KEYS.alcaldiasMap(q),
      queryFn: () => UbicacionService.getAlcaldiasForMap(q),
      staleTime: 5 * 60 * 1000,
      ...options,
    })
  }

  static useColoniasForMap(
    q: UbicacionQuery & { limit?: number } = {},
    options?: Omit<UseQueryOptions<z.infer<typeof ColoniaUbicacionRowSchema>[]>, 'queryKey' | 'queryFn'>,
  ) {
    return useQuery({
      queryKey: UbicacionHooks.KEYS.coloniasMap(q),
      queryFn: () => UbicacionService.getColoniasForMap(q),
      staleTime: 5 * 60 * 1000,
      ...options,
    })
  }

  static useAlcaldiasList() {
    return useQuery({
      queryKey: UbicacionHooks.KEYS.alcaldiasList,
      queryFn: () => UbicacionService.listAlcaldias(),
      staleTime: 24 * 60 * 60 * 1000,
    })
  }

  static useColoniasList(alcaldia?: string) {
    return useQuery({
      queryKey: UbicacionHooks.KEYS.coloniasList(alcaldia),
      queryFn: () => UbicacionService.listColonias(alcaldia),
      staleTime: 24 * 60 * 60 * 1000,
    })
  }

  static useAlcaldiasGeoJson() {
    return useQuery({
      queryKey: UbicacionHooks.KEYS.geojsonAlcaldias,
      queryFn: () => UbicacionService.getAlcaldiasGeoJson(),
      staleTime: Infinity,
    })
  }
}

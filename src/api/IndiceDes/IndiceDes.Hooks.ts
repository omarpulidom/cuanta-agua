import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { IndiceDesService } from './IndiceDes.Service'
import { type IndiceDesRow } from './IndiceDes.Schemas'

export class IndiceDesHooks {
  static KEYS = {
    all: [
      'indices',
      'all',
    ] as const,
  }

  static useList(options?: Omit<UseQueryOptions<IndiceDesRow[]>, 'queryKey' | 'queryFn'>) {
    return useQuery({
      queryKey: IndiceDesHooks.KEYS.all,
      queryFn: () => IndiceDesService.list(),
      staleTime: 24 * 60 * 60 * 1000,
      ...options,
    })
  }
}

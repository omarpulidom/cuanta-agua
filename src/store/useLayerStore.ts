import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { zustandMMKVStorage } from '@/lib/mmkv'
import {
  createLayerSlice,
  type ActiveLayer,
  type LayerSlice,
  type Theme,
  type Units,
} from './layer.store'

export type { ActiveLayer, Theme, Units } from './layer.store'

const LAYER_STORE_NAME_PERSIST = 'zustand-layer-stores'

type PersistedLayerState = Pick<LayerSlice, 'activeLayer' | 'units' | 'theme'>

export const useLayerStore = create<LayerSlice>()(
  persist(
    (...args) => ({
      ...createLayerSlice(...args),
    }),
    {
      name: LAYER_STORE_NAME_PERSIST,
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize(state): PersistedLayerState {
        return {
          activeLayer: state.activeLayer,
          units: state.units,
          theme: state.theme,
        }
      },
    },
  ),
)

void ({} as ActiveLayer | Theme | Units)

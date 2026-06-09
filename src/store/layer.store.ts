import type { StateCreator } from 'zustand'

export type ActiveLayer = 'weather' | 'water' | 'both' | 'colonias'
export type Units = 'metric' | 'imperial'
export type Theme = 'light' | 'dark' | 'auto'
export type BimestreView = 1 | 2 | 3 | 'total'

type LayerState = {
  activeLayer: ActiveLayer
  units: Units
  theme: Theme
  bimestreView: BimestreView
}

type LayerActions = {
  setActiveLayer: (layer: ActiveLayer) => void
  setUnits: (units: Units) => void
  setTheme: (theme: Theme) => void
  setBimestreView: (v: BimestreView) => void
  resetLayerState: () => void
}

export type LayerSlice = LayerState & LayerActions

const initialState: LayerState = {
  activeLayer: 'both',
  units: 'metric',
  theme: 'light',
  bimestreView: 'total',
}

export const createLayerSlice: StateCreator<LayerSlice, [], [], LayerSlice> = (set) => ({
  ...initialState,

  resetLayerState: () => set(initialState),

  setActiveLayer: (activeLayer) =>
    set((state) => (state.activeLayer === activeLayer ? state : { activeLayer })),

  setUnits: (units) => set((state) => (state.units === units ? state : { units })),

  setTheme: (theme) => set((state) => (state.theme === theme ? state : { theme })),

  setBimestreView: (bimestreView) =>
    set((state) => (state.bimestreView === bimestreView ? state : { bimestreView })),
})

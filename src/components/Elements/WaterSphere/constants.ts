import { Colors } from '@/components/colors'

export const SPHERE_VIEWBOX = {
  width: 320,
  height: 380,
}

export const SPHERE_CIRCLE = {
  cx: 160,
  cy: 180,
  r: 130,
}

export const SPHERE_PALETTE = {
  light: Colors.water.sphere.light,
  mid: Colors.water.sphere.mid,
  deep: Colors.water.sphere.deep,
  highlight: Colors.water.sphere.highlight,
  stroke: 'rgba(255,255,255,0.4)',
}

export const SPHERE_SCALE = {
  min: 0,
  max: 1000,
  ticks: [
    0, 100, 200, 300, 400, 500, 750, 1000,
  ] as const,
  tickStep: 50,
}

export const DROP_PATH_SMALL =
  'M14 2 C14 2, 6 10, 6 14 C6 18.4, 9.6 22, 14 22 C18.4 22, 22 18.4, 22 14 C22 10, 14 2, 14 2 Z'

export const DROP_PATH_MINI =
  'M9 1 C9 1, 3 7, 3 9 C3 11.8, 5.7 14, 9 14 C12.3 14, 15 11.8, 15 9 C15 7, 9 1, 9 1 Z'

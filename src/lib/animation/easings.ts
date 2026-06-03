import { Easing } from 'react-native-reanimated'

export const Easings = {
  smoothOut: Easing.bezier(0.16, 1, 0.3, 1),
  smoothInOut: Easing.bezier(0.65, 0, 0.35, 1),
  sharp: Easing.bezier(0.4, 0, 0.2, 1),
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
  out: Easing.out(Easing.cubic),
  in: Easing.in(Easing.cubic),
  inOut: Easing.inOut(Easing.cubic),
} as const

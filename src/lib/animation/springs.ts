import { withSpring } from 'react-native-reanimated'

export const Springs = {
  gentle: {
    mass: 1,
    damping: 20,
    stiffness: 120,
  },
  bouncy: {
    mass: 1,
    damping: 12,
    stiffness: 200,
  },
  snappy: {
    mass: 0.5,
    damping: 18,
    stiffness: 300,
  },
  soft: {
    mass: 1.2,
    damping: 24,
    stiffness: 90,
  },
} as const

export type SpringPreset = keyof typeof Springs

export function springWith(preset: SpringPreset) {
  return withSpring(1, Springs[preset])
}

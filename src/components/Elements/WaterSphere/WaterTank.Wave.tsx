import { useEffect } from 'react'
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { Path } from 'react-native-svg'
import { SPHERE_PALETTE } from './constants'

const AnimatedPath = Animated.createAnimatedComponent(Path)

type Tank = {
  x: number
  y: number
  w: number
  h: number
  rx: number
  capHeight: number
  capOverhang: number
  spoutY: number
  spoutW: number
  spoutH: number
}

type WaveProps = {
  level: number
  amplitude?: number
  speed?: number
  phase?: number
  color: string
  opacity?: number
  tank: Tank
}

export function WaterTankWave({
  level,
  amplitude = 1.4,
  speed = 2400,
  phase = 0,
  color,
  opacity = 1,
  tank,
}: WaveProps) {
  const t = useSharedValue(0)

  useEffect(() => {
    t.value = 0
    t.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: speed,
        easing: Easing.linear,
      }),
      -1,
      false,
    )
  }, [
    speed,
    t,
  ])

  const animatedProps = useAnimatedProps(() => {
    const { x, y, w, h } = tank
    const innerPad = 4
    const innerTop = y + innerPad
    const innerH = h - innerPad * 2
    const waterTopY = innerTop + (1 - level) * innerH

    const segments = 32
    let d = `M ${x} ${waterTopY}`

    for (let i = 0; i <= segments; i++) {
      const px = x + (i * w) / segments
      const py = waterTopY + Math.sin(t.value + i * 0.5 + phase) * amplitude
      d += ` L ${px} ${py}`
    }

    d += ` L ${x + w} ${y + h} L ${x} ${y + h} Z`
    return { d }
  })

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      fill={color}
      opacity={opacity}
    />
  )
}

void SPHERE_PALETTE

import { useEffect } from 'react'
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { Path } from 'react-native-svg'
import { SPHERE_CIRCLE } from './constants'

const AnimatedPath = Animated.createAnimatedComponent(Path)

type WaveProps = {
  level: number
  amplitude?: number
  speed?: number
  phase?: number
  color: string
  opacity?: number
}

export function WaterSphereWave({
  level,
  amplitude = 6,
  speed = 2400,
  phase = 0,
  color,
  opacity = 1,
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
    const cy = SPHERE_CIRCLE.cy
    const cx = SPHERE_CIRCLE.cx
    const r = SPHERE_CIRCLE.r

    const waterTopY = cy - r + (1 - level) * (r * 1.85)

    const segments = 40
    const halfW = r
    let d = `M ${cx - halfW} ${waterTopY}`

    for (let i = 0; i <= segments; i++) {
      const x = cx - halfW + (i * (2 * halfW)) / segments
      const y = waterTopY + Math.sin(t.value + i * 0.5 + phase) * amplitude
      d += ` L ${x} ${y}`
    }

    d += ` L ${cx + halfW} ${cy + r} L ${cx - halfW} ${cy + r} Z`

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

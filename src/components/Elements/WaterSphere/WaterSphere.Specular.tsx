import { useEffect } from 'react'
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { Rect } from 'react-native-svg'

const AnimatedRect = Animated.createAnimatedComponent(Rect)

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

type SpecularProps = {
  opacity?: number
  tank?: Tank
}

export function WaterSphereSpecular({ opacity = 0.25, tank }: SpecularProps) {
  const breath = useSharedValue(0)

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, {
        duration: 3200,
      }),
      -1,
      true,
    )
  }, [
    breath,
  ])

  const animatedProps = useAnimatedProps(() => {
    if (!tank) {
      return { y: 0, height: 0 }
    }
    const pad = 4
    const y = tank.y + pad + breath.value * 1.5
    const h = tank.h * 0.25
    return { y, height: h }
  })

  if (!tank) {
    return null
  }

  return (
    <AnimatedRect
      animatedProps={animatedProps}
      x={tank.x + 4}
      width={6}
      rx={3}
      fill='#ffffff'
      opacity={opacity}
    />
  )
}

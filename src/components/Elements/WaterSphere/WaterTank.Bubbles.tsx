import { useEffect } from 'react'
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { Circle } from 'react-native-svg'
import { SPHERE_PALETTE } from './constants'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

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

type BubblesProps = {
  level: number
  tank: Tank
  speed?: number
  count?: number
}

const BUBBLES = [
  {
    xOffset: 0.22,
    radius: 1.8,
    delay: 0,
  },
  {
    xOffset: 0.5,
    radius: 2.2,
    delay: 800,
  },
  {
    xOffset: 0.72,
    radius: 1.5,
    delay: 1500,
  },
]

export function WaterTankBubbles({ level, tank, speed = 1 }: BubblesProps) {
  return (
    <>
      {BUBBLES.map((b, i) => (
        <Bubble
          key={i}
          xOffset={b.xOffset}
          radius={b.radius}
          delay={b.delay}
          level={level}
          tank={tank}
          speed={speed}
        />
      ))}
    </>
  )
}

type BubbleProps = {
  xOffset: number
  radius: number
  delay: number
  level: number
  tank: Tank
  speed: number
}

function Bubble({ xOffset, radius, delay, level, tank, speed }: BubbleProps) {
  const t = useSharedValue(0)
  const baseDuration = 3200 / speed

  useEffect(() => {
    t.value = 0
    t.value = withRepeat(
      withTiming(1, {
        duration: baseDuration,
        easing: Easing.linear,
      }),
      -1,
      false,
    )
  }, [
    baseDuration,
    t,
  ])

  const animatedProps = useAnimatedProps(() => {
    'worklet'
    const { x, y, w, h } = tank
    const innerPad = 4
    const innerTop = y + innerPad
    const innerH = h - innerPad * 2
    const waterTopY = innerTop + (1 - level) * innerH
    const bottomY = y + h - innerPad
    const cy = bottomY - t.value * (bottomY - waterTopY)
    const cx = x + xOffset * w + Math.sin(t.value * Math.PI * 2) * 1.5
    return { cx, cy }
  })

  return (
    <AnimatedCircle
      animatedProps={animatedProps}
      r={radius}
      fill='rgba(255,255,255,0.65)'
      stroke={SPHERE_PALETTE.light}
      strokeWidth={0.4}
      opacity={level > 0.1 ? 0.85 : 0}
    />
  )
}

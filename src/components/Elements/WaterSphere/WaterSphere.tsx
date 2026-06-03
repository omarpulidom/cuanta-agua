import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg'
import { Easings } from '@/lib/animation'
import { SPHERE_PALETTE, SPHERE_SCALE } from './constants'
import { WaterSphereSpecular } from './WaterSphere.Specular'
import { WaterTankWave } from './WaterTank.Wave'
import { WaterTankBubbles } from './WaterTank.Bubbles'

type SphereState = 'idle' | 'active' | 'loading' | 'error'

type WaterSphereProps = {
  value: number
  maxValue?: number
  state?: SphereState
  size?: number
  showScale?: boolean
  showGlow?: boolean
}

const VB_W = 140
const VB_H = 180

const TANK = {
  x: 22,
  y: 22,
  w: 78,
  h: 130,
  rx: 8,
  capHeight: 8,
  capOverhang: 6,
  spoutY: 152,
  spoutW: 18,
  spoutH: 10,
}

export function WaterSphere({
  value,
  maxValue = SPHERE_SCALE.max,
  state = 'idle',
  size = 96,
  showScale = true,
  showGlow = false,
}: WaterSphereProps) {
  const targetLevel = Math.max(0, Math.min(1, value / maxValue))
  const breath = useSharedValue(0)
  const scale = useSharedValue(1)
  const translateX = useSharedValue(0)

  useEffect(() => {
    if (state === 'error') {
      translateX.value = withSequence(
        withTiming(-6, {
          duration: 60,
        }),
        withTiming(6, {
          duration: 60,
        }),
        withTiming(-4, {
          duration: 60,
        }),
        withTiming(4, {
          duration: 60,
        }),
        withTiming(0, {
          duration: 60,
        }),
      )
    } else {
      translateX.value = withTiming(0, {
        duration: 200,
      })
    }
  }, [
    state,
    translateX,
  ])

  useEffect(() => {
    if (state === 'active' || state === 'loading') {
      scale.value = withTiming(1.03, {
        duration: 500,
        easing: Easings.smoothOut,
      })
    } else {
      scale.value = withTiming(1, {
        duration: 500,
        easing: Easings.smoothOut,
      })
    }
  }, [
    state,
    scale,
  ])

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, {
        duration: 2400,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    )
  }, [
    breath,
  ])

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * (1 + breath.value * 0.012) },
      { translateX: translateX.value },
    ],
  }))

  const width = size
  const height = size * (VB_H / VB_W)

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
        },
      ]}
    >
      <Animated.View style={wrapStyle}>
        <Svg
          width={width}
          height={height}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
        >
          <Defs>
            <LinearGradient id='tankShell' x1='0' y1='0' x2='0' y2='1'>
              <Stop offset='0' stopColor='rgba(255,255,255,0.65)' />
              <Stop offset='1' stopColor='rgba(186,230,253,0.35)' />
            </LinearGradient>
            <LinearGradient id='waterFill' x1='0' y1='0' x2='0' y2='1'>
              <Stop offset='0' stopColor={SPHERE_PALETTE.mid} stopOpacity={0.95} />
              <Stop offset='0.5' stopColor={SPHERE_PALETTE.deep} stopOpacity={0.95} />
              <Stop offset='1' stopColor='#0c4a6e' />
            </LinearGradient>
            <LinearGradient id='waterFill2' x1='0' y1='0' x2='0' y2='1'>
              <Stop offset='0' stopColor={SPHERE_PALETTE.mid} stopOpacity={0.55} />
              <Stop offset='1' stopColor={SPHERE_PALETTE.deep} stopOpacity={0.4} />
            </LinearGradient>
            <LinearGradient id='capFill' x1='0' y1='0' x2='0' y2='1'>
              <Stop offset='0' stopColor='#cbd5e1' />
              <Stop offset='1' stopColor='#64748b' />
            </LinearGradient>
            <LinearGradient id='spoutFill' x1='0' y1='0' x2='0' y2='1'>
              <Stop offset='0' stopColor='#94a3b8' />
              <Stop offset='1' stopColor='#475569' />
            </LinearGradient>
            <ClipPath id='tankClip'>
              <Rect
                x={TANK.x}
                y={TANK.y}
                width={TANK.w}
                height={TANK.h}
                rx={TANK.rx}
              />
            </ClipPath>
          </Defs>

          {showGlow && (
            <Circle
              cx={TANK.x + TANK.w / 2}
              cy={TANK.y + TANK.h / 2}
              r={TANK.w * 0.7}
              fill={SPHERE_PALETTE.mid}
              opacity={0.12}
            />
          )}

          <Rect
            x={TANK.x - TANK.capOverhang}
            y={TANK.y - TANK.capHeight}
            width={TANK.w + TANK.capOverhang * 2}
            height={TANK.capHeight + 2}
            rx={3}
            fill='url(#capFill)'
          />
          <Rect
            x={TANK.x - TANK.capOverhang + 4}
            y={TANK.y - TANK.capHeight - 4}
            width={TANK.w + TANK.capOverhang * 2 - 8}
            height={3}
            rx={1.5}
            fill='#475569'
          />

          <Rect
            x={TANK.x}
            y={TANK.y}
            width={TANK.w}
            height={TANK.h}
            rx={TANK.rx}
            fill='url(#tankShell)'
            stroke={SPHERE_PALETTE.stroke}
            strokeWidth={1.2}
          />

          <G clipPath='url(#tankClip)'>
            <Rect
              x={TANK.x}
              y={TANK.y + TANK.h * (1 - targetLevel) * 0.92}
              width={TANK.w}
              height={TANK.h}
              fill={SPHERE_PALETTE.deep}
              opacity={0.1}
            />

            <WaterTankWave
              level={targetLevel}
              amplitude={state === 'active' ? 2.4 : 1.4}
              speed={state === 'active' ? 1400 : 2400}
              phase={0}
              color='url(#waterFill)'
              opacity={0.95}
              tank={TANK}
            />
            <WaterTankWave
              level={Math.max(0, targetLevel - 0.05)}
              amplitude={state === 'active' ? 1.8 : 1}
              speed={state === 'active' ? 1900 : 3200}
              phase={1.2}
              color='url(#waterFill2)'
              opacity={0.65}
              tank={TANK}
            />

            <WaterTankBubbles
              level={targetLevel}
              tank={TANK}
              speed={state === 'active' ? 1.4 : 1}
            />

            <WaterSphereSpecular opacity={0.18} tank={TANK} />
          </G>

          <Rect
            x={TANK.x}
            y={TANK.y}
            width={TANK.w}
            height={TANK.h}
            rx={TANK.rx}
            fill='none'
            stroke={SPHERE_PALETTE.stroke}
            strokeWidth={1.2}
          />

          <G>
            <Rect
              x={TANK.x + TANK.w / 2 - TANK.spoutW / 2}
              y={TANK.spoutY}
              width={TANK.spoutW}
              height={TANK.spoutH}
              rx={2}
              fill='url(#spoutFill)'
            />
            <Rect
              x={TANK.x + TANK.w / 2 - 1.5}
              y={TANK.spoutY + TANK.spoutH}
              width={3}
              height={4}
              fill='#1e293b'
            />
          </G>

          {showScale && (
            <G>
              {SPHERE_SCALE.ticks.map((tick) => {
                const ratio = tick / SPHERE_SCALE.max
                const y = TANK.y + 6 + (1 - ratio) * (TANK.h - 12)
                const isMajor = tick % 250 === 0
                return (
                  <G key={`tick-${tick}`}>
                    <Rect
                      x={TANK.x + TANK.w + 2}
                      y={y - 0.5}
                      width={isMajor ? 6 : 3.5}
                      height={1}
                      fill={isMajor ? '#64748b' : '#94a3b8'}
                    />
                    {isMajor ? (
                      <SvgText
                        x={TANK.x + TANK.w + 9}
                        y={y + 2.5}
                        fontSize={6.5}
                        fontWeight='600'
                        fill='#475569'
                      >
                        {tick}
                      </SvgText>
                    ) : null}
                  </G>
                )
              })}
            </G>
          )}
        </Svg>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

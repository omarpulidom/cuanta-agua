import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg'
import { Colors } from '@/components/colors'
import { DROP_PATH_MINI } from './constants'

type WaterDropProps = {
  size?: number
  active?: boolean
  color?: string
  showWaves?: boolean
}

export function WaterDrop({
  size = 18,
  active = false,
  color = Colors.shine.glow,
  showWaves = false,
}: WaterDropProps) {
  const breath = useSharedValue(0)

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, {
        duration: 2000,
      }),
      -1,
      true,
    )
  }, [
    breath,
  ])

  const style = useAnimatedStyle(() => {
    const s = active ? 1.1 + breath.value * 0.06 : 1 + breath.value * 0.04
    return {
      transform: [
        { scale: s },
      ],
    }
  })

  return (
    <Animated.View style={style}>
      {showWaves && (
        <View
          pointerEvents='none'
          style={[
            styles.waveWrap,
            {
              width: size * 2.4,
              height: size * 2.4,
              left: -size * 0.7,
              top: -size * 0.7,
              borderRadius: size * 1.2,
            },
          ]}
        >
          <View
            style={[
              styles.wave,
              {
                width: size * 2.4,
                height: size * 2.4,
                borderRadius: size * 1.2,
                backgroundColor: color,
                opacity: 0.18,
              },
            ]}
          />
        </View>
      )}
      <Svg
        width={size}
        height={size * 1.3}
        viewBox='0 0 18 22'
      >
        <Defs>
          <LinearGradient id='dropFill' x1='0' y1='0' x2='0' y2='1'>
            <Stop offset='0' stopColor={color} stopOpacity={0.95} />
            <Stop offset='1' stopColor={Colors.shine.glowStrong} />
          </LinearGradient>
        </Defs>
        <Path
          d={DROP_PATH_MINI}
          fill='url(#dropFill)'
          stroke='#ffffff'
          strokeOpacity={0.5}
          strokeWidth={0.5}
        />
        <Path
          d='M 6 7 C 6 5, 8 3, 10 3'
          stroke='#ffffff'
          strokeOpacity={0.7}
          strokeWidth={0.8}
          fill='none'
          strokeLinecap='round'
        />
      </Svg>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  waveWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
  },
})

import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

type GlowProps = {
  size: number
  color: string
  intensity?: number
}

export function WaterSphereGlow({ size, color, intensity = 0.5 }: GlowProps) {
  const breath = useSharedValue(0)

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, {
        duration: 2800,
      }),
      -1,
      true,
    )
  }, [
    breath,
  ])

  const animatedStyle = useAnimatedStyle(() => {
    const scale = 1 + breath.value * 0.18
    const opacity = intensity * (0.55 + breath.value * 0.45)
    return {
      transform: [
        { scale },
      ],
      opacity,
    }
  })

  return (
    <View
      pointerEvents='none'
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
        },
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: size / 2,
            backgroundColor: color,
            shadowColor: color,
            shadowOpacity: 1,
            shadowRadius: 32,
            shadowOffset: {
              width: 0,
              height: 0,
            },
          },
          animatedStyle,
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

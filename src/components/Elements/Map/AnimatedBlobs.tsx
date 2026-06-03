import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { Colors } from '@/components/colors'

const BLOB_COLORS = [
  Colors.water.sourcePotable,
  Colors.water.sourceRain,
  Colors.water.sourceRecycled,
]

type AnimatedBlobsProps = {
  width: number
  height: number
}

function FloatingBlob({
  size,
  color,
  startX,
  startY,
  duration,
}: {
  size: number
  color: string
  startX: number
  startY: number
  duration: number
}) {
  const t = useSharedValue(0)

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, {
        duration,
      }),
      -1,
      true,
    )
  }, [
    duration,
    t,
  ])

  const style = useAnimatedStyle(() => {
    const dx = Math.sin(t.value * Math.PI * 2) * 40
    const dy = Math.cos(t.value * Math.PI * 2) * 30
    const scale = 0.9 + Math.sin(t.value * Math.PI * 2) * 0.08
    return {
      transform: [
        { translateX: dx },
        { translateY: dy },
        { scale },
      ],
    }
  })

  return (
    <Animated.View
      pointerEvents='none'
      style={[
        styles.blob,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: startX,
          top: startY,
        },
        style,
      ]}
    />
  )
}

export function AnimatedBlobs({ width, height }: AnimatedBlobsProps) {
  return (
    <View
      pointerEvents='none'
      style={[
        StyleSheet.absoluteFill,
        {
          width,
          height,
        },
      ]}
    >
      <FloatingBlob
        size={width * 0.9}
        color={BLOB_COLORS[0]}
        startX={-width * 0.2}
        startY={height * 0.05}
        duration={18000}
      />
      <FloatingBlob
        size={width * 0.7}
        color={BLOB_COLORS[1]}
        startX={width * 0.55}
        startY={height * 0.4}
        duration={22000}
      />
      <FloatingBlob
        size={width * 0.5}
        color={BLOB_COLORS[2]}
        startX={width * 0.1}
        startY={height * 0.6}
        duration={16000}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    opacity: 0.12,
  },
})

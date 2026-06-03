import { Ionicons } from '@expo/vector-icons'
import { useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { useLayerStore } from '@/store/useLayerStore'
import { Easings, useHaptic } from '@/lib/animation'
import { Colors } from '@/components/colors'

type MapFABProps = {
  onPress?: () => void
}

export function MapFAB({ onPress }: MapFABProps) {
  const activeLayer = useLayerStore((s) => s.activeLayer)
  const setActiveLayer = useLayerStore((s) => s.setActiveLayer)
  const haptic = useHaptic()
  const pulse = useSharedValue(0)

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, {
        duration: 2200,
        easing: Easings.smoothInOut,
      }),
      -1,
      true,
    )
  }, [
    pulse,
  ])

  const glowStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 + pulse.value * 0.25 },
    ],
    opacity: 0.4 + pulse.value * 0.3,
  }))

  const cycleLayer = () => {
    haptic.light()
    const order: Array<'weather' | 'water' | 'both'> = ['both', 'weather', 'water']
    const idx = order.indexOf(activeLayer)
    setActiveLayer(order[(idx + 1) % order.length]!)
    onPress?.()
  }

  const label = activeLayer === 'both' ? 'Ambas' : activeLayer === 'weather' ? 'Clima' : 'Agua'

  return (
    <View style={styles.wrap} pointerEvents='box-none'>
      <Animated.View
        pointerEvents='none'
        style={[
          styles.glow,
          glowStyle,
        ]}
      />
      <TouchableOpacity
        onPress={cycleLayer}
        activeOpacity={0.85}
        accessibilityRole='button'
        accessibilityLabel={`Cambiar capa activa. Actual: ${label}`}
        style={styles.fab}
      >
        <Ionicons
          name='layers-outline'
          size={22}
          color='white'
        />
        <Text className='font-montserrat-bold text-white text-[10px] mt-0.5'>
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 18,
    bottom: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.shine.glow,
    shadowColor: Colors.shine.glow,
    shadowOpacity: 1,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.shine.glow,
    shadowColor: Colors.shine.glowStrong,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 8,
  },
})

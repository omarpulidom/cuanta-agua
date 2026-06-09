import { Ionicons } from '@expo/vector-icons'
import { useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { useLayerStore, type BimestreView } from '@/store/useLayerStore'
import { Easings, useHaptic } from '@/lib/animation'
import { Colors } from '@/components/colors'

type MapFABProps = {
  onPress?: () => void
}

const ORDER: BimestreView[] = [1, 2, 3, 'total']

const SHORT_LABELS: Record<BimestreView, string> = {
  1: 'B1',
  2: 'B2',
  3: 'B3',
  total: 'Total',
}

const FULL_LABELS: Record<BimestreView, string> = {
  1: 'Bimestre 1',
  2: 'Bimestre 2',
  3: 'Bimestre 3',
  total: 'Suma de los 3 bimestres',
}

export function MapFAB({ onPress }: MapFABProps) {
  const bimestreView = useLayerStore((s) => s.bimestreView)
  const setBimestreView = useLayerStore((s) => s.setBimestreView)
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
  }, [pulse])

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.25 }],
    opacity: 0.4 + pulse.value * 0.3,
  }))

  const cycleBimestre = () => {
    haptic.light()
    const idx = ORDER.indexOf(bimestreView)
    const next = ORDER[(idx + 1) % ORDER.length]!
    setBimestreView(next)
    onPress?.()
  }

  return (
    <View style={styles.wrap} pointerEvents='box-none'>
      <Animated.View pointerEvents='none' style={[styles.glow, glowStyle]} />
      <TouchableOpacity
        onPress={cycleBimestre}
        activeOpacity={0.85}
        accessibilityRole='button'
        accessibilityLabel={`Cambiar bimestre. Actual: ${FULL_LABELS[bimestreView]}`}
        style={styles.fab}
      >
        <Ionicons name='calendar-outline' size={20} color='white' />
        <Text className='font-montserrat-extrabold text-white text-sm mt-0.5'>
          {SHORT_LABELS[bimestreView]}
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

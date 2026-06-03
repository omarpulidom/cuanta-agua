import { Ionicons } from '@expo/vector-icons'
import { Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useEffect } from 'react'
import { Colors } from '@/components/colors'
import { ReanimatedCountText } from './DetailSheet.Header'
import { DetailCard } from './DetailSheet.Card'

type DetailSheetComparativaProps = {
  current: number
  previous: number
  unit: string
  label?: string
}

export function DetailSheetComparativa({
  current,
  previous,
  unit,
  label = 'Consumo total',
}: DetailSheetComparativaProps) {
  const delta = current - previous
  const deltaPct = previous === 0 ? 0 : (delta / previous) * 100
  const isUp = delta > 0
  const isDown = delta < 0
  const isFlat = delta === 0

  const color = isUp ? Colors.status.alert : isDown ? Colors.status.ok : Colors.gray[500]
  const iconName = isUp ? 'trending-up' : isDown ? 'trending-down' : 'remove'

  const slideX = useSharedValue(20)
  const opacity = useSharedValue(0)

  useEffect(() => {
    slideX.value = withTiming(0, { duration: 500 })
    opacity.value = withTiming(1, { duration: 500 })
  }, [
    current,
    previous,
    opacity,
    slideX,
  ])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
    opacity: opacity.value,
  }))

  return (
    <DetailCard>
      <View className='flex-row items-center justify-between mb-2'>
        <Text className='font-montserrat-extrabold text-sm text-gray-900'>
          {label} · vs bimestre anterior
        </Text>
      </View>
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          },
          animStyle,
        ]}
      >
        <Ionicons
          name={iconName}
          size={20}
          color={color}
        />
        <ReanimatedCountText
          value={Math.abs(delta)}
          className='font-montserrat-extrabold text-xl'
          format={(n: number) => n.toFixed(0)}
        />
        <Text
          className='font-montserrat-bold text-sm'
          style={{ color }}
        >
          {unit}
        </Text>
        <Text
          className='font-montserrat-medium text-sm'
          style={{ color }}
        >
          ({isUp ? '+' : isDown ? '' : ''}
          {deltaPct.toFixed(1)}%)
        </Text>
        {isFlat ? (
          <Text className='font-montserrat-light text-xs text-gray-500 ml-auto'>
            Sin cambio
          </Text>
        ) : null}
      </Animated.View>
    </DetailCard>
  )
}

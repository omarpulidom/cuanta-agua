import { Ionicons } from '@expo/vector-icons'
import { ScrollView, Text, View } from 'react-native'
import { DetailCard } from './DetailSheet.Card'
import { ReanimatedCountText } from './DetailSheet.Header'
import { Colors } from '@/components/colors'

type Source = {
  key: string
  label: string
  value: number
  color: string
  icon: React.ComponentProps<typeof Ionicons>['name']
}

type DetailSheetSourcesProps = {
  potable: number
  rain: number
  residual: number
  recycled: number
}

function getStatus(value: number) {
  if (value >= 50) return { color: Colors.status.ok, label: 'Óptimo' }
  if (value >= 20) return { color: Colors.status.warn, label: 'Normal' }
  return { color: Colors.status.alert, label: 'Bajo' }
}

export function DetailSheetSources({
  potable,
  rain,
  residual,
  recycled,
}: DetailSheetSourcesProps) {
  const sources: Source[] = [
    {
      key: 'potable',
      label: 'Potable',
      value: potable,
      color: Colors.water.sourcePotable,
      icon: 'water',
    },
    {
      key: 'rain',
      label: 'Lluvia',
      value: rain,
      color: Colors.water.sourceRain,
      icon: 'rainy',
    },
    {
      key: 'residual',
      label: 'Residual',
      value: residual,
      color: Colors.water.sourceResidual,
      icon: 'thermometer',
    },
    {
      key: 'recycled',
      label: 'Reciclada',
      value: recycled,
      color: Colors.water.sourceRecycled,
      icon: 'sync',
    },
  ]

  return (
    <View className='px-5 pt-4'>
      <Text className='font-montserrat-extrabold text-sm uppercase tracking-wider text-gray-500 mb-2 px-1'>
        Desglose por fuente
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 10,
          paddingRight: 20,
        }}
      >
        {sources.map((src) => {
          const status = getStatus(src.value)
          return (
            <View
              key={src.key}
              style={{ width: 100 }}
            >
              <DetailCard style={{ padding: 10 }}>
                <View className='items-center' style={{ gap: 6 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: `${src.color}22`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: src.color,
                      shadowOpacity: 0.5,
                      shadowRadius: 8,
                      shadowOffset: {
                        width: 0,
                        height: 0,
                      },
                    }}
                  >
                    <Ionicons
                      name={src.icon}
                      size={18}
                      color={src.color}
                    />
                  </View>
                  <Text className='font-montserrat-semibold text-xs text-gray-900'>
                    {src.label}
                  </Text>
                  <View className='flex-row items-end gap-0.5'>
                    <ReanimatedCountText
                      value={src.value}
                      className='font-montserrat-extrabold text-lg text-gray-900'
                    />
                    <Text className='font-montserrat-medium text-[10px] text-gray-500 mb-0.5'>
                      %
                    </Text>
                  </View>
                  <View
                    className='flex-row items-center gap-1 px-2 py-0.5 rounded-full'
                    style={{ backgroundColor: `${status.color}1f` }}
                  >
                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 3,
                        backgroundColor: status.color,
                      }}
                    />
                    <Text
                      className='font-montserrat-medium text-[9px]'
                      style={{ color: status.color }}
                    >
                      {status.label}
                    </Text>
                  </View>
                </View>
              </DetailCard>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

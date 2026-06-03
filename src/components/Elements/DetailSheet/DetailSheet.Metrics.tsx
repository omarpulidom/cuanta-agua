import { Ionicons } from '@expo/vector-icons'
import { Text, View } from 'react-native'
import { DetailCard } from './DetailSheet.Card'
import { ReanimatedCountText } from './DetailSheet.Header'
import { Colors } from '@/components/colors'

export type MetricItem = {
  key: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  label: string
  value: number
  unit: string
  precision?: number
  color?: string
}

function MetricTile({ item }: { item: MetricItem }) {
  const accent = item.color ?? '#0ea5e9'
  return (
    <DetailCard style={{ flex: 1 }}>
      <View className='flex-row items-center gap-2 mb-2'>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: `${accent}22`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={item.icon} size={14} color={accent} />
        </View>
        <Text
          className='font-montserrat-light text-[11px] text-gray-500 flex-1'
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </View>
      <View className='flex-row items-end gap-1'>
        <ReanimatedCountText
          value={item.value}
          format={(n: number) => n.toFixed(item.precision ?? 0)}
          className='font-montserrat-extrabold text-2xl text-gray-900'
        />
        <Text className='font-montserrat-medium text-xs text-gray-500 mb-0.5'>
          {item.unit}
        </Text>
      </View>
    </DetailCard>
  )
}

type Section = {
  title: string
  metrics: MetricItem[]
}

type DetailSheetMetricsProps = {
  sections: Section[]
}

export function DetailSheetMetrics({ sections }: DetailSheetMetricsProps) {
  return (
    <View className='px-5 pt-3 gap-4'>
      {sections.map((section) => (
        <View key={section.title}>
          <Text className='font-montserrat-extrabold text-xs uppercase tracking-wider text-gray-500 mb-2 px-1'>
            {section.title}
          </Text>
          <View className='flex-row gap-2.5 flex-wrap'>
            {section.metrics.map((m) => (
              <View
                key={m.key}
                style={{ width: '47%' }}
              >
                <MetricTile item={m} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  )
}

void Colors

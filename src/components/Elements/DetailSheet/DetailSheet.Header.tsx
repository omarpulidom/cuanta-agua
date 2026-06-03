import { Ionicons } from '@expo/vector-icons'
import { useEffect } from 'react'
import { Text, View } from 'react-native'
import Reanimated, {
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated'
import { TextInput } from 'react-native'
import { Colors } from '@/components/colors'
import { WaterDrop } from '@/components/Elements/WaterSphere'
import { BimestreSelector } from '@/components/Elements/BimestreSelector'
import { INDICE_DES_COLORS, INDICE_DES_LABELS, type IndiceDes } from '@/api/IndiceDes/IndiceDes.Schemas'
import type { Bimestre } from '@/lib/bimestre'
import type { DisponibilidadStatus } from '@/lib/mockData'

const AnimatedTextInput = Reanimated.createAnimatedComponent(TextInput)

export function ReanimatedCountText({
  value,
  className,
  format = (n: number) => Math.round(n).toString(),
}: {
  value: number
  className?: string
  format?: (n: number) => string
}) {
  const shared = useSharedValue<string>(format(value))
  useEffect(() => {
    shared.value = format(value)
  }, [
    value,
    format,
    shared,
  ])
  const animatedProps = useAnimatedProps(() => ({
    text: shared.value,
    defaultValue: shared.value,
  }))
  return (
    <AnimatedTextInput
      editable={false}
      animatedProps={animatedProps}
      className={className}
      style={{
        padding: 0,
        margin: 0,
        minWidth: 24,
      }}
    />
  )
}

const STATUS_COLORS: Record<DisponibilidadStatus, string> = {
  ok: Colors.status.ok,
  warn: Colors.status.warn,
  alert: Colors.status.alert,
}

const STATUS_LABELS: Record<DisponibilidadStatus, string> = {
  ok: 'Disponibilidad estable',
  warn: 'Consumo elevado',
  alert: 'Consumo crítico',
}

type DetailSheetHeaderProps = {
  coloniaNombre: string
  alcaldia: string
  cp: string
  indiceDes: IndiceDes
  disponibilidadIndex: number
  status: DisponibilidadStatus
  bimestre: Bimestre
  anio: number
  onChangeBimestre: (b: Bimestre, a: number) => void
}

export function DetailSheetHeader({
  coloniaNombre,
  alcaldia,
  cp,
  indiceDes,
  disponibilidadIndex,
  status,
  bimestre,
  anio,
  onChangeBimestre,
}: DetailSheetHeaderProps) {
  const statusColor = STATUS_COLORS[status]
  const statusLabel = STATUS_LABELS[status]
  const indiceColor = INDICE_DES_COLORS[indiceDes]

  return (
    <View className='px-5 pt-1 pb-3'>
      <View className='flex-row items-start justify-between gap-3 mb-3'>
        <View className='flex-1'>
          <Text className='font-montserrat-extrabold text-2xl text-gray-900' numberOfLines={2}>
            {coloniaNombre}
          </Text>
          <View className='flex-row items-center gap-2 mt-1 flex-wrap'>
            <Text className='font-montserrat-medium text-sm text-gray-600'>
              {alcaldia}
            </Text>
            <View className='w-1 h-1 rounded-full bg-gray-300' />
            <Text className='font-montserrat-medium text-sm text-gray-500'>
              CP {cp}
            </Text>
          </View>
        </View>
        <BimestreSelector
          bimestre={bimestre}
          anio={anio}
          onChange={onChangeBimestre}
        />
      </View>

      <View className='flex-row items-center gap-2 flex-wrap'>
        <View
          className='flex-row items-center gap-1.5 px-2.5 py-1 rounded-full'
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderWidth: 1,
            borderColor: 'rgba(14,165,233,0.2)',
          }}
        >
          <WaterDrop size={12} active />
          <ReanimatedCountText
            value={disponibilidadIndex}
            className='font-montserrat-extrabold text-sm text-primary-700'
          />
          <Text className='font-montserrat-semibold text-xs text-gray-900'>
            % disponible
          </Text>
        </View>

        <View
          className='flex-row items-center gap-1.5 px-2.5 py-1 rounded-full'
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderWidth: 1,
            borderColor: `${indiceColor}40`,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: indiceColor,
            }}
          />
          <Text
            className='font-montserrat-semibold text-xs'
            style={{ color: indiceColor }}
          >
            {INDICE_DES_LABELS[indiceDes]}
          </Text>
        </View>

        <View
          className='flex-row items-center gap-1.5 px-2.5 py-1 rounded-full'
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderWidth: 1,
            borderColor: `${statusColor}40`,
          }}
        >
          <Ionicons
            name={
              status === 'ok'
                ? 'checkmark-circle'
                : status === 'warn'
                  ? 'alert-circle'
                  : 'warning'
            }
            size={12}
            color={statusColor}
          />
          <Text
            className='font-montserrat-semibold text-xs'
            style={{ color: statusColor }}
          >
            {statusLabel}
          </Text>
        </View>
      </View>
    </View>
  )
}

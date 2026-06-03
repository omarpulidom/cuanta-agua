import { Ionicons } from '@expo/vector-icons'
import { ScrollView, Text, View } from 'react-native'
import { DetailCard } from './DetailSheet.Card'
import { ReanimatedCountText } from './DetailSheet.Header'
import { Colors } from '@/components/colors'
import type { IndiceDes } from '@/api/IndiceDes/IndiceDes.Schemas'
import { INDICE_DES_COLORS } from '@/api/IndiceDes/IndiceDes.Schemas'

export type ColoniaCard = {
  codigo_id: string
  codigo: string
  colonia_nombre: string
  municipio_nombre: string
  consumo_total: number
  disponibilidadIndex: number
  status: 'ok' | 'warn' | 'alert'
  indice_des: IndiceDes
}

type DetailSheetColoniasProps = {
  colonias: ColoniaCard[]
  selectedId?: string | null
  onSelect?: (codigoId: string) => void
}

const STATUS_COLORS = {
  ok: Colors.status.ok,
  warn: Colors.status.warn,
  alert: Colors.status.alert,
}

export function DetailSheetColonias({
  colonias,
  selectedId,
  onSelect,
}: DetailSheetColoniasProps) {
  if (colonias.length === 0) return null
  return (
    <View className='px-5 pt-4'>
      <View className='flex-row items-center justify-between mb-3 px-1'>
        <Text className='font-montserrat-extrabold text-sm text-gray-900'>
          {colonias.length === 1
            ? 'Colonia en este CP'
            : `${colonias.length} colonias en este CP`}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 10,
          paddingRight: 20,
        }}
      >
        {colonias.map((c) => {
          const isSelected = c.codigo_id === selectedId
          const statusColor = STATUS_COLORS[c.status]
          const indiceColor = INDICE_DES_COLORS[c.indice_des]
          return (
            <View
              key={c.codigo_id}
              style={{
                width: 200,
              }}
            >
              <DetailCard
                style={{
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? Colors.shine.glow : 'rgba(255,255,255,0.6)',
                }}
              >
                <View
                  onTouchEnd={() => onSelect?.(c.codigo_id)}
                  style={{ gap: 8 }}
                >
                  <View className='flex-row items-center gap-2'>
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: indiceColor,
                      }}
                    />
                    <Text
                      className='font-montserrat-extrabold text-sm text-gray-900 flex-1'
                      numberOfLines={1}
                    >
                      {c.colonia_nombre}
                    </Text>
                  </View>
                  <Text className='font-montserrat-light text-[10px] text-gray-500' numberOfLines={1}>
                    {c.municipio_nombre}
                  </Text>
                  <View className='flex-row items-end gap-1 mt-1'>
                    <ReanimatedCountText
                      value={c.consumo_total}
                      className='font-montserrat-extrabold text-xl text-gray-900'
                    />
                    <Text className='font-montserrat-medium text-[10px] text-gray-500 mb-0.5'>
                      m³
                    </Text>
                  </View>
                  <View className='flex-row items-center gap-1 mt-1'>
                    <Ionicons
                      name='water'
                      size={10}
                      color={Colors.shine.glow}
                    />
                    <Text className='font-montserrat-medium text-[10px] text-gray-600'>
                      {c.disponibilidadIndex}% disp.
                    </Text>
                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: statusColor,
                      }}
                    />
                    <Text
                      className='font-montserrat-medium text-[10px]'
                      style={{ color: statusColor }}
                    >
                      {c.status === 'ok' ? 'OK' : c.status === 'warn' ? 'Alerta' : 'Crítico'}
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

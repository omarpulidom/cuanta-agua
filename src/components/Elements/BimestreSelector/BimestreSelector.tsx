import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Colors } from '@/components/colors'
import { BIMESTRE_FULL_LABELS, type Bimestre } from '@/lib/bimestre'

type BimestreSelectorProps = {
  bimestre: Bimestre
  anio: number
  aniosDisponibles?: number[]
  onChange: (b: Bimestre, a: number) => void
}

export function BimestreSelector({
  bimestre,
  anio,
  aniosDisponibles,
  onChange,
}: BimestreSelectorProps) {
  const [open, setOpen] = useState(false)
  const [tempAnio, setTempAnio] = useState(anio)

  const anios = aniosDisponibles ?? [anio, anio - 1, anio - 2, anio - 3, anio - 4, anio - 5]

  const handleSelectBimestre = (b: Bimestre) => {
    onChange(b, tempAnio)
    setOpen(false)
  }

  const handleSelectAnio = (a: number) => {
    setTempAnio(a)
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.pill}
        accessibilityRole='button'
      >
        <Ionicons name='calendar-outline' size={14} color={Colors.shine.glowStrong} />
        <Text className='font-montserrat-semibold text-xs text-primary-700'>
          B{bimestre} · {anio}
        </Text>
        <Ionicons name='chevron-down' size={12} color={Colors.shine.glowStrong} />
      </Pressable>

      <Modal
        visible={open}
        animationType='fade'
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
        >
          <Pressable
            style={styles.card}
            onPress={(e) => e.stopPropagation()}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
              style={StyleSheet.absoluteFill}
            />
            <Text className='font-montserrat-extrabold text-base text-gray-900 mb-3 px-1'>
              Selecciona bimestre
            </Text>

            <View style={styles.aniosRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: 6,
                  paddingHorizontal: 4,
                }}
              >
                {anios.map((a) => (
                  <Pressable
                    key={a}
                    onPress={() => handleSelectAnio(a)}
                    style={[
                      styles.anioChip,
                      tempAnio === a && {
                        backgroundColor: Colors.shine.glow,
                      },
                    ]}
                  >
                    <Text
                      className={`font-montserrat-bold text-sm ${
                        tempAnio === a ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {a}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.bimestresGrid}>
              {([1, 2, 3, 4, 5, 6] as Bimestre[]).map((b) => (
                <Pressable
                  key={b}
                  onPress={() => handleSelectBimestre(b)}
                  style={[
                    styles.bimestreTile,
                    bimestre === b && tempAnio === anio && styles.bimestreTileActive,
                  ]}
                >
                  <Text
                    className={`font-montserrat-extrabold text-lg ${
                      bimestre === b && tempAnio === anio ? 'text-primary-700' : 'text-gray-900'
                    }`}
                  >
                    {b}
                  </Text>
                  <Text
                    className={`font-montserrat-medium text-[10px] mt-0.5 ${
                      bimestre === b && tempAnio === anio ? 'text-primary-600' : 'text-gray-500'
                    }`}
                  >
                    {BIMESTRE_FULL_LABELS[b].split(' (')[1]?.replace(')', '')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.2)',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.shine.glassBorder,
    shadowColor: Colors.shine.glow,
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 10,
    overflow: 'hidden',
  },
  aniosRow: {
    marginBottom: 12,
  },
  anioChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.15)',
  },
  bimestresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bimestreTile: {
    width: '31%',
    aspectRatio: 1.4,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bimestreTileActive: {
    backgroundColor: 'rgba(14,165,233,0.12)',
    borderColor: Colors.shine.glow,
  },
})

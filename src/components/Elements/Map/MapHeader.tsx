import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { useMemo, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@/components/colors'
import { UbicacionService } from '@/api/Ubicacion/Ubicacion.Service'
import { useQuery } from '@tanstack/react-query'

type MapHeaderProps = {
  onSelectSearchResult?: (
    codigoId: string,
    cp: string,
    coordinates: [number, number],
    coloniaNombre: string,
    alcaldia: string,
  ) => void
}

type SearchColonia = {
  id: string
  cp: string
  colonia_nombre: string
  municipio_nombre: string
  lat: number
  lon: number
}

export function MapHeader({ onSelectSearchResult }: MapHeaderProps) {
  const insets = useSafeAreaInsets()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [alcaldiaFilter, setAlcaldiaFilter] = useState<string | undefined>(undefined)

  const { data: alcaldias } = useQuery({
    queryKey: ['ubicacion', 'alcaldias', 'list'],
    queryFn: () => UbicacionService.listAlcaldias(),
    staleTime: 24 * 60 * 60 * 1000,
    enabled: open,
  })

  const { data: coloniasRaw } = useQuery({
    queryKey: ['ubicacion', 'colonias', 'list', alcaldiaFilter],
    queryFn: () => UbicacionService.listColonias(alcaldiaFilter),
    staleTime: 24 * 60 * 60 * 1000,
    enabled: open,
  })

  const { data: alcaldiasForMap } = useQuery({
    queryKey: ['ubicacion', 'ubicaciones', 'alcaldias', 'search'],
    queryFn: () => UbicacionService.getAlcaldiasForMap(),
    staleTime: 5 * 60 * 1000,
    enabled: open,
  })

  const { data: coloniasForMap } = useQuery({
    queryKey: ['ubicacion', 'ubicaciones', 'colonias', 'search', alcaldiaFilter],
    queryFn: () => UbicacionService.getColoniasForMap({ alcaldia: alcaldiaFilter, limit: 500 }),
    staleTime: 5 * 60 * 1000,
    enabled: open,
  })

  const results: SearchColonia[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []

    const items: SearchColonia[] = []

    // alcaldias match
    if (alcaldiasForMap) {
      for (const a of alcaldiasForMap) {
        if (!a.alcaldia) continue
        if (
          a.alcaldia.toLowerCase().includes(q) ||
          a.alcaldia.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(q.normalize('NFD').replace(/\p{Diacritic}/gu, ''))
        ) {
          if (a.lat != null && a.lon != null) {
            items.push({
              id: `alc-${a.alcaldia}`,
              cp: '',
              colonia_nombre: a.alcaldia,
              municipio_nombre: 'Alcaldía',
              lat: a.lat,
              lon: a.lon,
            })
          }
        }
      }
    }

    // colonias match (name from /api/colonias, coords from /api/ubicaciones/colonias)
    if (coloniasRaw && coloniasForMap) {
      const matches = coloniasRaw.filter((c) => c.toLowerCase().includes(q))
      for (const c of matches) {
        const found = coloniasForMap.find((m) => m.colonia === c)
        if (found) {
          items.push({
            id: `col-${found.alcaldia}-${c}`,
            cp: '',
            colonia_nombre: c,
            municipio_nombre: found.alcaldia,
            lat: found.lat,
            lon: found.lon,
          })
        }
      }
    }

    return items.slice(0, 25)
  }, [query, alcaldiasForMap, coloniasRaw, coloniasForMap])

  void alcaldias

  const handleSelect = (item: SearchColonia) => {
    // alcaldia canonical is always the municipio_nombre when searching colonias.
    // When the item itself is an alcaldia, the search uses that as colonia_nombre
    // and a sentinel "Alcaldía" as municipio_nombre; we treat the alcaldia form
    // by calling the callback with the canonical name.
    const isAlcaldiaHit = item.municipio_nombre === 'Alcaldía'
    if (isAlcaldiaHit) {
      onSelectSearchResult?.(item.id, '', [item.lon, item.lat], item.colonia_nombre, item.colonia_nombre)
    } else {
      onSelectSearchResult?.(item.id, item.cp, [item.lon, item.lat], item.colonia_nombre, item.municipio_nombre)
    }
    setOpen(false)
    setQuery('')
  }

  return (
    <>
      <View
        style={[
          styles.wrap,
          {
            top: insets.top + 8,
          },
        ]}
        pointerEvents='box-none'
      >
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.glass}
        >
          <BlurView
            intensity={30}
            tint='light'
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.row}>
            <View style={styles.titleGroup}>
              <View style={styles.pin}>
                <View style={styles.pinDot} />
              </View>
              <View>
                <Text className='font-montserrat-extrabold text-base text-gray-900'>
                  ¿Cuánta agua?
                </Text>
                <Text className='font-montserrat-light text-xs text-gray-500'>
                  CDMX
                </Text>
              </View>
            </View>
            <Pressable
              style={styles.searchBtn}
              onPress={() => setOpen(true)}
              accessibilityRole='button'
            >
              <Ionicons name='search' size={18} color={Colors.shine.glowStrong} />
            </Pressable>
          </View>
        </Animated.View>
      </View>

      <Modal
        visible={open}
        animationType='fade'
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setOpen(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            <BlurView
              intensity={50}
              tint='light'
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.searchInputWrap}>
              <Ionicons name='search' size={18} color={Colors.shine.glowStrong} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder='Buscar alcaldía o colonia...'
                placeholderTextColor={Colors.gray[500]}
                autoFocus
                style={styles.input}
                returnKeyType='search'
              />
              <Pressable onPress={() => setOpen(false)}>
                <Text className='font-montserrat-semibold text-sm text-primary-600'>
                  Cancelar
                </Text>
              </Pressable>
            </View>
            <View style={styles.results}>
              {query.trim().length < 2 ? (
                <Text className='font-montserrat-light text-sm text-gray-500 text-center mt-6'>
                  Escribe al menos 2 caracteres
                </Text>
              ) : results.length === 0 ? (
                <Text className='font-montserrat-light text-sm text-gray-500 text-center mt-6'>
                  Sin resultados
                </Text>
              ) : (
                results.map((r) => (
                  <Pressable
                    key={r.id}
                    style={styles.resultItem}
                    onPress={() => handleSelect(r)}
                  >
                    <View>
                      <Text className='font-montserrat-semibold text-sm text-gray-900'>
                        {r.colonia_nombre}
                      </Text>
                      <Text className='font-montserrat-light text-xs text-gray-500 mt-0.5'>
                        {r.municipio_nombre}
                      </Text>
                    </View>
                    <Ionicons name='chevron-forward' size={18} color={Colors.gray[400]} />
                  </Pressable>
                ))
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  glass: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.shine.glassBorder,
    backgroundColor: Colors.shine.glass,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: Colors.shine.glow,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.shine.glow,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shine.glow,
    shadowOpacity: 0.7,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.2)',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingTop: 80,
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 24,
    overflow: 'hidden',
    maxHeight: '80%',
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
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(14,165,233,0.1)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111',
    fontFamily: 'Montserrat_500Medium',
    padding: 0,
  },
  results: {
    paddingVertical: 6,
    maxHeight: 400,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
})

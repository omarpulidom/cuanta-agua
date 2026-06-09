import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { Ionicons } from '@expo/vector-icons'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Text, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { Camera } from '@rnmapbox/maps'
import type { ComponentRef } from 'react'

type CameraRef = ComponentRef<typeof Camera>

import { UbicacionHooks } from '@/api/Ubicacion/Ubicacion.Hooks'
import { ConsumoHooks, type ConsumoAlcaldia } from '@/api/Consumo/Consumo.Hooks'
import { TiempoHooks } from '@/api/Tiempo/Tiempo.Hooks'
import { useLayerStore, type BimestreView } from '@/store/useLayerStore'
import {
  AnimatedBlobs,
  MapContainer,
  MapFAB,
  MapHeader,
} from '@/components/Elements/Map'
import {
  DetailChart,
  DetailSheet,
  DetailSheetHeader,
  DetailSheetMetrics,
  type MetricItem,
} from '@/components/Elements/DetailSheet'
import { WaterSphere } from '@/components/Elements/WaterSphere'
import { useHaptic } from '@/lib/animation'
import { type Bimestre } from '@/lib/bimestre'
import {
  type DisponibilidadStatus,
  getDisponibilidadStatus,
  getDisponibilidadIndex,
} from '@/lib/disponibilidad'
import { alcaldiaDbToNomgeo } from '@/lib/alcaldia'
import { Colors } from '@/components/colors'

type SelectionState =
  | {
      kind: 'alcaldia'
      /** Canonical DB form used to call the backend (e.g. "CUAUHTEMOC"). */
      alcaldia: string
      /** Pretty display name from the GeoJSON (e.g. "Cuauhtémoc"). */
      display: string
      center: [number, number]
    }
  | {
      kind: 'colonia'
      alcaldia: string
      display: string
      colonia: string
      center: [number, number]
    }
  | null

type ConsumosPorBimestre = {
  1?: ConsumoAlcaldia
  2?: ConsumoAlcaldia
  3?: ConsumoAlcaldia
}

const EMPTY_CONSUMO: ConsumosPorBimestre = {}

const ZERO_CONSUMO: ConsumoAlcaldia = {
  alcaldia: '',
  consumo_total: 0,
  consumo_prom: 0,
  consumo_total_dom: 0,
  consumo_prom_dom: 0,
  consumo_total_mixto: 0,
  consumo_prom_mixto: 0,
  consumo_total_no_dom: 0,
  consumo_prom_no_dom: 0,
  num_colonias: 0,
  num_registros: 0,
  anio_min: null,
  anio_max: null,
  sin_datos: true,
}

export default function MapScreen() {
  const { width, height } = useWindowDimensions()
  const sheetRef = useRef<BottomSheetModal>(null)
  const cameraRef = useRef<CameraRef>(null)
  const haptic = useHaptic()

  const { data: anios } = TiempoHooks.useAnios()
  const { data: bimestres } = TiempoHooks.useBimestres()
  const [bimestre, setBimestre] = useState<Bimestre>(1)
  const [anio, setAnio] = useState<number>(2019)
  const [selection, setSelection] = useState<SelectionState>(null)
  const bimestreView = useLayerStore((s) => s.bimestreView)
  const setActiveLayer = useLayerStore((s) => s.setActiveLayer)

  useEffect(() => {
    if (anios && anios.length > 0) setAnio(anios[anios.length - 1]!)
  }, [anios])

  useEffect(() => {
    if (bimestres && bimestres.length > 0) {
      setBimestre(bimestres[0] as Bimestre)
    }
  }, [bimestres])

  const alcaldiaSeleccionada =
    selection?.kind === 'alcaldia' ? selection.alcaldia : null
  const coloniaSeleccionada =
    selection?.kind === 'colonia' ? selection.colonia : null
  const alcaldiaDeColoniaSeleccionada =
    selection?.kind === 'colonia' ? selection.alcaldia : null

  // Alcaldia path: 3 queries in parallel, one per bimestre.
  const qa1 = ConsumoHooks.useAlcaldia(alcaldiaSeleccionada, anio, 1)
  const qa2 = ConsumoHooks.useAlcaldia(alcaldiaSeleccionada, anio, 2)
  const qa3 = ConsumoHooks.useAlcaldia(alcaldiaSeleccionada, anio, 3)

  // Colonia path: 3 queries in parallel, one per bimestre.
  const qc1 = ConsumoHooks.useByColonia(
    alcaldiaDeColoniaSeleccionada,
    coloniaSeleccionada,
    anio,
    1,
  )
  const qc2 = ConsumoHooks.useByColonia(
    alcaldiaDeColoniaSeleccionada,
    coloniaSeleccionada,
    anio,
    2,
  )
  const qc3 = ConsumoHooks.useByColonia(
    alcaldiaDeColoniaSeleccionada,
    coloniaSeleccionada,
    anio,
    3,
  )

  const consumosAlcaldia: ConsumosPorBimestre = useMemo(() => {
    if (!alcaldiaSeleccionada) return EMPTY_CONSUMO
    return { 1: qa1.data, 2: qa2.data, 3: qa3.data }
  }, [alcaldiaSeleccionada, qa1.data, qa2.data, qa3.data])

  const consumosColonia: ConsumosPorBimestre = useMemo(() => {
    if (!alcaldiaDeColoniaSeleccionada || !coloniaSeleccionada) return EMPTY_CONSUMO
    return { 1: qc1.data, 2: qc2.data, 3: qc3.data }
  }, [alcaldiaDeColoniaSeleccionada, coloniaSeleccionada, qc1.data, qc2.data, qc3.data])

  const isLoadingAlcaldia =
    qa1.isFetching || qa2.isFetching || qa3.isFetching
  const isLoadingColonia = qc1.isFetching || qc2.isFetching || qc3.isFetching
  const isLoadingSelection = selection
    ? selection.kind === 'alcaldia'
      ? isLoadingAlcaldia
      : isLoadingColonia
    : false

  const selectionConsumo: ConsumoAlcaldia = useMemo(() => {
    if (!selection) return ZERO_CONSUMO
    const consumos =
      selection.kind === 'alcaldia' ? consumosAlcaldia : consumosColonia

    if (bimestreView === 'total') {
      const arr = [consumos[1], consumos[2], consumos[3]].filter(
        (c): c is ConsumoAlcaldia => c !== undefined && !c.sin_datos,
      )
      if (arr.length === 0) return { ...ZERO_CONSUMO, alcaldia: selection.alcaldia }
      const sum = (key: keyof ConsumoAlcaldia) =>
        arr.reduce((acc, c) => acc + (Number(c[key]) || 0), 0)
      const avg = (key: keyof ConsumoAlcaldia) => sum(key) / arr.length
      const anios = arr
        .flatMap((c) => [c.anio_min, c.anio_max])
        .filter(Boolean) as number[]
      return {
        alcaldia: arr[0]?.alcaldia ?? selection.alcaldia,
        consumo_total: sum('consumo_total'),
        consumo_prom: avg('consumo_prom'),
        consumo_total_dom: sum('consumo_total_dom'),
        consumo_prom_dom: avg('consumo_prom_dom'),
        consumo_total_mixto: sum('consumo_total_mixto'),
        consumo_prom_mixto: avg('consumo_prom_mixto'),
        consumo_total_no_dom: sum('consumo_total_no_dom'),
        consumo_prom_no_dom: avg('consumo_prom_no_dom'),
        num_colonias: arr[0]?.num_colonias ?? 0,
        num_registros: sum('num_registros'),
        anio_min: anios.length ? Math.min(...anios) : null,
        anio_max: anios.length ? Math.max(...anios) : null,
        sin_datos: false,
      }
    }
    return consumos[bimestreView] ?? { ...ZERO_CONSUMO, alcaldia: selection.alcaldia }
  }, [selection, bimestreView, consumosAlcaldia, consumosColonia])

  const handleSelectAlcaldia = useCallback(
    (alcaldia: string, center: [number, number]) => {
      haptic.light()
      const display = alcaldiaDbToNomgeo(alcaldia) || alcaldia
      setSelection({ kind: 'alcaldia', alcaldia, display, center })
      cameraRef.current?.setCamera({
        centerCoordinate: center,
        zoomLevel: 12,
        animationMode: 'flyTo',
        animationDuration: 1200,
      })
      sheetRef.current?.snapToIndex(0)
    },
    [haptic],
  )

  const handleSelectColonia = useCallback(
    (alcaldia: string, colonia: string, center: [number, number]) => {
      haptic.light()
      const display = alcaldiaDbToNomgeo(alcaldia) || alcaldia
      setSelection({ kind: 'colonia', alcaldia, display, colonia, center })
      cameraRef.current?.setCamera({
        centerCoordinate: center,
        zoomLevel: 15,
        animationMode: 'flyTo',
        animationDuration: 1200,
      })
      sheetRef.current?.snapToIndex(0)
    },
    [haptic],
  )

  const handleDismiss = useCallback(() => {
    setSelection(null)
  }, [])

  const handleChangeBimestre = useCallback(
    (b: Bimestre, a: number) => {
      haptic.selection()
      setBimestre(b)
      setAnio(a)
    },
    [haptic],
  )

  const handleSearchResult = useCallback(
    (alcaldia: string, colonia: string, center: [number, number]) => {
      const isAlcaldiaHit = colonia === alcaldia
      const display = alcaldiaDbToNomgeo(alcaldia) || alcaldia
      if (isAlcaldiaHit) {
        setSelection({ kind: 'alcaldia', alcaldia, display, center })
      } else {
        setSelection({ kind: 'colonia', alcaldia, display, colonia, center })
      }
      setActiveLayer('colonias')
      cameraRef.current?.setCamera({
        centerCoordinate: center,
        zoomLevel: 15,
        animationMode: 'flyTo',
        animationDuration: 1200,
      })
      sheetRef.current?.snapToIndex(0)
    },
    [setActiveLayer],
  )

  const status: DisponibilidadStatus = selectionConsumo
    ? getDisponibilidadStatus(selectionConsumo.consumo_total)
    : 'ok'
  const disponibilidadIndex = selectionConsumo
    ? getDisponibilidadIndex(selectionConsumo.consumo_total)
    : 0

  const unitLabel = 'm³'

  const metricSections: { title: string; metrics: MetricItem[] }[] =
    selection && selectionConsumo && !selectionConsumo.sin_datos
      ? [
          {
            title: 'Consumo',
            metrics: [
              {
                key: 'consumo_total',
                icon: 'water-outline',
                label: 'Total',
                value: Math.round(selectionConsumo.consumo_total),
                unit: unitLabel,
                color: '#0284c7',
              },
              {
                key: 'consumo_prom',
                icon: 'speedometer-outline',
                label: 'Promedio',
                value: Number(selectionConsumo.consumo_prom.toFixed(1)),
                unit: `${unitLabel}/d`,
                precision: 1,
                color: '#06b6d4',
              },
              {
                key: 'consumo_dom',
                icon: 'home-outline',
                label: 'Doméstico',
                value: Math.round(selectionConsumo.consumo_total_dom),
                unit: unitLabel,
                color: '#0ea5e9',
              },
              {
                key: 'consumo_no_dom',
                icon: 'business-outline',
                label: 'No doméstico',
                value: Math.round(selectionConsumo.consumo_total_no_dom),
                unit: unitLabel,
                color: '#f59e0b',
              },
              {
                key: 'consumo_mixto',
                icon: 'git-merge-outline',
                label: 'Mixto',
                value: Math.round(selectionConsumo.consumo_total_mixto),
                unit: unitLabel,
                color: '#8b5cf6',
              },
            ],
          },
        ]
      : []

  const handleHeaderSelect = useCallback(
    (
      _codigoId: string,
      _cp: string,
      coordinates: [number, number],
      coloniaNombre: string,
      alcaldia: string,
    ) => {
      handleSearchResult(alcaldia, coloniaNombre, coordinates)
    },
    [handleSearchResult],
  )

  const hasSelectionData = Boolean(
    selectionConsumo && !selectionConsumo.sin_datos,
  )
  const cardValue = hasSelectionData ? selectionConsumo.consumo_total : 0
  const cardLabel =
    bimestreView === 'total'
      ? 'consumo total (3 bimestres)'
      : `consumo bimestre ${bimestreView}`

  const periodoLabel = useMemo(() => {
    if (bimestreView === 'total') return 'B1 + B2 + B3 · 2019'
    return `B${bimestreView} · ${anio}`
  }, [bimestreView, anio])

  const trendData: number[] = useMemo(() => {
    const consumos =
      selection?.kind === 'alcaldia' ? consumosAlcaldia : consumosColonia
    return [
      consumos[1]?.consumo_total ?? 0,
      consumos[2]?.consumo_total ?? 0,
      consumos[3]?.consumo_total ?? 0,
    ]
  }, [selection, consumosAlcaldia, consumosColonia])

  const cardTitle = !selection
    ? 'Sin selección'
    : selection.kind === 'alcaldia'
      ? selection.display
      : selection.colonia
  const cardSubtitle = !selection
    ? 'consumo bimestral'
    : selection.kind === 'alcaldia'
      ? 'Alcaldía'
      : selection.display
  const cardHint = !selection
    ? 'Toca una alcaldía del mapa'
    : isLoadingSelection
      ? 'Cargando…'
      : selection.kind === 'alcaldia'
        ? hasSelectionData
          ? 'Toca otra alcaldía para cambiar'
          : 'Sin datos para esta alcaldía'
        : hasSelectionData
          ? 'Toca otra colonia para cambiar'
          : 'Sin datos para esta colonia'

  const highlightColonia =
    selection?.kind === 'colonia' ? selection.center : null
  const selectedAlcaldiaForMap =
    selection?.kind === 'alcaldia' ? selection.alcaldia : null

  return (
    <View className='flex-1 bg-water-bg'>
      <AnimatedBlobs width={width} height={height} />

      <View className='flex-1'>
        <MapContainer
          selectedAlcaldia={selectedAlcaldiaForMap}
          highlightColonia={highlightColonia}
          onSelectAlcaldia={handleSelectAlcaldia}
          onSelectColonia={handleSelectColonia}
        />
      </View>

      <SafeAreaView
        edges={['top']}
        className='absolute inset-0'
        pointerEvents='box-none'
      >
        <MapHeader onSelectSearchResult={handleHeaderSelect} />
      </SafeAreaView>

      <SafeAreaView
        edges={['bottom']}
        className='absolute bottom-0 left-0 right-0'
        pointerEvents='box-none'
      >
        <Animated.View
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(300)}
          style={{
            position: 'absolute',
            left: 16,
            bottom: 120,
            maxWidth: 260,
          }}
        >
          {selection ? (
            <View
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                paddingVertical: 8,
                paddingHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                shadowColor: '#0f172a',
                shadowOpacity: 0.18,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 28,
                  borderRadius: 3,
                  backgroundColor: '#0ea5e9',
                }}
              />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  className='font-montserrat-extrabold text-xs text-gray-900'
                  numberOfLines={1}
                >
                  {cardTitle}
                </Text>
                <Text
                  className='font-montserrat-light text-[10px] text-gray-500'
                  numberOfLines={1}
                >
                  {cardSubtitle}
                </Text>
              </View>
            </View>
          ) : null}

          <View
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 18,
              paddingVertical: 12,
              paddingHorizontal: 12,
              alignItems: 'center',
              shadowColor: '#0f172a',
              shadowOpacity: 0.18,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
              minWidth: 130,
            }}
          >
            {isLoadingSelection ? (
              <View
                style={{
                  width: 56,
                  height: 56,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator size='small' color={Colors.shine.glowStrong} />
              </View>
            ) : (
              <WaterSphere
                value={cardValue}
                size={56}
                showGlow={false}
                showScale={selection != null}
              />
            )}

            {isLoadingSelection ? (
              <>
                <Text
                  className='font-montserrat-extrabold text-sm mt-2'
                  style={{ color: Colors.gray[500] }}
                >
                  Cargando…
                </Text>
                <Text className='font-montserrat-light text-[10px] text-gray-500'>
                  {cardLabel}
                </Text>
              </>
            ) : !selection ? (
              <>
                <Text
                  className='font-montserrat-extrabold text-sm mt-2'
                  style={{ color: Colors.gray[400] }}
                >
                  Sin selección
                </Text>
                <Text className='font-montserrat-light text-[10px] text-gray-500'>
                  Selecciona una alcaldía o colonia
                </Text>
              </>
            ) : (
              <>
                <Text
                  className='font-montserrat-extrabold text-base'
                  style={{ color: '#0c4a6e', marginTop: 8 }}
                >
                  {hasSelectionData
                    ? `${cardValue.toLocaleString('es-MX', { maximumFractionDigits: 0 })} ${unitLabel}`
                    : `— ${unitLabel}`}
                </Text>
                <Text className='font-montserrat-light text-[10px] text-gray-500'>
                  {cardLabel}
                </Text>
              </>
            )}

            <Text className='font-montserrat-medium text-[10px] text-gray-600 text-center mt-1.5 px-1'>
              {cardHint}
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>

      <MapFAB />

      <DetailSheet
        sheetRef={sheetRef}
        onChange={(index) => {
          if (index === -1) {
            handleDismiss()
          }
        }}
      >
        <View className='pb-10'>
          {selection ? (
            <>
              <DetailSheetHeader
                coloniaNombre={
                  selection.kind === 'alcaldia' ? selection.display : selection.colonia
                }
                alcaldia={selection.kind === 'alcaldia' ? '' : selection.display}
                cp={''}
                indiceDes={'MEDIO'}
                disponibilidadIndex={disponibilidadIndex}
                status={status}
                bimestre={bimestre}
                anio={anio}
                onChangeBimestre={handleChangeBimestre}
              />

              <View className='px-5'>
                <Text className='font-montserrat-extrabold text-[10px] uppercase tracking-wider text-gray-500 mt-2 mb-1'>
                  Periodo
                </Text>
                <Text className='font-montserrat-medium text-sm text-gray-700'>
                  {periodoLabel} · {selectionConsumo.num_registros} registros
                </Text>
              </View>

              {isLoadingSelection ? (
                <View className='px-5 pt-4 items-center'>
                  <Text className='font-montserrat-semibold text-base text-gray-700 text-center'>
                    Cargando datos...
                  </Text>
                </View>
              ) : hasSelectionData ? (
                <>
                  <DetailSheetMetrics sections={metricSections} />
                  <View className='px-5 pt-3'>
                    <DetailChart
                      data={trendData}
                      width={width - 40}
                      current={selectionConsumo.consumo_total}
                      unit={unitLabel}
                    />
                  </View>
                </>
              ) : (
                <View className='px-5 pt-4 items-center'>
                  <Text className='font-montserrat-semibold text-base text-gray-700 text-center'>
                    {selection.kind === 'alcaldia'
                      ? 'Sin datos para esta alcaldía en este periodo'
                      : 'Sin datos para esta colonia en este periodo'}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View className='px-5 pt-4 items-center'>
              <Text className='font-montserrat-semibold text-base text-gray-700 text-center'>
                Selecciona una alcaldía o colonia
              </Text>
              <Text className='font-montserrat-light text-sm text-gray-500 mt-1 text-center'>
                Toca un polígono del mapa o busca por nombre
              </Text>
            </View>
          )}
        </View>
      </DetailSheet>
    </View>
  )
}

void ZERO_CONSUMO

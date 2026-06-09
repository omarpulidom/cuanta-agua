import { Ionicons } from '@expo/vector-icons'
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg'
import { ConsumoHooks } from '@/api/Consumo/Consumo.Hooks'
import { TiempoHooks } from '@/api/Tiempo/Tiempo.Hooks'
import { DetailCard } from '@/components/Elements/DetailSheet'
import { Colors } from '@/components/colors'
import { useHaptic } from '@/lib/animation'

type Periodo = 1 | 2 | 3 | 'total'

function numberFmt(n: number): string {
  return n.toLocaleString('es-MX', { maximumFractionDigits: 0 })
}

function decimalFmt(n: number): string {
  return n.toLocaleString('es-MX', { maximumFractionDigits: 1 })
}

// Lluvia: morado para que no se confunda con el azul del consumo de agua
// ni con el ambar de la temperatura. Mismo color en barras, iconos y leyenda.
const LLUVIA_BAR = '#a78bfa'
const LLUVIA_BAR_TOP = '#7c3aed'
const LLUVIA_TEXT = '#5b21b6'

function PeriodoChips({
  anios,
  bimestres,
  selected,
  onSelect,
}: {
  anios: number[]
  bimestres: number[]
  selected: { anio: number; bimestre: Periodo } | null
  onSelect: (anio: number, bimestre: Periodo) => void
}) {
  if (anios.length === 0 || bimestres.length === 0) return null
  const anio = selected?.anio ?? anios[anios.length - 1]!
  return (
    <DetailCard>
      <View className='flex-row items-center justify-between mb-3'>
        <Text className='font-montserrat-extrabold text-base text-gray-900'>
          Periodo
        </Text>
        <Ionicons name='calendar' size={18} color={Colors.shine.glowStrong} />
      </View>
      <View className='flex-row items-center gap-2 flex-wrap'>
        <Text className='font-montserrat-light text-xs text-gray-500 mr-1'>Año:</Text>
        {anios.map((a) => {
          const active = a === anio
          return (
            <TouchableOpacity
              key={`y-${a}`}
              onPress={() => onSelect(a, selected?.bimestre ?? 'total')}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: active ? Colors.shine.glow : 'rgba(14,165,233,0.10)',
                borderWidth: 1,
                borderColor: active ? Colors.shine.glow : 'rgba(14,165,233,0.25)',
              }}
            >
              <Text
                className='font-montserrat-semibold text-xs'
                style={{ color: active ? '#ffffff' : Colors.primary[700] }}
              >
                {a}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
      <View className='flex-row items-center gap-2 flex-wrap mt-2'>
        <Text className='font-montserrat-light text-xs text-gray-500 mr-1'>Bimestre:</Text>
        {bimestres.map((b) => {
          const active = selected?.bimestre === b
          return (
            <TouchableOpacity
              key={`b-${b}`}
              onPress={() => onSelect(anio, b as Periodo)}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: active ? Colors.shine.glow : 'rgba(14,165,233,0.10)',
                borderWidth: 1,
                borderColor: active ? Colors.shine.glow : 'rgba(14,165,233,0.25)',
              }}
            >
              <Text
                className='font-montserrat-semibold text-xs'
                style={{ color: active ? '#ffffff' : Colors.primary[700] }}
              >
                B{b}
              </Text>
            </TouchableOpacity>
          )
        })}
        <TouchableOpacity
          onPress={() => onSelect(anio, 'total')}
          activeOpacity={0.8}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor:
              selected?.bimestre === 'total' ? Colors.shine.glow : 'rgba(14,165,233,0.10)',
            borderWidth: 1,
            borderColor:
              selected?.bimestre === 'total' ? Colors.shine.glow : 'rgba(14,165,233,0.25)',
          }}
        >
          <Text
            className='font-montserrat-semibold text-xs'
            style={{
              color: selected?.bimestre === 'total' ? '#ffffff' : Colors.primary[700],
            }}
          >
            Total
          </Text>
        </TouchableOpacity>
      </View>
    </DetailCard>
  )
}

function TopConsumoCard({
  anio,
  bimestre,
}: {
  anio: number
  bimestre: Periodo
}) {
  // Bimestre 1, 2 o 3: usamos /api/consumo filtrado y agregamos en cliente.
  // Total: agregamos los 3 bimestres en cliente.
  const q1 = ConsumoHooks.useList(
    { anio, bimestre: 1, limit: 500 },
    { enabled: bimestre === 1 || bimestre === 'total' },
  )
  const q2 = ConsumoHooks.useList(
    { anio, bimestre: 2, limit: 500 },
    { enabled: bimestre === 2 || bimestre === 'total' },
  )
  const q3 = ConsumoHooks.useList(
    { anio, bimestre: 3, limit: 500 },
    { enabled: bimestre === 3 || bimestre === 'total' },
  )
  const queries = { 1: q1, 2: q2, 3: q3 }
  const isLoading = bimestre === 'total'
    ? q1.isLoading || q2.isLoading || q3.isLoading
    : queries[bimestre].isLoading

  const top = useMemo(() => {
    const map = new Map<string, { colonia: string; alcaldia: string; total: number }>()
    const sources: Array<typeof q1.data> = bimestre === 'total'
      ? [q1.data, q2.data, q3.data]
      : [queries[bimestre].data]
    for (const rows of sources) {
      for (const r of rows ?? []) {
        if (!r.colonia || !r.alcaldia) continue
        const key = `${r.colonia}|${r.alcaldia}`
        const prev = map.get(key) ?? { colonia: r.colonia, alcaldia: r.alcaldia, total: 0 }
        prev.total += r.consumo_total
        map.set(key, prev)
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 10)
  }, [bimestre, q1.data, q2.data, q3.data])

  const max = useMemo(() => Math.max(1, ...top.map((t) => t.total)), [top])

  return (
    <DetailCard>
      <View className='flex-row items-center justify-between mb-3'>
        <View>
          <Text className='font-montserrat-extrabold text-base text-gray-900'>
            Top 10 consumo por colonia
          </Text>
          <Text className='font-montserrat-light text-[11px] text-gray-500'>
            {bimestre === 'total' ? `Suma B1+B2+B3 · ${anio}` : `Bimestre ${bimestre} · ${anio}`}
          </Text>
        </View>
        <Ionicons name='flame' size={18} color={Colors.status.alert} />
      </View>
      {isLoading ? (
        <View className='py-6 items-center'>
          <ActivityIndicator color={Colors.shine.glowStrong} />
        </View>
      ) : top.length === 0 ? (
        <Text className='font-montserrat-light text-sm text-gray-500 py-4 text-center'>
          Sin datos para este periodo
        </Text>
      ) : (
        <View className='gap-2'>
          {top.map((t, i) => {
            const ratio = t.total / max
            const tone = i < 3 ? 'alert' : i < 6 ? 'warn' : 'ok'
            const color =
              tone === 'alert' ? Colors.status.alert : tone === 'warn' ? Colors.status.warn : Colors.status.ok
            return (
              <View key={`${t.colonia}-${t.alcaldia}-${i}`}>
                <View className='flex-row items-center justify-between mb-1'>
                  <View className='flex-1 pr-2 flex-row items-center gap-2'>
                    <Text
                      className='font-montserrat-extrabold text-[10px]'
                      style={{
                        color: '#ffffff',
                        backgroundColor: color,
                        paddingHorizontal: 5,
                        paddingVertical: 1,
                        borderRadius: 4,
                        overflow: 'hidden',
                        minWidth: 18,
                        textAlign: 'center',
                      }}
                    >
                      {i + 1}
                    </Text>
                    <View className='flex-1'>
                      <Text
                        className='font-montserrat-semibold text-sm text-gray-900'
                        numberOfLines={1}
                      >
                        {t.colonia}
                      </Text>
                      <Text className='font-montserrat-light text-[10px] text-gray-500'>
                        {t.alcaldia}
                      </Text>
                    </View>
                  </View>
                  <Text className='font-montserrat-extrabold text-sm text-gray-900'>
                    {numberFmt(t.total)} m³
                  </Text>
                </View>
                <View
                  style={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(14,165,233,0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${Math.max(4, ratio * 100)}%`,
                      height: '100%',
                      backgroundColor: color,
                    }}
                  />
                </View>
              </View>
            )
          })}
        </View>
      )}
    </DetailCard>
  )
}

const CORRELACION_CHART_W = 320
const CORRELACION_CHART_H = 200
const CORRELACION_PADDING = { top: 28, right: 18, bottom: 32, left: 52 }

function CorrelacionCard({ anio }: { anio: number }) {
  const { data, isLoading } = ConsumoHooks.useCorrelacion(anio)
  const rows = useMemo(() => data ?? [], [data])

  const maxAgua = useMemo(() => Math.max(1, ...rows.map((r) => r.total_agua)), [rows])
  const minTemp = useMemo(() => Math.min(0, ...rows.map((r) => r.temp_promedio)), [rows])
  const maxTemp = useMemo(() => Math.max(1, ...rows.map((r) => r.temp_promedio)), [rows])
  const maxLluvia = useMemo(() => Math.max(1, ...rows.map((r) => r.total_lluvia)), [rows])

  const innerW = CORRELACION_CHART_W - CORRELACION_PADDING.left - CORRELACION_PADDING.right
  const innerH = CORRELACION_CHART_H - CORRELACION_PADDING.top - CORRELACION_PADDING.bottom

  const xFor = (i: number) =>
    rows.length <= 1
      ? CORRELACION_PADDING.left + innerW / 2
      : CORRELACION_PADDING.left + (i * innerW) / (rows.length - 1)
  const yAgua = (v: number) =>
    CORRELACION_PADDING.top + innerH - (v / maxAgua) * innerH
  const yTemp = (v: number) =>
    CORRELACION_PADDING.top + innerH - ((v - minTemp) / (maxTemp - minTemp || 1)) * innerH
  const yLluvia = (v: number) =>
    CORRELACION_PADDING.top + innerH - (v / maxLluvia) * innerH

  // path de consumo (area + linea)
  const aguaPath = rows
    .map((r, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yAgua(r.total_agua)}`)
    .join(' ')
  const aguaArea = rows.length
    ? `${aguaPath} L ${xFor(rows.length - 1)} ${CORRELACION_PADDING.top + innerH} L ${xFor(0)} ${CORRELACION_PADDING.top + innerH} Z`
    : ''
  // path de temperatura
  const tempPath = rows
    .map((r, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yTemp(r.temp_promedio)}`)
    .join(' ')

  // ticks de agua (5 niveles)
  const aguaTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: CORRELACION_PADDING.top + innerH - f * innerH,
    value: Math.round(f * maxAgua),
  }))
  // ticks de temp
  const tempTicks = [0, 0.5, 1].map((f) => ({
    y: CORRELACION_PADDING.top + innerH - f * innerH,
    value: Math.round(minTemp + f * (maxTemp - minTemp)),
  }))

  return (
    <DetailCard>
      <View className='flex-row items-center justify-between mb-3'>
        <View>
          <Text className='font-montserrat-extrabold text-base text-gray-900'>
            Clima vs Consumo
          </Text>
          <Text className='font-montserrat-light text-[11px] text-gray-500'>
            Bimestral · {anio} · comparativa de 3 variables
          </Text>
        </View>
        <Ionicons name='thermometer-outline' size={18} color={Colors.shine.glowStrong} />
      </View>
      {isLoading ? (
        <View className='py-6 items-center'>
          <ActivityIndicator color={Colors.shine.glowStrong} />
        </View>
      ) : rows.length === 0 ? (
        <Text className='font-montserrat-light text-sm text-gray-500 py-4 text-center'>
          Sin datos para este año
        </Text>
      ) : (
        <View>
          <View className='flex-row items-center gap-3 flex-wrap mb-3 px-1'>
            <View className='flex-row items-center gap-1.5'>
              <View
                style={{
                  width: 12,
                  height: 3,
                  backgroundColor: Colors.shine.glowStrong,
                  borderRadius: 2,
                }}
              />
              <Text className='font-montserrat-semibold text-[10px] text-gray-700'>
                Consumo
              </Text>
            </View>
            <View className='flex-row items-center gap-1.5'>
              <Ionicons name='thermometer' size={11} color={Colors.status.warn} />
              <Text className='font-montserrat-semibold text-[10px] text-gray-700'>
                Temp.
              </Text>
            </View>
            <View className='flex-row items-center gap-1.5'>
              <Ionicons name='rainy' size={11} color={LLUVIA_BAR_TOP} />
              <Text className='font-montserrat-semibold text-[10px] text-gray-700'>
                Lluvia
              </Text>
            </View>
          </View>
          <Svg width={CORRELACION_CHART_W} height={CORRELACION_CHART_H}>
            <Defs>
              <LinearGradient id='aguaFill' x1='0' y1='0' x2='0' y2='1'>
                <Stop offset='0' stopColor={Colors.shine.glowStrong} stopOpacity={0.32} />
                <Stop offset='1' stopColor={Colors.shine.glowStrong} stopOpacity={0.02} />
              </LinearGradient>
            </Defs>
            {/* y-axis title (consumo) */}
            <SvgText
              x={6}
              y={CORRELACION_PADDING.top - 12}
              fontSize={9}
              fill='#0284c7'
              fontWeight='700'
            >
              m³
            </SvgText>
            {/* y-axis title (temp) */}
            <SvgText
              x={CORRELACION_CHART_W - 6}
              y={CORRELACION_PADDING.top - 12}
              fontSize={9}
              fill={Colors.status.warn}
              fontWeight='700'
              textAnchor='end'
            >
              °C
            </SvgText>
            {/* grid + y-axis ticks agua (izquierda) */}
            {aguaTicks.map((t, i) => (
              <G key={`yt-${i}`}>
                <Line
                  x1={CORRELACION_PADDING.left}
                  y1={t.y}
                  x2={CORRELACION_PADDING.left + innerW}
                  y2={t.y}
                  stroke='rgba(15,23,42,0.05)'
                  strokeWidth={1}
                />
                <SvgText
                  x={CORRELACION_PADDING.left - 6}
                  y={t.y + 3}
                  fontSize={8.5}
                  fill='#0284c7'
                  textAnchor='end'
                  fontWeight='600'
                >
                  {t.value >= 1_000_000
                    ? `${(t.value / 1_000_000).toFixed(1)}M`
                    : t.value >= 1_000
                      ? `${Math.round(t.value / 1_000)}k`
                      : t.value}
                </SvgText>
              </G>
            ))}
            {/* y-axis ticks temp (derecha) */}
            {tempTicks.map((t, i) => (
              <SvgText
                key={`tt-${i}`}
                x={CORRELACION_PADDING.left + innerW + 6}
                y={t.y + 3}
                fontSize={8.5}
                fill={Colors.status.warn}
                textAnchor='start'
                fontWeight='600'
              >
                {t.value}°
              </SvgText>
            ))}
            {/* barras de lluvia (debajo de las líneas) */}
            {rows.map((r, i) => {
              const barX = xFor(i) - 9
              const barTop = yLluvia(r.total_lluvia)
              const barH = Math.max(8, CORRELACION_PADDING.top + innerH - barTop)
              return (
                <G key={`rb-${i}`}>
                  <Rect
                    x={barX}
                    y={barTop}
                    width={18}
                    height={barH}
                    fill={LLUVIA_BAR}
                    opacity={0.55}
                    rx={3}
                  />
                  <Rect
                    x={barX}
                    y={barTop}
                    width={18}
                    height={3}
                    fill={LLUVIA_BAR_TOP}
                    opacity={0.85}
                    rx={1.5}
                  />
                  <SvgText
                    x={xFor(i)}
                    y={barTop - 4}
                    fontSize={8}
                    fill={LLUVIA_TEXT}
                    textAnchor='middle'
                    fontWeight='700'
                  >
                    {Math.round(r.total_lluvia)}
                  </SvgText>
                </G>
              )
            })}
            {/* area + linea de agua */}
            <Path d={aguaArea} fill='url(#aguaFill)' />
            <Path
              d={aguaPath}
              fill='none'
              stroke={Colors.shine.glowStrong}
              strokeWidth={2.5}
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            {/* linea de temperatura (encima) */}
            <Path
              d={tempPath}
              fill='none'
              stroke={Colors.status.warn}
              strokeWidth={2}
              strokeDasharray='5 3'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            {/* puntos */}
            {rows.map((r, i) => (
              <G key={`pt-${i}`}>
                <Circle
                  cx={xFor(i)}
                  cy={yAgua(r.total_agua)}
                  r={6}
                  fill={Colors.shine.glowStrong}
                  stroke='#ffffff'
                  strokeWidth={2}
                />
                <Circle
                  cx={xFor(i)}
                  cy={yTemp(r.temp_promedio)}
                  r={4}
                  fill={Colors.status.warn}
                  stroke='#ffffff'
                  strokeWidth={1.5}
                />
              </G>
            ))}
            {/* x-axis labels */}
            {rows.map((r, i) => (
              <G key={`xl-${i}`}>
                <SvgText
                  x={xFor(i)}
                  y={CORRELACION_PADDING.top + innerH + 14}
                  fontSize={10}
                  fill='#0f172a'
                  textAnchor='middle'
                  fontWeight='700'
                >
                  B{r.bimestre}
                </SvgText>
                <SvgText
                  x={xFor(i)}
                  y={CORRELACION_PADDING.top + innerH + 25}
                  fontSize={7.5}
                  fill='#64748b'
                  textAnchor='middle'
                  fontWeight='500'
                >
                  {r.anio}
                </SvgText>
              </G>
            ))}
          </Svg>
          {/* mini cards resumen */}
          <View className='mt-3 flex-row gap-2'>
            {rows.map((r) => {
              const hot = r.dias_ola_calor
              const cold = r.dias_frio
              const tone = hot > cold ? 'warn' : cold > hot ? 'alert' : 'ok'
              const color =
                tone === 'warn'
                  ? Colors.status.warn
                  : tone === 'alert'
                    ? Colors.status.alert
                    : Colors.status.ok
              return (
                <View
                  key={`sum-${r.anio}-${r.bimestre}`}
                  className='flex-1 rounded-2xl px-2.5 py-2.5'
                  style={{
                    backgroundColor: `${color}0d`,
                    borderWidth: 1.5,
                    borderColor: color,
                  }}
                >
                  <Text
                    className='font-montserrat-extrabold text-[11px]'
                    style={{ color }}
                  >
                    Bimestre {r.bimestre}
                  </Text>
                  <Text className='font-montserrat-extrabold text-lg text-gray-900 mt-0.5'>
                    {decimalFmt(r.temp_promedio)}°C
                  </Text>
                  <View className='flex-row items-center gap-1 mt-1'>
                    <Ionicons name='flame' size={10} color={Colors.status.alert} />
                    <Text className='font-montserrat-semibold text-[10px] text-gray-700'>
                      {hot}d calor
                    </Text>
                  </View>
                  <View className='flex-row items-center gap-1 mt-0.5'>
                    <Ionicons name='snow' size={10} color={Colors.primary[500]} />
                    <Text className='font-montserrat-semibold text-[10px] text-gray-700'>
                      {cold}d frío
                    </Text>
                  </View>
                  <View className='flex-row items-center gap-1 mt-0.5'>
                    <Ionicons name='rainy' size={10} color={LLUVIA_BAR_TOP} />
                    <Text className='font-montserrat-semibold text-[10px] text-gray-700'>
                      {decimalFmt(r.total_lluvia)} mm
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      )}
    </DetailCard>
  )
}

function ResumenCard() {
  const { data, isLoading } = ConsumoHooks.useResumen()
  const grouped = useMemo(() => {
    const map = new Map<string, { total: number; registros: number }>()
    for (const r of data ?? []) {
      const key = r.alcaldia
      const cur = map.get(key) ?? { total: 0, registros: 0 }
      cur.total += r.total_agua
      cur.registros += 1
      map.set(key, cur)
    }
    return Array.from(map.entries())
      .map(([alcaldia, v]) => ({ alcaldia, ...v }))
      .sort((a, b) => b.total - a.total)
  }, [data])

  return (
    <DetailCard>
      <View className='flex-row items-center justify-between mb-3'>
        <View>
          <Text className='font-montserrat-extrabold text-base text-gray-900'>
            Resumen por alcaldía
          </Text>
          <Text className='font-montserrat-light text-[11px] text-gray-500'>
            Total histórico
          </Text>
        </View>
        <Ionicons name='business' size={18} color={Colors.shine.glowStrong} />
      </View>
      {isLoading ? (
        <View className='py-6 items-center'>
          <ActivityIndicator color={Colors.shine.glowStrong} />
        </View>
      ) : grouped.length === 0 ? (
        <Text className='font-montserrat-light text-sm text-gray-500 py-4 text-center'>
          Sin datos
        </Text>
      ) : (
        <View className='gap-2'>
          {grouped.map((g) => (
            <View
              key={g.alcaldia}
              className='flex-row items-center justify-between'
              style={{
                paddingVertical: 6,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(0,0,0,0.04)',
              }}
            >
              <Text className='font-montserrat-medium text-sm text-gray-700' numberOfLines={1}>
                {g.alcaldia}
              </Text>
              <Text className='font-montserrat-extrabold text-sm text-gray-900'>
                {numberFmt(g.total)} m³
              </Text>
            </View>
          ))}
        </View>
      )}
    </DetailCard>
  )
}

export default function DashboardScreen() {
  const haptic = useHaptic()
  const { data: anios } = TiempoHooks.useAnios()
  const { data: bimestres } = TiempoHooks.useBimestres()
  const [anio, setAnio] = useState<number>(2019)
  const [bimestre, setBimestre] = useState<Periodo>('total')

  useEffect(() => {
    if (anios && anios.length > 0) setAnio(anios[anios.length - 1]!)
  }, [anios])

  const handleSelectPeriodo = (a: number, b: Periodo) => {
    haptic.selection()
    setAnio(a)
    setBimestre(b)
  }

  const aniosArr = anios ?? []
  const bimestresArr = (bimestres ?? []) as number[]

  return (
    <SafeAreaView className='flex-1 bg-water-bg'>
      <ScrollView
        className='flex-1'
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 120,
        }}
      >
        <View className='mb-4 px-1'>
          <Text className='font-montserrat-extrabold text-2xl text-gray-900'>
            Dashboard
          </Text>
          <Text className='font-montserrat-light text-xs text-gray-500'>
            Resumen del data warehouse
          </Text>
        </View>

        <View className='gap-3'>
          <PeriodoChips
            anios={aniosArr}
            bimestres={bimestresArr}
            selected={{ anio, bimestre }}
            onSelect={handleSelectPeriodo}
          />
          <TopConsumoCard anio={anio} bimestre={bimestre} />
          <CorrelacionCard anio={anio} />
          <ResumenCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}


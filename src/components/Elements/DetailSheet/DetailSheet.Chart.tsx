import { useEffect, useMemo } from 'react'
import { Text, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg'
import { Colors } from '@/components/colors'
import { DetailCard } from './DetailSheet.Card'

const AnimatedPath = Animated.createAnimatedComponent(Path)

type DetailChartProps = {
  data: number[]
  height?: number
  width?: number
  unit?: string
  current?: number
}

export function DetailChart({
  data,
  height = 90,
  width = 300,
  unit = 'm³',
  current,
}: DetailChartProps) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = 0
    progress.value = withTiming(1, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    })
  }, [
    data,
    progress,
  ])

  const { linePath, areaPath, max, min, totalLen, lastX, lastY } = useMemo(() => {
    if (data.length === 0) {
      return {
        linePath: '',
        areaPath: '',
        max: 0,
        min: 0,
        totalLen: 0,
        lastX: 0,
        lastY: 0,
      }
    }
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const stepX = width / (data.length - 1 || 1)
    const points = data.map((v, i) => {
      const x = i * stepX
      const y = height - ((v - min) / range) * (height - 16) - 8
      return { x, y }
    })
    let line = `M ${points[0]?.x ?? 0} ${points[0]?.y ?? 0}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const cur = points[i]
      if (!prev || !cur) continue
      const midX = (prev.x + cur.x) / 2
      line += ` C ${midX} ${prev.y}, ${midX} ${cur.y}, ${cur.x} ${cur.y}`
    }
    const area = `${line} L ${points.at(-1)?.x ?? 0} ${height} L ${points[0]?.x ?? 0} ${height} Z`
    const last = points.at(-1)
    return {
      linePath: line,
      areaPath: area,
      max,
      min,
      totalLen: last ? last.x : 0,
      lastX: last?.x ?? 0,
      lastY: last?.y ?? 0,
    }
  }, [
    data,
    width,
    height,
  ])

  const lineProps = useAnimatedProps(() => ({
    strokeDashoffset: totalLen * (1 - progress.value),
  }))

  const areaProps = useAnimatedProps(() => ({
    opacity: progress.value,
  }))

  return (
    <DetailCard style={{ paddingVertical: 12 }}>
      <View className='flex-row items-center justify-between mb-2 px-1'>
        <Text className='font-montserrat-extrabold text-sm text-gray-900'>
          Histórico (6 bimestres)
        </Text>
        <View className='flex-row items-baseline gap-1'>
          <Text className='font-montserrat-extrabold text-base text-gray-900'>
            {current ?? data.at(-1) ?? 0}
          </Text>
          <Text className='font-montserrat-light text-xs text-gray-500'>
            {unit}
          </Text>
        </View>
      </View>
      <Svg
        width={width}
        height={height}
      >
        <Defs>
          <LinearGradient id='chartArea' x1='0' y1='0' x2='0' y2='1'>
            <Stop offset='0' stopColor={Colors.shine.glow} stopOpacity={0.35} />
            <Stop offset='1' stopColor={Colors.shine.glow} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <AnimatedPath
          d={areaPath}
          fill='url(#chartArea)'
          animatedProps={areaProps}
        />
        <AnimatedPath
          d={linePath}
          fill='none'
          stroke={Colors.shine.glowStrong}
          strokeWidth={2.5}
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeDasharray={`${totalLen} ${totalLen}`}
          animatedProps={lineProps}
        />
        {data.length > 0 ? (
          <>
            <Path
              d={`M ${lastX} ${lastY} m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0`}
              fill={Colors.shine.glow}
              stroke='#ffffff'
              strokeWidth={2}
            />
          </>
        ) : null}
      </Svg>
    </DetailCard>
  )
}

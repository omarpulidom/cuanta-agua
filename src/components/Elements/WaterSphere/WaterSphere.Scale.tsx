import { Line, Text as SvgText } from 'react-native-svg'
import { SPHERE_CIRCLE, SPHERE_SCALE } from './constants'

type ScaleProps = {
  labelColor?: string
  tickColor?: string
}

export function WaterSphereScale({ labelColor = '#94a3b8', tickColor = '#cbd5e1' }: ScaleProps) {
  const { cx, cy, r } = SPHERE_CIRCLE
  const topY = cy - r
  const bottomY = cy + r
  const innerSpan = bottomY - topY

  return (
    <>
      {SPHERE_SCALE.ticks.map((tick) => {
        const ratio = tick / SPHERE_SCALE.max
        const y = topY + (1 - ratio) * innerSpan * 0.95
        const isMajor = tick % 250 === 0

        return (
          <Line
            key={tick}
            x1={cx + r + 4}
            y1={y}
            x2={cx + r + (isMajor ? 14 : 8)}
            y2={y}
            stroke={isMajor ? tickColor : tickColor}
            strokeWidth={isMajor ? 1.4 : 1}
            strokeOpacity={isMajor ? 0.9 : 0.6}
          />
        )
      })}

      {SPHERE_SCALE.ticks.filter((t) => t % 250 === 0).map((tick) => {
        const ratio = tick / SPHERE_SCALE.max
        const y = topY + (1 - ratio) * innerSpan * 0.95
        return (
          <SvgText
            key={`l-${tick}`}
            x={cx + r + 18}
            y={y + 4}
            fontSize={11}
            fontWeight='500'
            fill={labelColor}
          >
            {tick}
          </SvgText>
        )
      })}
    </>
  )
}

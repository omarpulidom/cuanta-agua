import { useEffect } from 'react'
import { Easing, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated'
import { Easings } from './easings'

type UseCountUpOptions = {
  duration?: number
  precision?: number
  easing?: (value: number) => number
}

export function useCountUp(target: number, options: UseCountUpOptions = {}) {
  const { duration = 800, easing = Easings.smoothOut } = options
  const value = useSharedValue(target)

  useEffect(() => {
    value.value = withTiming(target, {
      duration,
      easing,
    })
  }, [
    target,
    duration,
    easing,
    value,
  ])

  const formatted = useDerivedValue(() => {
    const v = Math.round(value.value)
    return v.toString()
  })

  return formatted
}

export function useCountUpFloat(target: number, options: UseCountUpOptions = {}) {
  const { duration = 800, precision = 1, easing = Easings.smoothOut } = options
  const value = useSharedValue(target)

  useEffect(() => {
    value.value = withTiming(target, {
      duration,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    })
  }, [
    target,
    duration,
    easing,
    value,
  ])

  const formatted = useDerivedValue(() => {
    return value.value.toFixed(precision)
  })

  return formatted
}

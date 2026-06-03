import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useEffect, useState } from 'react'
import { LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/components/colors'
import { Springs, useHaptic } from '@/lib/animation'

type TabConfig = {
  key: string
  label: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  outlineIcon: React.ComponentProps<typeof Ionicons>['name']
}

const TABS: TabConfig[] = [
  {
    key: 'index',
    label: 'Mapa',
    icon: 'water',
    outlineIcon: 'water-outline',
  },
  {
    key: 'settings',
    label: 'Ajustes',
    icon: 'settings',
    outlineIcon: 'settings-outline',
  },
]

function WaterDropIndicator({ x, y }: { x: number; y: number }) {
  return (
    <Animated.View
      pointerEvents='none'
      style={[
        styles.dropIndicator,
        {
          left: x - 5,
          top: y,
        },
      ]}
    >
      <View
        style={{
          width: 10,
          height: 12,
          borderRadius: 5,
          backgroundColor: Colors.shine.glow,
          shadowColor: Colors.shine.glow,
          shadowOpacity: 1,
          shadowRadius: 6,
          shadowOffset: {
            width: 0,
            height: 0,
          },
        }}
      />
    </Animated.View>
  )
}

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const haptic = useHaptic()
  const [containerWidth, setContainerWidth] = useState(0)
  const indicatorX = useSharedValue(0)
  const lastIndex = useSharedValue(state.index)

  useEffect(() => {
    if (containerWidth === 0) return
    const segment = containerWidth / TABS.length
    const target = segment * state.index + segment / 2 - 5
    indicatorX.value = withSpring(target, Springs.bouncy)
    if (lastIndex.value !== state.index) {
      haptic.selection()
    }
    lastIndex.value = state.index
  }, [
    state.index,
    containerWidth,
    indicatorX,
    lastIndex,
    haptic,
  ])

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: indicatorX.value },
    ],
  }))

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width)
  }

  return (
    <SafeAreaView
      edges={[
        'bottom',
      ]}
      className='absolute bottom-0 left-0 right-0'
      pointerEvents='box-none'
    >
      <Animated.View
        entering={FadeInUp.duration(500).springify()}
        style={styles.wrap}
        pointerEvents='box-none'
      >
        <View
          style={styles.glassContainer}
          onLayout={onLayout}
        >
          <BlurView
            intensity={40}
            tint='light'
            style={StyleSheet.absoluteFill}
          />

          {TABS.map((tab, index) => {
            const isFocused = state.index === index
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: state.routes[index]?.key ?? tab.key,
                    canPreventDefault: true,
                  })
                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(tab.key as never)
                  }
                }}
                activeOpacity={0.85}
                style={styles.tabBtn}
                accessibilityRole='button'
                accessibilityState={{
                  selected: isFocused,
                }}
                accessibilityLabel={tab.label}
              >
                {isFocused ? (
                  <View style={styles.activePill}>
                    <Ionicons
                      name={tab.icon}
                      size={20}
                      color='white'
                    />
                    <Text className='font-montserrat-bold text-sm text-white ml-2'>
                      {tab.label}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.inactiveTab}>
                    <Ionicons
                      name={tab.outlineIcon}
                      size={22}
                      color={Colors.gray[500]}
                    />
                  </View>
                )}
              </TouchableOpacity>
            )
          })}

          {containerWidth > 0 ? (
            <Animated.View
              pointerEvents='none'
              style={[
                styles.dropWrap,
                indicatorStyle,
              ]}
            >
              <View
                style={{
                  width: 10,
                  height: 12,
                  borderRadius: 5,
                  backgroundColor: Colors.shine.glow,
                  shadowColor: Colors.shine.glow,
                  shadowOpacity: 1,
                  shadowRadius: 8,
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                }}
              />
            </Animated.View>
          ) : null}
        </View>
      </Animated.View>
    </SafeAreaView>
  )
}

void WaterDropIndicator

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingBottom: 0,
    alignItems: 'center',
  },
  glassContainer: {
    height: 64,
    width: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.shine.glassBorder,
    shadowColor: Colors.shine.glow,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 10,
    position: 'relative',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.shine.glow,
    shadowColor: Colors.shine.glow,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  inactiveTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  dropWrap: {
    position: 'absolute',
    bottom: 4,
    width: 10,
    height: 12,
  },
  dropIndicator: {
    position: 'absolute',
    width: 10,
    height: 12,
  },
})

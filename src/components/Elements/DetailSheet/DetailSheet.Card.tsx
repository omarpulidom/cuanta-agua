import { LinearGradient } from 'expo-linear-gradient'
import { StyleSheet, Text, View, type ViewProps } from 'react-native'
import { Colors } from '@/components/colors'

type DetailCardProps = ViewProps & {
  children: React.ReactNode
  highlight?: boolean
}

export function DetailCard({ children, highlight = true, style, ...rest }: DetailCardProps) {
  return (
    <View
      style={[
        styles.card,
        style,
      ]}
      {...rest}
    >
      {highlight && (
        <LinearGradient
          colors={['rgba(255,255,255,0.85)', 'rgba(255,255,255,0)']}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 0,
            y: 1,
          }}
          style={styles.highlight}
          pointerEvents='none'
        />
      )}
      {children}
    </View>
  )
}

type SectionTitleProps = {
  title: string
  subtitle?: string
}

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <View className='px-1 mb-3'>
      <Text className='font-montserrat-extrabold text-lg text-gray-900'>
        {title}
      </Text>
      {subtitle ? (
        <Text className='font-montserrat-light text-xs text-gray-500 mt-0.5'>
          {subtitle}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: Colors.shine.glow,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 4,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
  },
})

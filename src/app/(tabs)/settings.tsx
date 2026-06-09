import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'react-native'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/components/Providers/AuthProvider'
import { useLayerStore, type BimestreView, type Theme } from '@/store/useLayerStore'
import { useHaptic } from '@/lib/animation'
import { Colors } from '@/components/colors'

const BIMESTRE_VIEW_OPTIONS: Array<{
  value: BimestreView
  label: string
  icon: React.ComponentProps<typeof Ionicons>['name']
}> = [
  { value: 1, label: 'Bimestre 1', icon: 'calendar-outline' },
  { value: 2, label: 'Bimestre 2', icon: 'calendar-outline' },
  { value: 3, label: 'Bimestre 3', icon: 'calendar-outline' },
  { value: 'total', label: 'Suma de los 3 bimestres', icon: 'calendar' },
]

const THEME_OPTIONS: Array<{
  value: Theme
  label: string
  icon: React.ComponentProps<typeof Ionicons>['name']
}> = [
  { value: 'light', label: 'Claro', icon: 'sunny-outline' },
  { value: 'dark', label: 'Oscuro', icon: 'moon-outline' },
  { value: 'auto', label: 'Automático', icon: 'phone-portrait-outline' },
]

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <View className='mb-6'>
      <Text className='font-montserrat-extrabold text-sm text-gray-500 uppercase tracking-wider mb-3 px-1'>
        {title}
      </Text>
      <View
        className='bg-white rounded-3xl p-2'
        style={{
          shadowColor: Colors.shine.glow,
          shadowOpacity: 0.1,
          shadowRadius: 12,
          shadowOffset: {
            width: 0,
            height: 4,
          },
          elevation: 3,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.7)',
        }}
      >
        {children}
      </View>
    </View>
  )
}

function OptionRow({
  active,
  label,
  icon,
  onPress,
}: {
  active: boolean
  label: string
  icon?: React.ComponentProps<typeof Ionicons>['name']
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className='flex-row items-center justify-between px-3 py-3 rounded-2xl'
      style={{
        backgroundColor: active ? `${Colors.shine.glow}1a` : 'transparent',
      }}
    >
      <View className='flex-row items-center gap-3'>
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={active ? Colors.shine.glowStrong : Colors.gray[600]}
          />
        ) : null}
        <Text
          className={`font-montserrat-semibold text-base ${
            active ? 'text-primary-700' : 'text-gray-700'
          }`}
        >
          {label}
        </Text>
      </View>
      {active ? (
        <Ionicons name='checkmark-circle' size={22} color={Colors.shine.glow} />
      ) : null}
    </TouchableOpacity>
  )
}

export default function SettingsScreen() {
  const { user, logout } = useAuth()
  const bimestreView = useLayerStore((s) => s.bimestreView)
  const setBimestreView = useLayerStore((s) => s.setBimestreView)
  const theme = useLayerStore((s) => s.theme)
  const setTheme = useLayerStore((s) => s.setTheme)
  const haptic = useHaptic()
  const systemScheme = useColorScheme()

  const effectiveScheme: 'light' | 'dark' =
    theme === 'auto' ? (systemScheme === 'dark' ? 'dark' : 'light') : theme

  return (
    <SafeAreaView className='flex-1 bg-water-bg'>
      <ScrollView
        className='flex-1'
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 120,
        }}
      >
        <View className='mb-6 flex-row items-center gap-3'>
          <View
            className='w-14 h-14 rounded-full items-center justify-center'
            style={{
              backgroundColor: Colors.shine.glow,
              shadowColor: Colors.shine.glow,
              shadowOpacity: 0.6,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 0 },
            }}
          >
            <Text className='font-montserrat-extrabold text-xl text-white'>
              {(user?.email?.[0] ?? 'U').toUpperCase()}
            </Text>
          </View>
          <View className='flex-1'>
            <Text className='font-montserrat-extrabold text-2xl text-gray-900'>
              Hola, {user?.email?.split('@')[0] ?? 'invitado'}
            </Text>
            <Text className='font-montserrat-light text-sm text-gray-500'>
              {user?.email ?? 'cuanta-agua@local'}
            </Text>
          </View>
        </View>

        <Section title='Bimestre a mostrar'>
          {BIMESTRE_VIEW_OPTIONS.map((opt) => (
            <OptionRow
              key={String(opt.value)}
              active={bimestreView === opt.value}
              label={opt.label}
              icon={opt.icon}
              onPress={() => {
                haptic.selection()
                setBimestreView(opt.value)
              }}
            />
          ))}
        </Section>

        <Section title='Tema'>
          {THEME_OPTIONS.map((opt) => (
            <OptionRow
              key={opt.value}
              active={theme === opt.value}
              label={opt.label}
              icon={opt.icon}
              onPress={() => {
                haptic.selection()
                setTheme(opt.value)
              }}
            />
          ))}
          <View className='px-3 pb-2 pt-1'>
            <Text className='font-montserrat-light text-[11px] text-gray-400'>
              Modo actual:{' '}
              <Text className='font-montserrat-semibold text-gray-600'>
                {effectiveScheme === 'dark' ? 'Oscuro' : 'Claro'}
              </Text>
              {theme === 'auto' ? ' (sigue al sistema)' : ''}
            </Text>
          </View>
        </Section>

        <TouchableOpacity
          onPress={() => {
            haptic.medium()
            logout()
          }}
          activeOpacity={0.85}
          style={{
            borderRadius: 24,
            overflow: 'hidden',
            backgroundColor: Colors.shine.glow,
            shadowColor: Colors.shine.glow,
            shadowOpacity: 0.4,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        >
          <View
            style={{
              paddingVertical: 16,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
            }}
          >
            <Ionicons name='log-out-outline' size={20} color='white' />
            <Text className='font-montserrat-bold text-base text-white'>
              Cerrar sesión
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

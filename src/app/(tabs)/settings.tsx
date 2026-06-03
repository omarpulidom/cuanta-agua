import { Ionicons } from '@expo/vector-icons'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/components/Providers/AuthProvider'
import { useLayerStore, type ActiveLayer, type Theme, type Units } from '@/store/useLayerStore'
import { useHaptic } from '@/lib/animation'
import { Colors } from '@/components/colors'

const LAYER_OPTIONS: Array<{ value: ActiveLayer; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = [
  { value: 'both', label: 'Ambas', icon: 'layers' },
  { value: 'weather', label: 'Clima', icon: 'cloud' },
  { value: 'water', label: 'Agua', icon: 'water' },
]

const UNITS_OPTIONS: Array<{ value: Units; label: string }> = [
  { value: 'metric', label: 'Litros (L)' },
  { value: 'imperial', label: 'Galones (gal)' },
]

const THEME_OPTIONS: Array<{ value: Theme; label: string }> = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'auto', label: 'Auto' },
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
        <Ionicons
          name='checkmark-circle'
          size={22}
          color={Colors.shine.glow}
        />
      ) : null}
    </TouchableOpacity>
  )
}

export default function SettingsScreen() {
  const { user, logout } = useAuth()
  const activeLayer = useLayerStore((s) => s.activeLayer)
  const setActiveLayer = useLayerStore((s) => s.setActiveLayer)
  const units = useLayerStore((s) => s.units)
  const setUnits = useLayerStore((s) => s.setUnits)
  const theme = useLayerStore((s) => s.theme)
  const setTheme = useLayerStore((s) => s.setTheme)
  const haptic = useHaptic()

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
              shadowOffset: {
                width: 0,
                height: 0,
              },
            }}
          >
            <Text className='font-montserrat-extrabold text-xl text-white'>
              {user?.firstName?.[0] ?? 'U'}
              {user?.lastName?.[0] ?? ''}
            </Text>
          </View>
          <View className='flex-1'>
            <Text className='font-montserrat-extrabold text-2xl text-gray-900'>
              Hola, {user?.firstName ?? 'invitado'}
            </Text>
            <Text className='font-montserrat-light text-sm text-gray-500'>
              {user?.email ?? 'cuanta-agua@local'}
            </Text>
          </View>
        </View>

        <Section title='Mapa'>
          {LAYER_OPTIONS.map((opt) => (
            <OptionRow
              key={opt.value}
              active={activeLayer === opt.value}
              label={opt.label}
              icon={opt.icon}
              onPress={() => {
                haptic.selection()
                setActiveLayer(opt.value)
              }}
            />
          ))}
        </Section>

        <Section title='Unidades'>
          {UNITS_OPTIONS.map((opt) => (
            <OptionRow
              key={opt.value}
              active={units === opt.value}
              label={opt.label}
              onPress={() => {
                haptic.selection()
                setUnits(opt.value)
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
              onPress={() => {
                haptic.selection()
                setTheme(opt.value)
              }}
            />
          ))}
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
            shadowOffset: {
              width: 0,
              height: 6,
            },
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
            <Ionicons
              name='log-out-outline'
              size={20}
              color='white'
            />
            <Text className='font-montserrat-bold text-base text-white'>
              Cerrar sesión
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

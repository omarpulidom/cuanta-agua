import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/components/colors'
import { useAuth } from '@/components/Providers/AuthProvider'
import { extractErrorMessage } from '@/api/req'
import {
  clearSavedCredentials,
  loadSavedCredentials,
  saveSavedCredentials,
} from '@/lib/mmkv'

export default function Login() {
  const router = useRouter()
  const { login, isLoggingIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [checked, setChecked] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // On mount, preload email + password from MMKV if the user previously
  // asked us to remember them. Also pre-tick the box to make the
  // affordance honest.
  useEffect(() => {
    const saved = loadSavedCredentials()
    if (saved) {
      setEmail(saved.email)
      setPassword(saved.password)
      setChecked(true)
    }
    setHydrated(true)
  }, [])

  const canSubmit =
    hydrated && email.trim().length > 0 && password.trim().length > 0 && !isLoggingIn

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev)
  }

  const toggleChecked = () => {
    setChecked((prev) => !prev)
  }

  const handleSubmit = async () => {
    if (!canSubmit) return

    setFormError(null)

    try {
      await login({
        email: email.trim(),
        password,
      })
      if (checked) {
        saveSavedCredentials({ email: email.trim(), password })
      } else {
        clearSavedCredentials()
      }
      router.replace('/')
    } catch (error) {
      let message = 'No se pudo iniciar sesión. Verifica tus credenciales.'

      const backendMessage = await extractErrorMessage(error)
      if (backendMessage) {
        message = backendMessage
      } else if (error instanceof Error && error.message) {
        message = error.message
      }

      setFormError(message)
    }
  }

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <KeyboardAvoidingView
        className='flex-1'
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className='flex-1'
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          <View className='flex-1 px-6 pt-6 pb-8'>
            <Animated.View entering={FadeInDown.delay(200)} className='mt-8 items-center'>
              <View
                className='items-center justify-center'
                style={{
                  width: 128,
                  height: 128,
                  borderRadius: 64,
                  backgroundColor: 'rgba(14,165,233,0.12)',
                  borderWidth: 1.5,
                  borderColor: 'rgba(14,165,233,0.35)',
                  shadowColor: Colors.shine.glow,
                  shadowOpacity: 0.35,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 6 },
                }}
              >
                <Ionicons name='water' size={64} color={Colors.shine.glowStrong} />
              </View>
            </Animated.View>
            <View>
              <Text className='text-2xl text-primary-500 font-medium mt-8 mb-4'>LOG IN</Text>
            </View>
            <Animated.View entering={FadeInDown.delay(300)}>
              <View className='gap-6'>
                <View className='gap-2'>
                  <Text className='text-sm font-medium text-black'>
                    Email
                    <Text className='text-primary'> *</Text>
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text)
                      if (formError) setFormError(null)
                    }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder='example@email.com'
                    placeholderTextColor={Colors.gray[700]}
                    inputMode='email'
                    autoCapitalize='none'
                    autoCorrect={false}
                    keyboardType='email-address'
                    className={`
                      h-14 px-4 rounded-2xl border-2 text-black
                      ${emailFocused ? 'border-primary bg-white' : 'border-gray-200 bg-gray-50'}
                      `}
                  />
                </View>
                <View className='gap-2'>
                  <Text className='text-sm font-medium text-black'>
                    Password
                    <Text className='text-primary'> *</Text>
                  </Text>
                  <View
                    className={`
                      h-14 flex-row items-center rounded-2xl border-2 px-4
                      ${passwordFocused ? 'border-primary bg-white' : 'border-gray-200 bg-gray-50'}
                    `}
                  >
                    <TextInput
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text)
                        if (formError) setFormError(null)
                      }}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      placeholder='Enter your password'
                      placeholderTextColor={Colors.gray[700]}
                      secureTextEntry={!showPassword}
                      autoCapitalize='none'
                      autoCorrect={false}
                      className='flex-1 text-black'
                    />
                    <TouchableOpacity
                      onPress={handleTogglePassword}
                      className='ml-2 p-1'
                      accessibilityRole='button'
                    >
                      <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color='#6B7280' />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {formError ? (
                <View className='mt-3 rounded-2xl bg-red-50 border border-red-200 p-3'>
                  <Text className='text-sm text-red-700'>{formError}</Text>
                </View>
              ) : null}

              <View className='flex-row items-center mt-4 gap-3 p-3'>
                <TouchableOpacity
                  onPress={() => toggleChecked()}
                  className={`w-6 h-6 rounded border items-center justify-center ${
                    checked ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  {checked && <Ionicons name='checkmark' size={14} color='white' />}
                </TouchableOpacity>

                <View className='flex-1'>
                  <Text
                    className={`text-sm font-medium ${checked ? 'text-secondary-900' : 'text-secondary-700'}`}
                  >
                    Recordar sesión
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                className={`
                  h-14 rounded-2xl items-center justify-center mt-2
                  ${!canSubmit ? 'bg-gray-400' : 'bg-primary-600'}
                `}
                onPress={handleSubmit}
                disabled={!canSubmit}
                activeOpacity={0.8}
                accessibilityRole='button'
              >
                {isLoggingIn ? (
                  <ActivityIndicator color='white' />
                ) : (
                  <Text className='text-white font-semibold text-base'>Login</Text>
                )}
              </TouchableOpacity>

              <View className='flex-row justify-end gap-2 mt-4'>
                <Text className='text-sm font-light'>¿No tienes cuenta?</Text>
                <TouchableOpacity
                  className='self-end'
                  onPress={() => router.push('/(auth)/register')}
                >
                  <Text className='text-sm font-medium text-primary'>Regístrate</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
            <View className='mt-auto pt-8 flex-row items-center justify-center gap-1'>
              <Text className='text-xs text-center text-gray-600'>Made with</Text>
              <Ionicons name='heart' size={16} color={Colors.primary[500]} />
              <Text className='text-xs text-center text-gray-600'>by pm</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

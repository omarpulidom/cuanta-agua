import type { Route } from 'expo-router'
import { useRouter } from 'expo-router'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { UsersHooks } from '@/api/Users/Users.Hooks'
import type {
  BaseUser,
  UserLoginRequestBody,
  UserRegisterRequestBody,
} from '@/api/Users/Users.Schemas'
import { UsersService } from '@/api/Users/Users.Service'
import { RedirectError } from '@/lib/Errors'
import { useGlobalStore } from '@/store'
import { clearSavedCredentials } from '@/lib/mmkv'

const DEFAULT_LOGIN_ROUTE: Route = '/(auth)/login'

type RequireAuthOptions = {
  redirectTo?: Route
  message?: string
}

type AuthContextValue = {
  user: BaseUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isInitializing: boolean
  isLoggingIn: boolean
  loginError: unknown
  login: (payload: UserLoginRequestBody) => Promise<{ accessToken: string; user: BaseUser }>
  register: (
    payload: UserRegisterRequestBody,
  ) => Promise<{ accessToken: string; user: BaseUser }>
  logout: () => void
  requireAuth: (options?: RequireAuthOptions) => boolean
  userOrThrow: (options?: RequireAuthOptions) => BaseUser
}

const AuthContext = createContext<AuthContextValue | null>(null)

type AuthProviderProps = {
  children: ReactNode
}

function decodeJwt(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    if (!payload) return null
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4)
    const json = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json) as { exp?: number }
  } catch {
    return null
  }
}

function isTokenValid(token: string | null): boolean {
  if (!token) return false
  const payload = decodeJwt(token)
  if (!payload?.exp) return true
  return payload.exp * 1000 > Date.now()
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true)
  const router = useRouter()
  const user = useGlobalStore((state) => state.auth.user)
  const accessToken = useGlobalStore((state) => state.auth.accessToken)
  const setUser = useGlobalStore((state) => state.auth.setUser)
  const setAccessToken = useGlobalStore((state) => state.auth.setAccessToken)
  const logOutFromStore = useGlobalStore((state) => state.auth.logOut)

  const {
    mutateAsync: loginRequest,
    isPending: isLoggingIn,
    error: loginError,
    reset: resetLoginMutation,
  } = UsersHooks.useLogin()

  const { mutateAsync: registerRequest } = UsersHooks.useRegister()

  const logout = useCallback(() => {
    logOutFromStore()
    clearSavedCredentials()
    resetLoginMutation()
    setIsInitializing(false)
    router.replace('/(auth)/login')
  }, [logOutFromStore, resetLoginMutation, router])

  const login = useCallback(
    async (payload: UserLoginRequestBody) => {
      const data = await loginRequest(payload)
      setAccessToken(data.access_token)
      setUser(data.user)
      return { accessToken: data.access_token, user: data.user }
    },
    [loginRequest, setAccessToken, setUser],
  )

  const register = useCallback(
    async (payload: UserRegisterRequestBody) => {
      const data = await registerRequest(payload)
      setAccessToken(data.access_token)
      setUser(data.user)
      return { accessToken: data.access_token, user: data.user }
    },
    [registerRequest, setAccessToken, setUser],
  )

  useEffect(() => {
    if (isTokenValid(accessToken) && user) {
      setIsInitializing(false)
      return
    }

    if (accessToken && !isTokenValid(accessToken)) {
      logout()
    }

    setIsInitializing(false)
  }, [accessToken, user, logout])

  const requireAuth = useCallback(
    (options: RequireAuthOptions = {}) => {
      if (isInitializing) {
        return false
      }

      if (!user || !isTokenValid(accessToken)) {
        throw new RedirectError(
          options.redirectTo ?? DEFAULT_LOGIN_ROUTE,
          options.message ?? 'Please sign in to continue',
        )
      }

      return true
    },
    [user, isInitializing, accessToken],
  )

  const userOrThrow = useCallback(
    (options: RequireAuthOptions = {}) => {
      if (!user) {
        throw new RedirectError(
          options.redirectTo ?? DEFAULT_LOGIN_ROUTE,
          options.message ?? 'Please sign in to continue',
        )
      }

      return user
    },
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user) && isTokenValid(accessToken),
      isInitializing,
      isLoggingIn,
      loginError,
      login,
      register,
      logout,
      requireAuth,
      userOrThrow,
    }),
    [user, accessToken, isInitializing, isLoggingIn, loginError, login, register, logout, requireAuth, userOrThrow],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

// Keep references to avoid unused-imports when bundling
void UsersService

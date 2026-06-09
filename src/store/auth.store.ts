import type { BaseUser } from '@/api/Users/Users.Schemas'
import type { GlobalTypedStateCreator } from './types'

type AuthState = {
  user: BaseUser | null
  accessToken: string | null
}

type StateActions = {
  setUser: (user: BaseUser) => void
  setAccessToken: (accessToken: string) => void

  resetUserState: () => void
  logOut: () => void
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
}

export type AuthSlice = AuthState & StateActions

function isSameUser(prev: BaseUser | null, next: BaseUser | null) {
  if (prev === next) {
    return true
  }

  if (!prev || !next) {
    return false
  }

  if (prev.id !== next.id) {
    return false
  }

  return JSON.stringify(prev) === JSON.stringify(next)
}

export const createAuthSlice: GlobalTypedStateCreator<AuthSlice> = (set) => ({
  ...initialState,

  resetUserState: () =>
    set((state) => ({
      auth: {
        ...state.auth,
        ...initialState,
      },
    })),
  setUser: (user) =>
    set((state) => {
      if (isSameUser(state.auth.user, user)) {
        return state
      }

      return {
        auth: {
          ...state.auth,
          user,
        },
      }
    }),
  setAccessToken: (accessToken) =>
    set((state) => {
      if (state.auth.accessToken === accessToken) {
        return state
      }

      return {
        auth: {
          ...state.auth,
          accessToken,
        },
      }
    }),
  logOut: () =>
    set((state) => ({
      auth: {
        ...state.auth,
        user: null,
        accessToken: null,
      },
    })),
})

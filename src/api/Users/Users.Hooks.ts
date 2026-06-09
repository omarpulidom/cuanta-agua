import { useMutation } from '@tanstack/react-query'
import type { UserLoginRequestBody, UserRegisterRequestBody } from './Users.Schemas'
import { UsersService } from './Users.Service'

export class UsersHooks {
  static KEYS = {
    login: [
      'users',
      'login',
    ] as const,
    register: [
      'users',
      'register',
    ] as const,
  }

  static useLogin() {
    return useMutation({
      mutationKey: UsersHooks.KEYS.login,
      mutationFn: (params: UserLoginRequestBody) => UsersService.login(params),
    })
  }

  static useRegister() {
    return useMutation({
      mutationKey: UsersHooks.KEYS.register,
      mutationFn: (params: UserRegisterRequestBody) => UsersService.register(params),
    })
  }
}

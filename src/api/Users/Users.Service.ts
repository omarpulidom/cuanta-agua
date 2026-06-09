import { Constants } from '@/lib/Constants'
import { req } from '../req'
import {
  type AuthResponse,
  AuthResponseSchema,
  type UserLoginRequestBody,
  type UserRegisterRequestBody,
} from './Users.Schemas'

export class UsersService {
  static async login(params: UserLoginRequestBody): Promise<AuthResponse> {
    const data = await req
      .post(Constants.ENDPOINTS.AUTH_LOGIN, {
        json: {
          email: params.email,
          password: params.password,
        },
      })
      .json()

    return AuthResponseSchema.parse(data)
  }

  static async register(params: UserRegisterRequestBody): Promise<AuthResponse> {
    const data = await req
      .post(Constants.ENDPOINTS.AUTH_REGISTER, {
        json: {
          email: params.email,
          password: params.password,
          confirm_password: params.confirmPassword,
        },
      })
      .json()

    return AuthResponseSchema.parse(data)
  }
}

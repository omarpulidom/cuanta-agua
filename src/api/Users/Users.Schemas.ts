import z from 'zod'

// Exact success shape returned by /api/login and /api/register.
// See data_warehouse_cdmx/main.py: { message, access_token, token_type, user }
export const BaseUserSchema = z.object({
  id: z.number().int(),
  email: z.email(),
})

export type BaseUser = z.infer<typeof BaseUserSchema>

export const AuthResponseSchema = z.object({
  message: z.string().optional(),
  access_token: z.string(),
  token_type: z.string().optional(),
  user: BaseUserSchema,
})

export type AuthResponse = z.infer<typeof AuthResponseSchema>

export type UserLoginRequestBody = {
  email: string
  password: string
}

export type UserRegisterRequestBody = {
  email: string
  password: string
  confirmPassword: string
}

// Client-side validation matching main.py's RegisterRequest rules:
// - email is a valid email
// - password length >= 8 and <= 128
// - password has at least one uppercase, one lowercase and one digit
const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña es demasiado larga')
  .refine((v) => /[A-Z]/.test(v), 'La contraseña debe incluir al menos una mayúscula')
  .refine((v) => /[a-z]/.test(v), 'La contraseña debe incluir al menos una minúscula')
  .refine((v) => /\d/.test(v), 'La contraseña debe incluir al menos un número')

export const UserRegisterRequestSchema = z.object({
  email: z.email('Correo inválido'),
  password: passwordSchema,
  confirmPassword: passwordSchema,
})

import ky from 'ky'
import { Constants } from '@/lib/Constants'
import { useGlobalStore } from '@/store'

const PUBLIC_PATHS = new Set<string>([
  Constants.ENDPOINTS.AUTH_LOGIN,
  Constants.ENDPOINTS.AUTH_REGISTER,
])

function isPublicPath(url: string): boolean {
  try {
    const pathname = new URL(url, 'http://_').pathname
    return PUBLIC_PATHS.has(pathname.replace(/^\/+/, ''))
  } catch {
    return false
  }
}

function handleUnauthorized(): void {
  try {
    useGlobalStore.getState().auth.logOut()
  } catch {
    // store may not be ready in edge cases
  }
}

export const req = ky.create({
  prefixUrl: Constants.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRequest: [
      async (request) => {
        const accessToken = useGlobalStore.getState().auth.accessToken
        if (accessToken) {
          request.headers.set('Authorization', `Bearer ${accessToken}`)
        }
        return request
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status === 401 && !isPublicPath(request.url)) {
          handleUnauthorized()
        }
        return response
      },
    ],
  },
  throwHttpErrors: true,
})

export function createServiceHandler(endpoint: string) {
  return req.extend((parentOptions) => {
    return {
      ...parentOptions,
      prefixUrl: `${parentOptions.prefixUrl}${endpoint}`,
    }
  })
}

type BackendErrorBody =
  | { detail: string }
  | {
      detail: Array<{
        msg: string
        loc?: Array<string | number>
        type?: string
      }>
    }

/**
 * Reads the human-readable error message from a ky `HTTPError` (FastAPI).
 * FastAPI uses two error shapes:
 *   - 4xx/5xx with string detail: { "detail": "El correo ya está registrado" }
 *   - 422 validation: { "detail": [{ "msg": "String should ...", "loc": [...] }] }
 * Returns null when the body cannot be parsed, so callers can fall back.
 */
export async function extractErrorMessage(error: unknown): Promise<string | null> {
  if (!error || typeof error !== 'object') return null

  const maybeResponse = (error as { response?: Response }).response
  if (!maybeResponse) return null

  try {
    const body = (await maybeResponse.clone().json()) as BackendErrorBody
    if (typeof body?.detail === 'string') return body.detail
    if (Array.isArray(body?.detail) && body.detail.length > 0) {
      const first = body.detail[0]
      const msg = first?.msg
      const loc = Array.isArray(first?.loc) ? first.loc.filter((p) => p !== 'body') : []
      if (loc.length > 0 && msg) return `${loc.join('.')}: ${msg}`
      return msg ?? null
    }
    return null
  } catch {
    return null
  }
}

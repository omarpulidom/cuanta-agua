import { storageMMKV } from './stores'

const CREDENTIALS_KEY = 'auth.saved-credentials.v1'

export type SavedCredentials = {
  email: string
  password: string
}

/**
 * Read the email + password the user opted to remember on the login
 * screen. Returns `null` if nothing was saved (or the entry is corrupt).
 */
export function loadSavedCredentials(): SavedCredentials | null {
  const raw = storageMMKV.getString(CREDENTIALS_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<SavedCredentials>
    if (typeof parsed.email !== 'string' || typeof parsed.password !== 'string') {
      return null
    }
    return { email: parsed.email, password: parsed.password }
  } catch {
    return null
  }
}

/**
 * Persist the email + password the user typed. Stored in the same
 * encrypted MMKV instance as the rest of the auth state, so the value
 * is at-rest encrypted with the app-level key.
 */
export function saveSavedCredentials(creds: SavedCredentials): void {
  storageMMKV.set(CREDENTIALS_KEY, JSON.stringify(creds))
}

/** Wipe any saved credentials. Called on logout or when the user unticks the box. */
export function clearSavedCredentials(): void {
  storageMMKV.delete(CREDENTIALS_KEY)
}

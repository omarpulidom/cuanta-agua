import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system/legacy'
import { type NitroSQLiteConnection, open } from 'react-native-nitro-sqlite'

const DB_NAME = 'db_cdmx.sqlite'
const DB_RUNTIME_DIR = `${FileSystem.documentDirectory}default/`
const DB_RUNTIME_PATH = `${DB_RUNTIME_DIR}${DB_NAME}`

let connectionPromise: Promise<NitroSQLiteConnection> | null = null
let ready = false

async function ensureDatabaseFile(): Promise<void> {
  const fileInfo = await FileSystem.getInfoAsync(DB_RUNTIME_PATH)
  if (fileInfo.exists) {
    return
  }

  const asset = Asset.fromModule(require('@/assets/data/db_cdmx.db'))
  await asset.downloadAsync()
  if (!asset.localUri) {
    throw new Error(
      '[db] Failed to resolve bundled SQLite asset (no localUri).',
    )
  }

  const dirInfo = await FileSystem.getInfoAsync(DB_RUNTIME_DIR)
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(DB_RUNTIME_DIR, { intermediates: true })
  }

  await FileSystem.copyAsync({
    from: asset.localUri,
    to: DB_RUNTIME_PATH,
  })
}

export async function getDb(): Promise<NitroSQLiteConnection> {
  if (ready && connectionPromise) {
    return connectionPromise
  }

  if (!connectionPromise) {
    connectionPromise = (async () => {
      await ensureDatabaseFile()

      const db = open({
        name: DB_NAME,
        location: 'default',
      })
      ready = true
      return db
    })().catch((err) => {
      connectionPromise = null
      console.warn('[db] Failed to open SQLite database:', err)
      throw err
    })
  }

  return connectionPromise
}

export function isDbReady(): boolean {
  return ready
}

export async function closeDb(): Promise<void> {
  if (connectionPromise && ready) {
    const db = await connectionPromise
    db.close()
    connectionPromise = null
    ready = false
  }
}

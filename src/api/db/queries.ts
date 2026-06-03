import { getDb } from './init'

export type ColoniaRow = {
  codigo_id: string
  codigo: string
  colonia_nombre: string
  colonia_nombre_normalizado: string
  tipo: string | null
  ciudad: string | null
  zona: string | null
  estado_id: string
  municipio_id: string
  municipio_uid: string
  municipio_nombre: string | null
  municipio_nombre_normalizado: string | null
  geometria: string | null
  min_lon: number | null
  min_lat: number | null
  max_lon: number | null
  max_lat: number | null
  centro_lon: number | null
  centro_lat: number | null
}

export type MunicipioRow = {
  id: string
  nombre: string
  estado_id: string
  municipio_uid: string
  nombre_normalizado: string
}

function parseColoniaRows(results: unknown): ColoniaRow[] {
  if (!Array.isArray(results)) return []
  return results as ColoniaRow[]
}

export async function getAllColoniasForMap(): Promise<ColoniaRow[]> {
  const db = await getDb()
  const { results } = await db.executeAsync(
    `SELECT codigo_id, codigo, colonia_nombre, colonia_nombre_normalizado,
            tipo, ciudad, zona, estado_id, municipio_id, municipio_uid,
            municipio_nombre, municipio_nombre_normalizado,
            geometria, min_lon, min_lat, max_lon, max_lat, centro_lon, centro_lat
     FROM vw_colonias_busqueda
     WHERE estado_id = '09' AND geometria IS NOT NULL AND geometria != ''`,
  )
  return parseColoniaRows(results)
}

export async function getColoniasByCodigoPostal(cp: string): Promise<ColoniaRow[]> {
  const db = await getDb()
  const { results } = await db.executeAsync(
    `SELECT codigo_id, codigo, colonia_nombre, colonia_nombre_normalizado,
            tipo, ciudad, zona, estado_id, municipio_id, municipio_uid,
            municipio_nombre, municipio_nombre_normalizado,
            geometria, min_lon, min_lat, max_lon, max_lat, centro_lon, centro_lat
     FROM vw_colonias_busqueda
     WHERE codigo = ?`,
    [cp],
  )
  return parseColoniaRows(results)
}

export async function getColoniaByCodigoId(codigoId: string): Promise<ColoniaRow | null> {
  const db = await getDb()
  const { results } = await db.executeAsync(
    `SELECT codigo_id, codigo, colonia_nombre, colonia_nombre_normalizado,
            tipo, ciudad, zona, estado_id, municipio_id, municipio_uid,
            municipio_nombre, municipio_nombre_normalizado,
            geometria, min_lon, min_lat, max_lon, max_lat, centro_lon, centro_lat
     FROM vw_colonias_busqueda
     WHERE codigo_id = ?`,
    [codigoId],
  )
  const rows = parseColoniaRows(results)
  return rows[0] ?? null
}

export async function searchColonias(
  query: string,
  limit = 20,
): Promise<ColoniaRow[]> {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const db = await getDb()
  const { results } = await db.executeAsync(
    `SELECT codigo_id, codigo, colonia_nombre, colonia_nombre_normalizado,
            tipo, ciudad, zona, estado_id, municipio_id, municipio_uid,
            municipio_nombre, municipio_nombre_normalizado,
            geometria, min_lon, min_lat, max_lon, max_lat, centro_lon, centro_lat
     FROM vw_colonias_busqueda
     WHERE estado_id = '09'
       AND (colonia_nombre_normalizado LIKE ?
            OR codigo LIKE ?
            OR municipio_nombre_normalizado LIKE ?)
     ORDER BY
       CASE WHEN colonia_nombre_normalizado LIKE ? THEN 0 ELSE 1 END,
       colonia_nombre
     LIMIT ?`,
    [`${q}%`, `${q}%`, `${q}%`, `${q}%`, limit],
  )
  return parseColoniaRows(results)
}

export async function getMunicipios(): Promise<MunicipioRow[]> {
  const db = await getDb()
  const { results } = await db.executeAsync(
    `SELECT id, nombre, estado_id, municipio_uid, nombre_normalizado
     FROM municipios
     WHERE estado_id = '09'
     ORDER BY nombre`,
  )
  if (!Array.isArray(results)) return []
  return results as MunicipioRow[]
}

export async function getColoniasInBounds(
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number,
  limit = 200,
): Promise<ColoniaRow[]> {
  const db = await getDb()
  const { results } = await db.executeAsync(
    `SELECT codigo_id, codigo, colonia_nombre, colonia_nombre_normalizado,
            tipo, ciudad, zona, estado_id, municipio_id, municipio_uid,
            municipio_nombre, municipio_nombre_normalizado,
            geometria, min_lon, min_lat, max_lon, max_lat, centro_lon, centro_lat
     FROM vw_colonias_busqueda
     WHERE estado_id = '09'
       AND geometria IS NOT NULL AND geometria != ''
       AND min_lat <= ? AND max_lat >= ?
       AND min_lon <= ? AND max_lon >= ?
     LIMIT ?`,
    [maxLat, minLat, maxLon, minLon, limit],
  )
  return parseColoniaRows(results)
}

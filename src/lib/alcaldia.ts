/**
 * Maps the alcaldia name as it appears in the GeoJSON (`NOMGEO`, mixed case
 * with diacritics) to the canonical form stored in the database and returned
 * by the FastAPI backend (uppercase, no diacritics).
 *
 * The backend query is `ILIKE %alcaldia%` which is case-insensitive but NOT
 * diacritic-insensitive (the postgres image has no `unaccent` extension), so
 * the client must send the canonical form to avoid an empty result.
 *
 * Source of truth:
 *   - DB:      docker exec dw_postgres psql ... "SELECT DISTINCT alcaldia
 *              FROM dim_ubicacion ORDER BY alcaldia;"
 *   - Backend: GET /api/alcaldias
 *   - GeoJSON: data/alcaldias_cdmx.geojson  -> features[*].properties.NOMGEO
 */

export const ALCALDIA_NOMGEO_TO_DB: Record<string, string> = {
  'Álvaro Obregón': 'ALVARO OBREGON',
  'Azcapotzalco': 'AZCAPOTZALCO',
  'Benito Juárez': 'BENITO JUAREZ',
  'Coyoacán': 'COYOACAN',
  'Cuajimalpa de Morelos': 'CUAJIMALPA DE MORELOS',
  'Cuauhtémoc': 'CUAUHTEMOC',
  'Gustavo A. Madero': 'GUSTAVO A. MADERO',
  'Iztacalco': 'IZTACALCO',
  'Iztapalapa': 'IZTAPALAPA',
  'La Magdalena Contreras': 'LA MAGDALENA CONTRERAS',
  'Miguel Hidalgo': 'MIGUEL HIDALGO',
  'Milpa Alta': 'MILPA ALTA',
  'Tláhuac': 'TLAHUAC',
  'Tlalpan': 'TLALPAN',
  'Venustiano Carranza': 'VENUSTIANO CARRANZA',
  'Xochimilco': 'XOCHIMILCO',
}

/** Inverted index for the rare case we need to go DB -> NOMGEO. */
const DB_TO_NOMGEO: Record<string, string> = Object.entries(
  ALCALDIA_NOMGEO_TO_DB,
).reduce<Record<string, string>>((acc, [nomgeo, db]) => {
  acc[db] = nomgeo
  return acc
}, {})

/**
 * Converts a GeoJSON `NOMGEO` string (e.g. "Cuauhtémoc") to the database
 * canonical form ("CUAUHTEMOC"). Pass-through if already canonical.
 * Returns the input unchanged (trimmed) when no mapping is found.
 */
export function nomgeoToAlcaldiaDb(nomgeo: string | null | undefined): string {
  if (!nomgeo) return ''
  const trimmed = nomgeo.trim()
  const mapped = ALCALDIA_NOMGEO_TO_DB[trimmed]
  if (mapped) return mapped
  // Already canonical? e.g. the search hits `/api/alcaldias` directly.
  if (DB_TO_NOMGEO[trimmed.toUpperCase()]) {
    return trimmed.toUpperCase()
  }
  return trimmed
}

/** Inverse: DB form -> GeoJSON display name. */
export function alcaldiaDbToNomgeo(dbName: string | null | undefined): string {
  if (!dbName) return ''
  return DB_TO_NOMGEO[dbName] ?? dbName
}

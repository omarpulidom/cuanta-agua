const RAW_ENV = process.env.EXPO_PUBLIC_API_ENV
const LOCAL_IP = process.env.EXPO_PUBLIC_LOCAL_IP ?? 'localhost'

const ENV =
  RAW_ENV === 'production' || RAW_ENV === 'development' || RAW_ENV === 'qa' ? RAW_ENV : 'production'

console.log({
  RAW_ENV,
  ENV,
  LOCAL_IP,
})

const API_URLS = {
  development: `http://${LOCAL_IP}:8000`,
  qa: 'https://api.qa.example.com',
  production: 'https://api.example.com',
} as const satisfies Record<typeof ENV, string>

const BASE_URL = API_URLS[ENV]

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? ''
const MAP_STYLE_LIGHT = 'mapbox://styles/mapbox/light-v11'
const MAP_STYLE_DARK = 'mapbox://styles/mapbox/dark-v11'

if (!MAPBOX_TOKEN) {
  console.warn(
    '[Constants] EXPO_PUBLIC_MAPBOX_TOKEN is empty. Mapbox map will not render. Add it to .env.local.',
  )
}

export class Constants {
  static ENV = process.env.NODE_ENV
  static IS_DEV = Constants.ENV === 'development'
  static BASE_URL = BASE_URL
  static API_URL = BASE_URL
  static TIMEOUT = 60_000 // 60 seconds
  static S3_BUCKET_URL = ''

  static ENDPOINTS = {
    AUTH_LOGIN: 'api/login',
    AUTH_REGISTER: 'api/register',
    CONSUMO: 'api/consumo',
    CONSUMO_ALCALDIA: 'api/consumo/alcaldia',
    CONSUMO_RESUMEN: 'api/consumo/resumen',
    TOP_CONSUMO: 'api/top-consumo',
    CORRELACION: 'api/correlacion',
    UBICACIONES_ALCALDIAS: 'api/ubicaciones/alcaldias',
    UBICACIONES_COLONIAS: 'api/ubicaciones/colonias',
    ALCALDIAS: 'api/alcaldias',
    COLONIAS: 'api/colonias',
    INDICES: 'api/indices',
    ANIOS: 'api/anios',
    BIMESTRES: 'api/bimestres',
    GEOJSON_ALCALDIAS: 'api/geojson/alcaldias',
    HEALTH: 'api/health',
  } as const

  static MAPBOX_TOKEN = MAPBOX_TOKEN
  static MAP_STYLE_LIGHT = MAP_STYLE_LIGHT
  static MAP_STYLE_DARK = MAP_STYLE_DARK
  static MAP_STYLE_URL = MAP_STYLE_LIGHT

  static MAP_INITIAL_CAMERA = {
    centerCoordinate: [
      -99.1332,
      19.4326,
    ] as [number, number],
    zoomLevel: 10.5,
    minZoomLevel: 9,
    maxZoomLevel: 16,
  }
}

export type ENDPOINTS = (typeof Constants.ENDPOINTS)[keyof typeof Constants.ENDPOINTS]

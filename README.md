# 💧 ¿Cuanta agua?

Una app para consultar datos de **clima** y **consumo de agua** y verlos sobre un **mapa interactivo**, con una pantalla de detalles por ubicación.

> 🚧 En desarrollo. El template está listo y la autenticación corre en modo mock mientras se conectan las APIs.

## 🤔 ¿De qué trata?

La idea es simple: responder la pregunta **"¿cuánta agua?"** cruzando dos fuentes de información.

- 🌦️ **Clima** — condiciones actuales y pronóstico por zona.
- 💧 **Consumo de agua** — datos históricos o estimados por región.
- 🗺️ **Mapa interactivo GeoJSON** — visualiza ambas capas en un solo mapa.
- 📍 **Detalles por ubicación** — toca una zona del mapa y abre su vista con la información completa.

Pensada para que un usuario pueda explorar, de un vistazo, cómo varía el consumo de agua en relación con el clima local.

## 🧭 Pantallas previstas

| Pantalla | Propósito |
|---|---|
| **Mapa** | Vista principal con capas GeoJSON (clima + agua) |
| **Detalles** | Información extendida de la zona seleccionada |
| **Login (mock)** | Entrada temporal mientras no hay auth real |

## 🧱 Stack (resumen)

Expo · React Native · TypeScript · Expo Router · NativeWind (Tailwind) · TanStack Query · Zustand · MMKV.

## 🔌 Backend

La app consume el backend FastAPI en `data_warehouse_cdmx/` (repo hermano). Las URLs se configuran en `src/lib/Constants.ts:13` según el ambiente (`EXPO_PUBLIC_API_ENV`):

| ENV | URL |
|---|---|
| `development` | `http://<LOCAL_IP>:8000` |
| `qa` | `https://api.qa.example.com` |
| `production` | `https://dw-cdmx-api.onrender.com` |

### Credenciales demo (backend en Render)

```
Email:    guest@guest.com
Password: Guest001@
```

## 🛠️ Build local de la app (APK / IPA)

Para generar los binarios localmente sin subirlos a stores:

```bash
# Login en EAS (solo la primera vez)
eas login

# Generar APK de Android
eas build -e production -p android --local

# Generar IPA de iOS
eas build -e production -p ios --local
```

Los archivos generados quedan en la carpeta del build y los puedes distribuir por link directo o TestFlight.

> **Nota**: en `production` la app apunta a `https://dw-cdmx-api.onrender.com`. Asegúrate de que el backend esté desplegado antes de generar el build.

## 👤 Autor

Made with ❤️ by pm

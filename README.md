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

## 👤 Autor

Made with ❤️ by pm

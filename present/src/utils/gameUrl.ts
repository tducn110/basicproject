// Keep every playable entry point on the same production build as the embedded board.
export const PRODUCTION_CARO_GAME_URL = "https://10-caro.vercel.app"

const configuredUrl = import.meta.env.VITE_CARO_GAME_URL?.trim()
const localHost = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname)
const useLocalGame = import.meta.env.DEV || localHost

export const CARO_GAME_URL = configuredUrl || (useLocalGame
  ? `${window.location.protocol}//${window.location.hostname}:8443`
  : PRODUCTION_CARO_GAME_URL)

export const CARO_GAME_LABEL = new URL(CARO_GAME_URL, window.location.href).host

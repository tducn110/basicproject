// Keep every playable entry point on the same build as the embedded board.
const configuredUrl = import.meta.env.VITE_CARO_GAME_URL?.trim()
const localHost = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname)
const useLocalGame = import.meta.env.DEV || localHost

export const CARO_GAME_URL = configuredUrl || (useLocalGame
  ? `${window.location.protocol}//${window.location.hostname}:8443`
  : "https://10-caro.vercel.app")

export const CARO_GAME_LABEL = new URL(CARO_GAME_URL, window.location.href).host

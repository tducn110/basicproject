import { useCallback, useState } from "react"
import { soundManager } from "../audio/soundManager"

export interface UseGameAudioReturn {
  isMuted: boolean
  toggleMute: () => void
  playPlacePiece: (player: "X" | "O") => void
  playWin: () => void
  playDraw: () => void
  playButtonClick: () => void
}

/**
 * React hook quản lý trạng thái âm thanh và cầu nối tới SoundManager.
 * Tuân thủ React Docs: không chạy audio side-effect trong render.
 */
export function useGameAudio(): UseGameAudioReturn {
  const [isMuted, setIsMuted] = useState(() => soundManager.getMuted())

  const toggleMute = useCallback(() => {
    const nextMuted = soundManager.toggleMute()
    setIsMuted(nextMuted)
  }, [])

  const playPlacePiece = useCallback((player: "X" | "O") => {
    soundManager.playPlacePiece(player)
  }, [])

  const playWin = useCallback(() => {
    soundManager.playWin()
  }, [])

  const playDraw = useCallback(() => {
    soundManager.playDraw()
  }, [])

  const playButtonClick = useCallback(() => {
    soundManager.playButtonClick()
  }, [])

  return {
    isMuted,
    toggleMute,
    playPlacePiece,
    playWin,
    playDraw,
    playButtonClick,
  }
}

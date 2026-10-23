// Web Audio API Synthesizer with Master Limiter (DynamicsCompressorNode)
class SoundSynthesizer {
  private ctx: AudioContext | null = null
  private compressor: DynamicsCompressorNode | null = null
  private isMuted: boolean = false

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()

      // Master Limiter Bus
      this.compressor = this.ctx.createDynamicsCompressor()
      this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime)
      this.compressor.knee.setValueAtTime(30, this.ctx.currentTime)
      this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime)
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime)
      this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime)

      this.compressor.connect(this.ctx.destination)
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted
    return this.isMuted
  }

  public getMuted(): boolean {
    return this.isMuted
  }

  public playClick() {
    if (this.isMuted) return
    this.init()
    if (!this.ctx || !this.compressor) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(800, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04)

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04)

    osc.connect(gain)
    gain.connect(this.compressor)

    osc.start()
    osc.stop(this.ctx.currentTime + 0.04)
  }

  public playPiece(player: "X" | "O") {
    if (this.isMuted) return
    this.init()
    if (!this.ctx || !this.compressor) return

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    const freq = player === "X" ? 440 : 587.33
    osc.type = "triangle"
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + 0.08)

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08)

    osc.connect(gain)
    gain.connect(this.compressor)

    osc.start()
    osc.stop(this.ctx.currentTime + 0.08)
  }

  public playWin() {
    if (this.isMuted) return
    this.init()
    if (!this.ctx || !this.compressor) return

    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator()
      const gain = this.ctx!.createGain()

      const startTime = this.ctx!.currentTime + idx * 0.09
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, startTime)

      gain.gain.setValueAtTime(0.18, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25)

      osc.connect(gain)
      gain.connect(this.compressor!)

      osc.start(startTime)
      osc.stop(startTime + 0.25)
    })
  }
}

export const soundManager = new SoundSynthesizer()

/**
 * Audio Engine cho Cờ Caro (Vintage Paper / Parchment Aesthetic)
 * Tuân thủ tiêu chuẩn: `game-audio-design` và `game-audio-mastering`.
 * 
 * - Tự động tổng hợp âm thanh bằng Web Audio API (không phụ thuộc file ngoài, không 404).
 * - Master Bus với DynamicsCompressorNode brick-wall limiter chống méo tiếng / rè loa.
 * - Tự động unlock AudioContext trên mobile / iOS Safari khi có cử chỉ tương tác đầu tiên.
 */

class SoundManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private uiGain: GainNode | null = null
  private limiter: DynamicsCompressorNode | null = null
  private isMuted: boolean = false

  constructor() {
    // Khởi tạo trạng thái mute từ localStorage nếu có
    try {
      this.isMuted = localStorage.getItem("caro_sound_muted") === "true"
    } catch {
      this.isMuted = false
    }
  }

  /**
   * Khởi tạo hoặc kích hoạt AudioContext khi có tương tác người dùng
   */
  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return null

      this.ctx = new AudioCtx()

      // Master Limiter (DynamicsCompressorNode) chống clipping theo chuẩn game-audio-mastering
      this.limiter = this.ctx.createDynamicsCompressor()
      this.limiter.threshold.setValueAtTime(-3.0, this.ctx.currentTime) // -3 dBFS ceiling
      this.limiter.knee.setValueAtTime(4.0, this.ctx.currentTime)
      this.limiter.ratio.setValueAtTime(20.0, this.ctx.currentTime)
      this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime)
      this.limiter.release.setValueAtTime(0.12, this.ctx.currentTime)
      this.limiter.connect(this.ctx.destination)

      // Master Gain Bus
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime)
      this.masterGain.connect(this.limiter)

      // SFX Sub-bus (Tỉ lệ chuẩn 0.45 ~ -7dB)
      this.sfxGain = this.ctx.createGain()
      this.sfxGain.gain.setValueAtTime(0.45, this.ctx.currentTime)
      this.sfxGain.connect(this.masterGain)

      // UI Sub-bus (Tỉ lệ chuẩn 0.28 ~ -11dB)
      this.uiGain = this.ctx.createGain()
      this.uiGain.gain.setValueAtTime(0.28, this.ctx.currentTime)
      this.uiGain.connect(this.masterGain)
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {})
    }

    return this.ctx
  }

  public getMuted(): boolean {
    return this.isMuted
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted
    try {
      localStorage.setItem("caro_sound_muted", muted ? "true" : "false")
    } catch {}

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1.0, this.ctx.currentTime)
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted)
    return this.isMuted
  }

  /**
   * Âm thanh đặt quân cờ (X hoặc O)
   * Giả lập tiếng gõ quân cờ gỗ/giấy lên mặt bàn (warm wooden snap)
   */
  public playPlacePiece(player: "X" | "O"): void {
    if (this.isMuted) return
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGain) return

    const now = ctx.currentTime

    // 1. Oscillator tạo âm đục gỗ ấm
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    // Tần số khác biệt tinh tế giữa X và O
    const startFreq = player === "X" ? 340 : 260
    const endFreq = player === "X" ? 110 : 80

    osc.type = "sine"
    osc.frequency.setValueAtTime(startFreq, now)
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08)

    // Biquad filter loại bỏ âm sắc quá gắt, tạo độ ấm giấy vintage
    filter.type = "lowpass"
    filter.frequency.setValueAtTime(1400, now)

    // Envelope ngắn (80ms)
    gain.gain.setValueAtTime(0.7, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.sfxGain)

    osc.start(now)
    osc.stop(now + 0.08)

    // 2. Click transient ngắn (15ms) mô phỏng tiếng chạm bề mặt
    const clickOsc = ctx.createOscillator()
    const clickGain = ctx.createGain()
    clickOsc.type = "triangle"
    clickOsc.frequency.setValueAtTime(player === "X" ? 600 : 480, now)
    clickOsc.frequency.exponentialRampToValueAtTime(120, now + 0.02)

    clickGain.gain.setValueAtTime(0.4, now)
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02)

    clickOsc.connect(clickGain)
    clickGain.connect(this.sfxGain)

    clickOsc.start(now)
    clickOsc.stop(now + 0.02)
  }

  /**
   * Âm thanh chiến thắng (Victory Fanfare)
   * Chuỗi hợp âm ngân vang ấm áp (C5 - E5 - G5 - C6)
   */
  public playWin(): void {
    if (this.isMuted) return
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGain) return

    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6

    notes.forEach((freq, index) => {
      const startTime = now + index * 0.12
      const duration = 0.55

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, startTime)

      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.35, startTime + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

      osc.connect(gain)
      gain.connect(this.sfxGain!)

      osc.start(startTime)
      osc.stop(startTime + duration)
    })
  }

  /**
   * Âm thanh hòa cờ (Draw Sound)
   * Âm hưởng trầm lắng, trung tính (E4 -> B3)
   */
  public playDraw(): void {
    if (this.isMuted) return
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGain) return

    const now = ctx.currentTime
    const notes = [329.63, 246.94] // E4, B3

    notes.forEach((freq, index) => {
      const startTime = now + index * 0.15
      const duration = 0.4

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, startTime)

      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.28, startTime + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

      osc.connect(gain)
      gain.connect(this.sfxGain!)

      osc.start(startTime)
      osc.stop(startTime + duration)
    })
  }

  /**
   * Âm thanh click nút giao diện (Button Tap)
   */
  public playButtonClick(): void {
    if (this.isMuted) return
    const ctx = this.ensureContext()
    if (!ctx || !this.uiGain) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "triangle"
    osc.frequency.setValueAtTime(520, now)
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.035)

    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035)

    osc.connect(gain)
    gain.connect(this.uiGain)

    osc.start(now)
    osc.stop(now + 0.035)
  }
}

export const soundManager = new SoundManager()

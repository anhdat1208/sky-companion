/**
 * Architecture-only audio bus for Journey Mode.
 * No copyrighted assets are bundled. Future ambient / space / narration
 * audio can plug in here without changing JourneyEngine.
 */
export class AudioBus {
  private muted = false
  private ambientKey: string | null = null
  private spaceKey: string | null = null
  private narrationRef: string | null = null

  setMuted(muted: boolean): void {
    this.muted = muted
  }

  isMuted(): boolean {
    return this.muted
  }

  setAmbient(key: string | null): void {
    this.ambientKey = key
    // Future: start/stop ambient soundtrack
  }

  setSpace(key: string | null): void {
    this.spaceKey = key
  }

  setNarration(audioRef: string | null): void {
    this.narrationRef = audioRef
    // Future: play narration clip if !muted
  }

  getState(): {
    muted: boolean
    ambientKey: string | null
    spaceKey: string | null
    narrationRef: string | null
  } {
    return {
      muted: this.muted,
      ambientKey: this.ambientKey,
      spaceKey: this.spaceKey,
      narrationRef: this.narrationRef
    }
  }

  dispose(): void {
    this.ambientKey = null
    this.spaceKey = null
    this.narrationRef = null
  }
}

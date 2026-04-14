export function playBeep(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Set beep frequency and type
      oscillator.frequency.value = 800 // 800 Hz tone
      oscillator.type = "sine"

      // Set volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

      // Play beep
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)

      oscillator.onended = () => {
        audioContext.close()
        resolve()
      }
    } catch (error) {
      console.error("[v0] Beep playback error:", error)
      resolve()
    }
  })
}

// Web Audio API sound effects — Bubbly / cellular theme for agar.io

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
) {
  try {
    const ctx = getAudioContext()

    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch {
    // Audio not available, silently fail
  }
}

// Eating food — soft bubbly pop
export function playEatSound() {
  playTone(480, 0.06, 'sine', 0.1)
}

// Eating another player — satisfying gulp with pitch drop
export function playEatPlayerSound() {
  playTone(350, 0.12, 'sine', 0.2)
  setTimeout(() => playTone(250, 0.1, 'sine', 0.15), 50)
}

// Splitting — quick whoosh outward (ascending pair)
export function playSplitSound() {
  playTone(300, 0.08, 'triangle', 0.18)
  setTimeout(() => playTone(450, 0.06, 'triangle', 0.14), 30)
}

// Ejecting mass — short low thud
export function playEjectSound() {
  playTone(180, 0.05, 'triangle', 0.12)
}

// Hitting a virus — chaotic scatter burst
export function playVirusSound() {
  playTone(200, 0.15, 'sawtooth', 0.18)
  setTimeout(() => playTone(350, 0.08, 'square', 0.12), 40)
  setTimeout(() => playTone(150, 0.1, 'sawtooth', 0.1), 80)
}

// Player death — low descending rumble
export function playDeathSound() {
  playTone(180, 0.3, 'sawtooth', 0.25)
  setTimeout(() => playTone(100, 0.25, 'sawtooth', 0.2), 80)
}

// Resume audio context on user interaction (required by browsers)
export function initAudio() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
  } catch {
    // Audio not available
  }
}

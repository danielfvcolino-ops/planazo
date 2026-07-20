import confetti from 'canvas-confetti'

const PALETTE = ['#fb5f8e', '#a47dff', '#ffa257', '#ff86ac', '#8b5cf6']

/** Confeti "medio" al abrir el sobre. */
export function fireEnvelopeConfetti(reducedMotion: boolean): void {
  if (reducedMotion) {
    void confetti({
      particleCount: 40,
      spread: 60,
      startVelocity: 25,
      origin: { y: 0.4 },
      colors: PALETTE,
      disableForReducedMotion: true,
    })
    return
  }

  void confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 45,
    origin: { y: 0.35 },
    colors: PALETTE,
  })
}

/** Explosión grande de celebración al pulsar "SÍ". */
export function fireCelebrationConfetti(reducedMotion: boolean): void {
  if (reducedMotion) {
    void confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.5 },
      colors: PALETTE,
      disableForReducedMotion: true,
    })
    return
  }

  const end = Date.now() + 700
  const frame = () => {
    void confetti({
      particleCount: 6,
      angle: 60,
      spread: 65,
      origin: { x: 0, y: 0.6 },
      colors: PALETTE,
    })
    void confetti({
      particleCount: 6,
      angle: 120,
      spread: 65,
      origin: { x: 1, y: 0.6 },
      colors: PALETTE,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()

  void confetti({
    particleCount: 140,
    spread: 100,
    startVelocity: 55,
    origin: { y: 0.4 },
    colors: PALETTE,
  })
}

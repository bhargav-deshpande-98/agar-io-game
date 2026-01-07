import { useEffect, useCallback, useRef } from 'react'

interface UseGameInputProps {
  onMouseMove: (x: number, y: number) => void
  onSplit: () => void
  onEject: () => void
  isPlaying: boolean
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export function useGameInput({
  onMouseMove,
  onSplit,
  onEject,
  isPlaying,
  canvasRef,
}: UseGameInputProps) {
  const ejectIntervalRef = useRef<number | null>(null)

  // Mouse move handler
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isPlaying) return

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      onMouseMove(x, y)
    },
    [isPlaying, canvasRef, onMouseMove]
  )

  // Touch move handler
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPlaying) return
      e.preventDefault()

      const touch = e.touches[0]
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      onMouseMove(x, y)
    },
    [isPlaying, canvasRef, onMouseMove]
  )

  // Keyboard handlers
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isPlaying) return

      if (e.code === 'Space') {
        e.preventDefault()
        onSplit()
      }

      if (e.code === 'KeyW') {
        e.preventDefault()
        onEject()
        
        // Start continuous ejecting if held
        if (!ejectIntervalRef.current) {
          ejectIntervalRef.current = window.setInterval(() => {
            onEject()
          }, 50)
        }
      }
    },
    [isPlaying, onSplit, onEject]
  )

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'KeyW') {
        if (ejectIntervalRef.current) {
          clearInterval(ejectIntervalRef.current)
          ejectIntervalRef.current = null
        }
      }
    },
    []
  )

  // Touch split (double tap)
  const lastTapRef = useRef<number>(0)
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!isPlaying) return

      const now = Date.now()
      if (now - lastTapRef.current < 300) {
        // Double tap - split
        onSplit()
      }
      lastTapRef.current = now

      // Initial touch position
      const touch = e.touches[0]
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      onMouseMove(x, y)
    },
    [isPlaying, canvasRef, onMouseMove, onSplit]
  )

  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove)
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)

      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('touchstart', handleTouchStart)
        canvas.removeEventListener('touchmove', handleTouchMove)
      }

      if (ejectIntervalRef.current) {
        clearInterval(ejectIntervalRef.current)
      }
    }
  }, [
    canvasRef,
    handleKeyDown,
    handleKeyUp,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
  ])
}

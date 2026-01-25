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
      e.stopPropagation()

      const touch = e.touches[0]
      if (!touch) return

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

  // Touch start handler - track position immediately
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!isPlaying) return
      e.preventDefault()
      e.stopPropagation()

      // Initial touch position
      const touch = e.touches[0]
      if (!touch) return

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      onMouseMove(x, y)
    },
    [isPlaying, canvasRef, onMouseMove]
  )

  // Touch end handler
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!isPlaying) return
      e.preventDefault()
    },
    [isPlaying]
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
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false })
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)

      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('touchstart', handleTouchStart)
        canvas.removeEventListener('touchmove', handleTouchMove)
        canvas.removeEventListener('touchend', handleTouchEnd)
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
    handleTouchEnd,
  ])
}

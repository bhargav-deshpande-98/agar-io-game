import { useEffect, useCallback, RefObject } from 'react'

export function useCanvasSetup(
  canvasRef: RefObject<HTMLCanvasElement>,
  containerRef: RefObject<HTMLDivElement>
) {
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current

    if (!canvas || !container) return

    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }
  }, [canvasRef, containerRef])

  useEffect(() => {
    setupCanvas()

    const handleResize = () => {
      setupCanvas()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setupCanvas])

  const container = containerRef.current
  if (!container) return { width: 0, height: 0 }

  const rect = container.getBoundingClientRect()
  return { width: rect.width, height: rect.height }
}

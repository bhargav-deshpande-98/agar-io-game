import { useRef, useEffect, useCallback } from 'react'

type GameLoopCallback = (deltaTime: number) => void

export function useGameLoop(callback: GameLoopCallback, isRunning: boolean) {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()
  const callbackRef = useRef<GameLoopCallback>(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current
      callbackRef.current(deltaTime)
    }
    previousTimeRef.current = time
    requestRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    if (isRunning) {
      previousTimeRef.current = undefined
      requestRef.current = requestAnimationFrame(animate)
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [isRunning, animate])
}

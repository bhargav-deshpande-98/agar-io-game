import { useRef, useState, useCallback, useEffect } from 'react'
import { useGameLoop, useGameInput, useCanvasSetup } from '@/hooks'
import {
  initializeGame,
  startGame,
  updateGame,
  renderGame,
  updateMousePosition,
  playerSplit,
  playerEject,
  type GameData,
} from '@/game'
import StartScreen from './StartScreen'
import GameOverScreen from './GameOverScreen'
import GameUI from './GameUI'
import { initAudio, playEatSound, playEatPlayerSound, playSplitSound, playEjectSound, playVirusSound, playDeathSound } from '@/lib/sounds'

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameData, setGameData] = useState<GameData | null>(null)
  const gameDataRef = useRef<GameData | null>(null)
  const [playerName, setPlayerName] = useState('')

  const { width, height } = useCanvasSetup(canvasRef, containerRef)

  // Initialize game
  useEffect(() => {
    const initialData = initializeGame()
    setGameData(initialData)
    gameDataRef.current = initialData

    // Auto-start if nickname is passed via URL params (from Playbite app)
    const params = new URLSearchParams(window.location.search)
    const nickname = params.get('nickname')
    if (nickname) {
      initAudio()
      const newGame = startGame(initialData, nickname)
      setGameData(newGame)
      gameDataRef.current = newGame
      setPlayerName(nickname)
    }
  }, [])

  useEffect(() => {
    gameDataRef.current = gameData
  }, [gameData])

  // Start game handler
  const handleStart = useCallback((name: string) => {
    if (!gameDataRef.current) return
    initAudio()
    const newGame = startGame(gameDataRef.current, name)
    setGameData(newGame)
    gameDataRef.current = newGame
    setPlayerName(name)
  }, [])

  // Mouse move handler
  const handleMouseMove = useCallback(
    (x: number, y: number) => {
      if (!gameDataRef.current) return
      const updated = updateMousePosition(gameDataRef.current, x, y, width, height)
      gameDataRef.current = updated
    },
    [width, height]
  )

  // Split handler
  const handleSplit = useCallback(() => {
    if (!gameDataRef.current) return
    const prev = gameDataRef.current
    const updated = playerSplit(gameDataRef.current)
    if (updated.player && prev.player && updated.player.cells.length > prev.player.cells.length) {
      playSplitSound()
    }
    setGameData(updated)
    gameDataRef.current = updated
  }, [])

  // Eject handler
  const handleEject = useCallback(() => {
    if (!gameDataRef.current) return
    const prev = gameDataRef.current
    const updated = playerEject(gameDataRef.current)
    if (updated.ejectedMass.length > prev.ejectedMass.length) {
      playEjectSound()
    }
    setGameData(updated)
    gameDataRef.current = updated
  }, [])

  // Input handling
  useGameInput({
    onMouseMove: handleMouseMove,
    onSplit: handleSplit,
    onEject: handleEject,
    isPlaying: gameData?.gameState === 'playing',
    canvasRef,
  })

  // Game loop
  const gameLoopCallback = useCallback(
    (dt: number) => {
      if (!gameDataRef.current || !canvasRef.current) return

      const prev = gameDataRef.current
      const updated = updateGame(prev, dt)

      if (updated !== prev) {
        // Detect game events by comparing state
        if (prev.player && updated.player && updated.player.cells.length > 0) {
          // Player score increased means player ate something
          if (updated.score > prev.score) {
            // Check if player ate another player's cell (AI cells decreased)
            const prevAICells = prev.aiPlayers.reduce((sum, ai) => sum + ai.cells.length, 0)
            const newAICells = updated.aiPlayers.reduce((sum, ai) => sum + ai.cells.length, 0)
            if (newAICells < prevAICells) {
              playEatPlayerSound()
            } else {
              playEatSound()
            }
          }

          // Virus hit (player cell count suddenly jumped up beyond a split)
          if (updated.player.cells.length > prev.player.cells.length + 1) {
            playVirusSound()
          }
        }

        // Player died
        if (prev.gameState === 'playing' && updated.gameState === 'gameover') {
          playDeathSound()
        }

        setGameData(updated)
        gameDataRef.current = updated
      }

      const ctx = canvasRef.current.getContext('2d')
      if (ctx && width > 0 && height > 0) {
        renderGame(ctx, updated, width, height)
      }
    },
    [width, height]
  )

  useGameLoop(gameLoopCallback, gameData?.gameState === 'playing')

  // Restart handler
  const handleRestart = useCallback(() => {
    if (!gameDataRef.current) return
    initAudio()
    const newGame = startGame(initializeGame(), playerName)
    setGameData(newGame)
    gameDataRef.current = newGame
  }, [playerName])

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-[#111111]"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none"
        style={{
          cursor: gameData?.gameState === 'playing' ? 'none' : 'default',
          touchAction: 'none',
        }}
      />

      {gameData && (
        <>
          {gameData.gameState === 'playing' && (
            <GameUI
              score={gameData.score}
              leaderboard={gameData.leaderboard}
              onSplit={handleSplit}
              onEject={handleEject}
            />
          )}

          {gameData.gameState === 'start' && (
            <StartScreen onStart={handleStart} />
          )}

          {gameData.gameState === 'gameover' && (
            <GameOverScreen
              score={gameData.score}
              highScore={gameData.highScore}
              onRestart={handleRestart}
            />
          )}
        </>
      )}
    </div>
  )
}

export type GameState = 'start' | 'playing' | 'gameover'

export interface Vector2 {
  x: number
  y: number
}

export interface Cell {
  id: string
  x: number
  y: number
  mass: number
  radius: number
  color: string
  velocityX: number
  velocityY: number
  mergeTime: number // Timestamp when this cell can merge back
}

export interface Player {
  id: string
  name: string
  cells: Cell[]
  color: string
  isAI: boolean
  targetX: number
  targetY: number
  score: number
}

export interface Food {
  id: string
  x: number
  y: number
  color: string
  mass: number
}

export interface Virus {
  id: string
  x: number
  y: number
  mass: number
  feedCount: number
}

export interface EjectedMass {
  id: string
  x: number
  y: number
  mass: number
  velocityX: number
  velocityY: number
  color: string
}

export interface Camera {
  x: number
  y: number
  zoom: number
  targetZoom: number
}

export interface LeaderboardEntry {
  id: string
  name: string
  score: number
  isPlayer: boolean
}

export interface GameData {
  gameState: GameState
  player: Player | null
  aiPlayers: Player[]
  food: Food[]
  viruses: Virus[]
  ejectedMass: EjectedMass[]
  camera: Camera
  mouseX: number
  mouseY: number
  score: number
  highScore: number
  leaderboard: LeaderboardEntry[]
}

import type { Player, Cell } from './types'
import { createCell, getTotalMass } from './Cell'
import { STARTING_MASS, COLORS, WORLD_SIZE } from './constants'

let playerIdCounter = 0

export function createPlayer(
  name: string,
  isAI: boolean,
  x?: number,
  y?: number,
  color?: string
): Player {
  const spawnX = x ?? Math.random() * (WORLD_SIZE - 200) + 100
  const spawnY = y ?? Math.random() * (WORLD_SIZE - 200) + 100
  const cellColor = color ?? COLORS.cellColors[Math.floor(Math.random() * COLORS.cellColors.length)]

  const startingCell = createCell(spawnX, spawnY, STARTING_MASS, cellColor)

  return {
    id: `player_${playerIdCounter++}`,
    name,
    cells: [startingCell],
    color: cellColor,
    isAI,
    targetX: spawnX,
    targetY: spawnY,
    score: STARTING_MASS,
  }
}

export function getPlayerScore(player: Player): number {
  return Math.floor(getTotalMass(player.cells))
}

export function getPlayerRadius(player: Player): number {
  // Return the largest cell's radius
  return Math.max(...player.cells.map(c => c.radius), 0)
}

export function isPlayerAlive(player: Player): boolean {
  return player.cells.length > 0
}

export function respawnPlayer(player: Player): Player {
  const spawnX = Math.random() * (WORLD_SIZE - 200) + 100
  const spawnY = Math.random() * (WORLD_SIZE - 200) + 100
  const startingCell = createCell(spawnX, spawnY, STARTING_MASS, player.color)

  return {
    ...player,
    cells: [startingCell],
    targetX: spawnX,
    targetY: spawnY,
    score: STARTING_MASS,
  }
}

import type { Player, Food, Virus, Cell } from './types'
import { getTotalMass, getCenterOfMass, canEat } from './Cell'
import { WORLD_SIZE, AI_NAMES, EAT_RATIO } from './constants'
import { createPlayer } from './Player'

export function createAIPlayer(): Player {
  const name = AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)]
  return createPlayer(name, true)
}

export function updateAIPlayer(
  ai: Player,
  allPlayers: Player[],
  food: Food[],
  viruses: Virus[]
): Player {
  if (ai.cells.length === 0) return ai

  const center = getCenterOfMass(ai.cells)
  const totalMass = getTotalMass(ai.cells)
  const mainCell = ai.cells[0]

  let targetX = ai.targetX
  let targetY = ai.targetY

  // Find nearest food
  let nearestFood: Food | null = null
  let nearestFoodDist = 500

  for (const f of food) {
    const dx = f.x - center.x
    const dy = f.y - center.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < nearestFoodDist) {
      nearestFoodDist = dist
      nearestFood = f
    }
  }

  // Find threats and prey
  let nearestThreat: { x: number; y: number; dist: number } | null = null
  let nearestPrey: { x: number; y: number; dist: number; mass: number } | null = null

  for (const other of allPlayers) {
    if (other.id === ai.id || other.cells.length === 0) continue

    for (const cell of other.cells) {
      const dx = cell.x - center.x
      const dy = cell.y - center.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Is this a threat? (can eat us)
      if (cell.mass > totalMass * EAT_RATIO && dist < 400) {
        if (!nearestThreat || dist < nearestThreat.dist) {
          nearestThreat = { x: cell.x, y: cell.y, dist }
        }
      }

      // Is this prey? (we can eat them)
      if (totalMass > cell.mass * EAT_RATIO && dist < 600) {
        if (!nearestPrey || dist < nearestPrey.dist) {
          nearestPrey = { x: cell.x, y: cell.y, dist, mass: cell.mass }
        }
      }
    }
  }

  // Find nearby viruses to avoid
  let nearestVirus: { x: number; y: number; dist: number } | null = null
  if (totalMass > 150) {
    for (const virus of viruses) {
      const dx = virus.x - center.x
      const dy = virus.y - center.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 200) {
        if (!nearestVirus || dist < nearestVirus.dist) {
          nearestVirus = { x: virus.x, y: virus.y, dist }
        }
      }
    }
  }

  // Decision making priority:
  // 1. Run from threats
  // 2. Avoid viruses (if big)
  // 3. Chase prey
  // 4. Go to food
  // 5. Wander

  if (nearestThreat && nearestThreat.dist < 300) {
    // Run away from threat
    const angle = Math.atan2(center.y - nearestThreat.y, center.x - nearestThreat.x)
    targetX = center.x + Math.cos(angle) * 500
    targetY = center.y + Math.sin(angle) * 500
  } else if (nearestVirus && nearestVirus.dist < 150) {
    // Avoid virus
    const angle = Math.atan2(center.y - nearestVirus.y, center.x - nearestVirus.x)
    targetX = center.x + Math.cos(angle) * 200
    targetY = center.y + Math.sin(angle) * 200
  } else if (nearestPrey && nearestPrey.dist < 400) {
    // Chase prey
    targetX = nearestPrey.x
    targetY = nearestPrey.y
  } else if (nearestFood) {
    // Go to food
    targetX = nearestFood.x
    targetY = nearestFood.y
  } else {
    // Wander randomly
    if (Math.random() < 0.02) {
      targetX = Math.random() * WORLD_SIZE
      targetY = Math.random() * WORLD_SIZE
    }
  }

  // Avoid world edges
  const margin = 100
  targetX = Math.max(margin, Math.min(WORLD_SIZE - margin, targetX))
  targetY = Math.max(margin, Math.min(WORLD_SIZE - margin, targetY))

  return {
    ...ai,
    targetX,
    targetY,
  }
}

export function shouldAISplit(ai: Player, allPlayers: Player[]): boolean {
  if (ai.cells.length >= 4) return false
  
  const mainCell = ai.cells[0]
  if (mainCell.mass < 70) return false

  // Check if there's prey we could catch by splitting
  const center = getCenterOfMass(ai.cells)

  for (const other of allPlayers) {
    if (other.id === ai.id || other.cells.length === 0) continue

    for (const cell of other.cells) {
      const dx = cell.x - center.x
      const dy = cell.y - center.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Can we split-kill them?
      if (mainCell.mass / 2 > cell.mass * EAT_RATIO && dist < 300 && dist > 100) {
        return Math.random() < 0.02 // Small chance to split
      }
    }
  }

  return false
}

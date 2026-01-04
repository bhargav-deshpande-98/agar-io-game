import {
  WORLD_SIZE,
  GRID_SIZE,
  FOOD_COUNT,
  VIRUS_COUNT,
  AI_COUNT,
  COLORS,
  MIN_SPLIT_MASS,
  MIN_EJECT_MASS,
  EJECT_MASS_LOSS,
  massToRadius,
  FOOD_RADIUS,
  VIRUS_RADIUS,
} from './constants'
import type { GameData, Camera, Player, Cell, LeaderboardEntry, Food, EjectedMass, Virus } from './types'
import {
  createCell,
  updateCell,
  splitCell,
  canMergeCells,
  mergeCells,
  cellsOverlap,
  canEat,
  drawCell,
  getTotalMass,
  getCenterOfMass,
} from './Cell'
import { createPlayer, getPlayerScore, isPlayerAlive, respawnPlayer } from './Player'
import { spawnInitialFood, createFood, createEjectedMass, updateEjectedMass, drawFood, drawEjectedMass } from './Food'
import { spawnInitialViruses, createVirus, cellTouchesVirus, shouldCellSplitOnVirus, drawAllViruses } from './Virus'
import { createAIPlayer, updateAIPlayer, shouldAISplit } from './AIPlayer'

// ============================================
// GAME INITIALIZATION
// ============================================

export function initializeGame(): GameData {
  return {
    gameState: 'start',
    player: null,
    aiPlayers: [],
    food: spawnInitialFood(FOOD_COUNT),
    viruses: spawnInitialViruses(VIRUS_COUNT),
    ejectedMass: [],
    camera: {
      x: WORLD_SIZE / 2,
      y: WORLD_SIZE / 2,
      zoom: 1,
      targetZoom: 1,
    },
    mouseX: WORLD_SIZE / 2,
    mouseY: WORLD_SIZE / 2,
    score: 0,
    highScore: parseInt(localStorage.getItem('agarHighScore') || '0'),
    leaderboard: [],
  }
}

export function startGame(gameData: GameData, playerName: string): GameData {
  const player = createPlayer(playerName || 'Cell', false, WORLD_SIZE / 2, WORLD_SIZE / 2, COLORS.cellColors[0])
  
  const aiPlayers: Player[] = []
  for (let i = 0; i < AI_COUNT; i++) {
    aiPlayers.push(createAIPlayer())
  }

  return {
    ...gameData,
    gameState: 'playing',
    player,
    aiPlayers,
    food: spawnInitialFood(FOOD_COUNT),
    viruses: spawnInitialViruses(VIRUS_COUNT),
    ejectedMass: [],
    camera: {
      x: player.cells[0].x,
      y: player.cells[0].y,
      zoom: 1,
      targetZoom: 1,
    },
    score: 10,
  }
}

// ============================================
// GAME UPDATE
// ============================================

export function updateGame(gameData: GameData, dt: number): GameData {
  if (gameData.gameState !== 'playing' || !gameData.player) {
    return gameData
  }

  let data = { ...gameData }
  let player = { ...data.player, cells: [...data.player.cells] }
  let aiPlayers = data.aiPlayers.map(ai => ({ ...ai, cells: [...ai.cells] }))
  let food = [...data.food]
  let viruses = [...data.viruses]
  let ejectedMass = [...data.ejectedMass]

  // Update player cells
  player.cells = player.cells.map(cell =>
    updateCell(cell, data.mouseX, data.mouseY, dt)
  )

  // Handle player cell merging
  player.cells = handleCellMerging(player.cells)

  // Update AI players
  const allPlayers = [player, ...aiPlayers]
  aiPlayers = aiPlayers.map(ai => {
    if (ai.cells.length === 0) return ai

    // AI decision making
    const updated = updateAIPlayer(ai, allPlayers, food, viruses)
    
    // Update AI cells
    updated.cells = updated.cells.map(cell =>
      updateCell(cell, updated.targetX, updated.targetY, dt)
    )

    // Handle AI cell merging
    updated.cells = handleCellMerging(updated.cells)

    // AI splitting
    if (shouldAISplit(updated, allPlayers)) {
      updated.cells = handleSplit(updated.cells, updated.targetX, updated.targetY)
    }

    return updated
  })

  // Update ejected mass
  ejectedMass = ejectedMass.map(updateEjectedMass)

  // Check player eating food
  for (const cell of player.cells) {
    food = food.filter(f => {
      const dx = cell.x - f.x
      const dy = cell.y - f.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < cell.radius) {
        cell.mass += f.mass
        cell.radius = massToRadius(cell.mass)
        return false
      }
      return true
    })

    // Eat ejected mass
    ejectedMass = ejectedMass.filter(e => {
      const dx = cell.x - e.x
      const dy = cell.y - e.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < cell.radius && cell.mass > e.mass * 1.1) {
        cell.mass += e.mass
        cell.radius = massToRadius(cell.mass)
        return false
      }
      return true
    })
  }

  // Check AI eating food
  for (const ai of aiPlayers) {
    for (const cell of ai.cells) {
      food = food.filter(f => {
        const dx = cell.x - f.x
        const dy = cell.y - f.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < cell.radius) {
          cell.mass += f.mass
          cell.radius = massToRadius(cell.mass)
          return false
        }
        return true
      })

      ejectedMass = ejectedMass.filter(e => {
        const dx = cell.x - e.x
        const dy = cell.y - e.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < cell.radius && cell.mass > e.mass * 1.1) {
          cell.mass += e.mass
          cell.radius = massToRadius(cell.mass)
          return false
        }
        return true
      })
    }
  }

  // Check player eating AI cells
  for (const playerCell of player.cells) {
    for (const ai of aiPlayers) {
      ai.cells = ai.cells.filter(aiCell => {
        if (canEat(playerCell, aiCell) && cellsOverlap(playerCell, aiCell)) {
          playerCell.mass += aiCell.mass
          playerCell.radius = massToRadius(playerCell.mass)
          return false
        }
        return true
      })
    }
  }

  // Check AI eating player cells
  for (const ai of aiPlayers) {
    for (const aiCell of ai.cells) {
      player.cells = player.cells.filter(playerCell => {
        if (canEat(aiCell, playerCell) && cellsOverlap(aiCell, playerCell)) {
          aiCell.mass += playerCell.mass
          aiCell.radius = massToRadius(aiCell.mass)
          return false
        }
        return true
      })
    }
  }

  // Check AI eating each other
  for (let i = 0; i < aiPlayers.length; i++) {
    for (let j = 0; j < aiPlayers.length; j++) {
      if (i === j) continue
      
      for (const cell1 of aiPlayers[i].cells) {
        aiPlayers[j].cells = aiPlayers[j].cells.filter(cell2 => {
          if (canEat(cell1, cell2) && cellsOverlap(cell1, cell2)) {
            cell1.mass += cell2.mass
            cell1.radius = massToRadius(cell1.mass)
            return false
          }
          return true
        })
      }
    }
  }

  // Check virus collisions
  for (const virus of viruses) {
    // Player hits virus
    const newPlayerCells: Cell[] = []
    for (const cell of player.cells) {
      if (shouldCellSplitOnVirus(cell) && cellTouchesVirus(cell, virus)) {
        // Explode into many pieces
        const pieces = explodeCellOnVirus(cell)
        newPlayerCells.push(...pieces)
      } else {
        newPlayerCells.push(cell)
      }
    }
    player.cells = newPlayerCells

    // AI hits virus
    for (const ai of aiPlayers) {
      const newAICells: Cell[] = []
      for (const cell of ai.cells) {
        if (shouldCellSplitOnVirus(cell) && cellTouchesVirus(cell, virus)) {
          const pieces = explodeCellOnVirus(cell)
          newAICells.push(...pieces)
        } else {
          newAICells.push(cell)
        }
      }
      ai.cells = newAICells
    }
  }

  // Limit cells per player
  player.cells = player.cells.slice(0, 16)
  aiPlayers = aiPlayers.map(ai => ({
    ...ai,
    cells: ai.cells.slice(0, 16),
  }))

  // Respawn dead AI
  aiPlayers = aiPlayers.map(ai => {
    if (ai.cells.length === 0 && Math.random() < 0.02) {
      return respawnPlayer(ai)
    }
    return ai
  })

  // Maintain food count
  while (food.length < FOOD_COUNT) {
    food.push(createFood())
  }

  // Check if player is dead
  if (player.cells.length === 0) {
    const finalScore = data.score
    let highScore = data.highScore
    if (finalScore > highScore) {
      highScore = finalScore
      localStorage.setItem('agarHighScore', highScore.toString())
    }

    return {
      ...data,
      gameState: 'gameover',
      player: { ...player, cells: [] },
      aiPlayers,
      food,
      viruses,
      ejectedMass,
      score: finalScore,
      highScore,
    }
  }

  // Update camera
  const center = getCenterOfMass(player.cells)
  const totalMass = getTotalMass(player.cells)
  const targetZoom = Math.max(0.4, Math.min(1, 50 / Math.sqrt(totalMass)))

  const camera: Camera = {
    x: data.camera.x + (center.x - data.camera.x) * 0.1,
    y: data.camera.y + (center.y - data.camera.y) * 0.1,
    zoom: data.camera.zoom + (targetZoom - data.camera.zoom) * 0.05,
    targetZoom,
  }

  // Update scores
  player.score = getPlayerScore(player)
  aiPlayers = aiPlayers.map(ai => ({
    ...ai,
    score: getPlayerScore(ai),
  }))

  // Update leaderboard
  const leaderboard = calculateLeaderboard(player, aiPlayers)

  return {
    ...data,
    player,
    aiPlayers,
    food,
    viruses,
    ejectedMass,
    camera,
    score: player.score,
    leaderboard,
  }
}

function handleCellMerging(cells: Cell[]): Cell[] {
  if (cells.length <= 1) return cells

  const result: Cell[] = [...cells]

  for (let i = 0; i < result.length; i++) {
    for (let j = i + 1; j < result.length; j++) {
      const cell1 = result[i]
      const cell2 = result[j]

      if (!cell1 || !cell2) continue

      const dx = cell1.x - cell2.x
      const dy = cell1.y - cell2.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Check if overlapping enough to merge
      if (dist < (cell1.radius + cell2.radius) * 0.3 && canMergeCells(cell1, cell2)) {
        const merged = mergeCells(cell1, cell2)
        result[i] = merged
        result.splice(j, 1)
        j--
      }
    }
  }

  return result
}

function explodeCellOnVirus(cell: Cell): Cell[] {
  const pieces: Cell[] = []
  const numPieces = Math.min(16, Math.floor(cell.mass / 20) + 2)
  const massPerPiece = cell.mass / numPieces

  for (let i = 0; i < numPieces; i++) {
    const angle = (i / numPieces) * Math.PI * 2
    const velocity = 15 + Math.random() * 10

    pieces.push({
      id: `cell_${Date.now()}_${i}`,
      x: cell.x,
      y: cell.y,
      mass: massPerPiece,
      radius: massToRadius(massPerPiece),
      color: cell.color,
      velocityX: Math.cos(angle) * velocity,
      velocityY: Math.sin(angle) * velocity,
      mergeTime: Date.now() + 30000,
    })
  }

  return pieces
}

// ============================================
// PLAYER ACTIONS
// ============================================

export function handleSplit(cells: Cell[], targetX: number, targetY: number): Cell[] {
  const newCells: Cell[] = []

  for (const cell of cells) {
    if (newCells.length + 1 < 16 && cell.mass >= MIN_SPLIT_MASS) {
      const split = splitCell(cell, targetX, targetY)
      newCells.push(...split)
    } else {
      newCells.push(cell)
    }
  }

  return newCells
}

export function handleEject(
  cells: Cell[],
  targetX: number,
  targetY: number,
  ejectedMass: EjectedMass[]
): { cells: Cell[]; ejectedMass: EjectedMass[] } {
  const newCells: Cell[] = []
  const newEjected: EjectedMass[] = [...ejectedMass]

  for (const cell of cells) {
    if (cell.mass >= MIN_EJECT_MASS) {
      const angle = Math.atan2(targetY - cell.y, targetX - cell.x)
      const ejectSpeed = 20

      newEjected.push(
        createEjectedMass(
          cell.x + Math.cos(angle) * cell.radius,
          cell.y + Math.sin(angle) * cell.radius,
          Math.cos(angle) * ejectSpeed,
          Math.sin(angle) * ejectSpeed,
          cell.color
        )
      )

      newCells.push({
        ...cell,
        mass: cell.mass - EJECT_MASS_LOSS,
        radius: massToRadius(cell.mass - EJECT_MASS_LOSS),
      })
    } else {
      newCells.push(cell)
    }
  }

  return { cells: newCells, ejectedMass: newEjected }
}

export function playerSplit(gameData: GameData): GameData {
  if (!gameData.player) return gameData

  const newCells = handleSplit(
    gameData.player.cells,
    gameData.mouseX,
    gameData.mouseY
  )

  return {
    ...gameData,
    player: {
      ...gameData.player,
      cells: newCells,
    },
  }
}

export function playerEject(gameData: GameData): GameData {
  if (!gameData.player) return gameData

  const { cells, ejectedMass } = handleEject(
    gameData.player.cells,
    gameData.mouseX,
    gameData.mouseY,
    gameData.ejectedMass
  )

  return {
    ...gameData,
    player: {
      ...gameData.player,
      cells,
    },
    ejectedMass,
  }
}

export function updateMousePosition(gameData: GameData, screenX: number, screenY: number, canvasWidth: number, canvasHeight: number): GameData {
  // Convert screen position to world position
  const worldX = (screenX - canvasWidth / 2) / gameData.camera.zoom + gameData.camera.x
  const worldY = (screenY - canvasHeight / 2) / gameData.camera.zoom + gameData.camera.y

  return {
    ...gameData,
    mouseX: worldX,
    mouseY: worldY,
  }
}

// ============================================
// LEADERBOARD
// ============================================

function calculateLeaderboard(player: Player, aiPlayers: Player[]): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = []

  if (player.cells.length > 0) {
    entries.push({
      id: player.id,
      name: player.name,
      score: player.score,
      isPlayer: true,
    })
  }

  for (const ai of aiPlayers) {
    if (ai.cells.length > 0) {
      entries.push({
        id: ai.id,
        name: ai.name,
        score: ai.score,
        isPlayer: false,
      })
    }
  }

  entries.sort((a, b) => b.score - a.score)
  return entries.slice(0, 10)
}

// ============================================
// RENDERING
// ============================================

export function renderGame(
  ctx: CanvasRenderingContext2D,
  gameData: GameData,
  width: number,
  height: number
) {
  const { camera, player, aiPlayers, food, viruses, ejectedMass } = gameData

  // Clear and fill background
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, width, height)

  // Draw grid
  drawGrid(ctx, camera, width, height)

  // Draw food
  drawFood(ctx, food, camera, width, height)

  // Draw ejected mass
  drawEjectedMass(ctx, ejectedMass, camera, width, height)

  // Draw viruses
  drawAllViruses(ctx, viruses, camera, width, height)

  // Collect all cells for sorting
  const allCells: { cell: Cell; player: Player }[] = []

  for (const ai of aiPlayers) {
    for (const cell of ai.cells) {
      allCells.push({ cell, player: ai })
    }
  }

  if (player) {
    for (const cell of player.cells) {
      allCells.push({ cell, player })
    }
  }

  // Sort by mass (smaller drawn first, larger on top)
  allCells.sort((a, b) => a.cell.mass - b.cell.mass)

  // Draw all cells
  for (const { cell, player: cellPlayer } of allCells) {
    drawCell(ctx, cell, camera, width, height, cellPlayer.name, true)
  }

  // Draw world border
  drawWorldBorder(ctx, camera, width, height)
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  width: number,
  height: number
) {
  ctx.strokeStyle = COLORS.grid
  ctx.lineWidth = 1

  const gridSize = GRID_SIZE * camera.zoom
  const offsetX = (-camera.x * camera.zoom + width / 2) % gridSize
  const offsetY = (-camera.y * camera.zoom + height / 2) % gridSize

  ctx.beginPath()
  for (let x = offsetX; x < width; x += gridSize) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
  }
  for (let y = offsetY; y < height; y += gridSize) {
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
  }
  ctx.stroke()
}

function drawWorldBorder(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  width: number,
  height: number
) {
  const left = (0 - camera.x) * camera.zoom + width / 2
  const right = (WORLD_SIZE - camera.x) * camera.zoom + width / 2
  const top = (0 - camera.y) * camera.zoom + height / 2
  const bottom = (WORLD_SIZE - camera.y) * camera.zoom + height / 2

  ctx.strokeStyle = '#FF0000'
  ctx.lineWidth = 5
  ctx.strokeRect(left, top, right - left, bottom - top)
}

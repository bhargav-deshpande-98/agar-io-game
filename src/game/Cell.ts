import {
  massToRadius,
  massToSpeed,
  WORLD_SIZE,
  SPLIT_VELOCITY,
  MERGE_TIME,
  MIN_SPLIT_MASS,
  EAT_RATIO,
  DECAY_RATE,
  DECAY_MIN_MASS,
} from './constants'
import type { Cell, Player, Camera } from './types'

let cellIdCounter = 0

export function createCell(
  x: number,
  y: number,
  mass: number,
  color: string
): Cell {
  return {
    id: `cell_${cellIdCounter++}`,
    x,
    y,
    mass,
    radius: massToRadius(mass),
    color,
    velocityX: 0,
    velocityY: 0,
    mergeTime: 0,
  }
}

export function updateCell(cell: Cell, targetX: number, targetY: number, dt: number): Cell {
  const updated = { ...cell }

  // Apply velocity decay (for split momentum)
  updated.velocityX *= 0.9
  updated.velocityY *= 0.9

  // Calculate direction to target
  const dx = targetX - updated.x
  const dy = targetY - updated.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist > 5) {
    // Move toward target
    const speed = massToSpeed(updated.mass)
    const moveX = (dx / dist) * speed + updated.velocityX
    const moveY = (dy / dist) * speed + updated.velocityY

    updated.x += moveX
    updated.y += moveY
  } else {
    // Just apply velocity
    updated.x += updated.velocityX
    updated.y += updated.velocityY
  }

  // Clamp to world bounds
  const radius = updated.radius
  updated.x = Math.max(radius, Math.min(WORLD_SIZE - radius, updated.x))
  updated.y = Math.max(radius, Math.min(WORLD_SIZE - radius, updated.y))

  // Update radius
  updated.radius = massToRadius(updated.mass)

  // Mass decay for large cells
  if (updated.mass > DECAY_MIN_MASS) {
    updated.mass -= updated.mass * DECAY_RATE * (dt / 1000)
  }

  return updated
}

export function splitCell(cell: Cell, targetX: number, targetY: number): Cell[] {
  if (cell.mass < MIN_SPLIT_MASS) {
    return [cell]
  }

  const newMass = cell.mass / 2
  const angle = Math.atan2(targetY - cell.y, targetX - cell.x)

  // Original cell stays in place with half mass
  const originalCell: Cell = {
    ...cell,
    mass: newMass,
    radius: massToRadius(newMass),
    mergeTime: Date.now() + MERGE_TIME,
  }

  // New cell shoots forward
  const newCell: Cell = {
    id: `cell_${cellIdCounter++}`,
    x: cell.x,
    y: cell.y,
    mass: newMass,
    radius: massToRadius(newMass),
    color: cell.color,
    velocityX: Math.cos(angle) * SPLIT_VELOCITY,
    velocityY: Math.sin(angle) * SPLIT_VELOCITY,
    mergeTime: Date.now() + MERGE_TIME,
  }

  return [originalCell, newCell]
}

export function canMergeCells(cell1: Cell, cell2: Cell): boolean {
  const now = Date.now()
  return cell1.mergeTime < now && cell2.mergeTime < now
}

export function mergeCells(cell1: Cell, cell2: Cell): Cell {
  // Merge into the larger cell
  const larger = cell1.mass >= cell2.mass ? cell1 : cell2
  const smaller = cell1.mass >= cell2.mass ? cell2 : cell1

  return {
    ...larger,
    mass: cell1.mass + cell2.mass,
    radius: massToRadius(cell1.mass + cell2.mass),
    mergeTime: 0,
  }
}

export function canEat(eater: Cell, food: { mass: number; radius?: number }): boolean {
  return eater.mass > food.mass * EAT_RATIO
}

export function cellsOverlap(cell1: Cell, cell2: { x: number; y: number; radius?: number; mass?: number }): boolean {
  const radius2 = cell2.radius ?? massToRadius(cell2.mass ?? 1)
  const dx = cell1.x - cell2.x
  const dy = cell1.y - cell2.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  
  // For eating: center must be inside the eater
  return dist < cell1.radius - radius2 * 0.4
}

export function drawCell(
  ctx: CanvasRenderingContext2D,
  cell: Cell,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number,
  name?: string,
  showMass?: boolean
) {
  // Convert world position to screen position
  const screenX = (cell.x - camera.x) * camera.zoom + canvasWidth / 2
  const screenY = (cell.y - camera.y) * camera.zoom + canvasHeight / 2
  const screenRadius = cell.radius * camera.zoom

  // Skip if off screen
  if (
    screenX < -screenRadius ||
    screenX > canvasWidth + screenRadius ||
    screenY < -screenRadius ||
    screenY > canvasHeight + screenRadius
  ) {
    return
  }

  // Cell body with gradient
  const gradient = ctx.createRadialGradient(
    screenX - screenRadius * 0.3,
    screenY - screenRadius * 0.3,
    0,
    screenX,
    screenY,
    screenRadius
  )
  gradient.addColorStop(0, lightenColor(cell.color, 30))
  gradient.addColorStop(1, cell.color)

  ctx.beginPath()
  ctx.arc(screenX, screenY, screenRadius, 0, Math.PI * 2)
  ctx.fillStyle = gradient
  ctx.fill()

  // Border
  ctx.strokeStyle = darkenColor(cell.color, 20)
  ctx.lineWidth = Math.max(2, screenRadius * 0.08)
  ctx.stroke()

  // Name and mass
  if (name && screenRadius > 20) {
    ctx.fillStyle = 'white'
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 3
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    const fontSize = Math.max(12, Math.min(screenRadius * 0.4, 24))
    ctx.font = `bold ${fontSize}px Ubuntu, sans-serif`
    
    ctx.strokeText(name, screenX, screenY)
    ctx.fillText(name, screenX, screenY)

    if (showMass && screenRadius > 30) {
      const massFontSize = fontSize * 0.6
      ctx.font = `${massFontSize}px Ubuntu, sans-serif`
      ctx.strokeText(Math.floor(cell.mass).toString(), screenX, screenY + fontSize * 0.8)
      ctx.fillText(Math.floor(cell.mass).toString(), screenX, screenY + fontSize * 0.8)
    }
  }
}

// Helper functions for colors
function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt)
  const B = Math.min(255, (num & 0x0000ff) + amt)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, (num >> 16) - amt)
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt)
  const B = Math.max(0, (num & 0x0000ff) - amt)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}

export function getTotalMass(cells: Cell[]): number {
  return cells.reduce((sum, cell) => sum + cell.mass, 0)
}

export function getCenterOfMass(cells: Cell[]): { x: number; y: number } {
  if (cells.length === 0) return { x: 0, y: 0 }
  
  let totalMass = 0
  let weightedX = 0
  let weightedY = 0

  for (const cell of cells) {
    totalMass += cell.mass
    weightedX += cell.x * cell.mass
    weightedY += cell.y * cell.mass
  }

  return {
    x: weightedX / totalMass,
    y: weightedY / totalMass,
  }
}

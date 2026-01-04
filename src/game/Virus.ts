import type { Virus, Camera, Cell } from './types'
import {
  WORLD_SIZE,
  VIRUS_MASS,
  VIRUS_RADIUS,
  VIRUS_SPLIT_MASS,
  VIRUS_FEED_COUNT,
  COLORS,
  massToRadius,
} from './constants'

let virusIdCounter = 0

export function createVirus(x?: number, y?: number): Virus {
  return {
    id: `virus_${virusIdCounter++}`,
    x: x ?? Math.random() * (WORLD_SIZE - 200) + 100,
    y: y ?? Math.random() * (WORLD_SIZE - 200) + 100,
    mass: VIRUS_MASS,
    feedCount: 0,
  }
}

export function spawnInitialViruses(count: number): Virus[] {
  const viruses: Virus[] = []
  for (let i = 0; i < count; i++) {
    viruses.push(createVirus())
  }
  return viruses
}

export function canVirusSplit(virus: Virus): boolean {
  return virus.feedCount >= VIRUS_FEED_COUNT
}

export function shouldCellSplitOnVirus(cell: Cell): boolean {
  return cell.mass >= VIRUS_SPLIT_MASS
}

export function cellTouchesVirus(cell: Cell, virus: Virus): boolean {
  const dx = cell.x - virus.x
  const dy = cell.y - virus.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  return dist < cell.radius + VIRUS_RADIUS * 0.8
}

export function drawVirus(
  ctx: CanvasRenderingContext2D,
  virus: Virus,
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number
) {
  const screenX = (virus.x - camera.x) * camera.zoom + canvasWidth / 2
  const screenY = (virus.y - camera.y) * camera.zoom + canvasHeight / 2
  const screenRadius = VIRUS_RADIUS * camera.zoom

  // Skip if off screen
  if (
    screenX < -screenRadius * 2 ||
    screenX > canvasWidth + screenRadius * 2 ||
    screenY < -screenRadius * 2 ||
    screenY > canvasHeight + screenRadius * 2
  ) {
    return
  }

  // Draw spiky virus
  ctx.beginPath()
  const spikes = 16
  const outerRadius = screenRadius
  const innerRadius = screenRadius * 0.7

  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (i * Math.PI) / spikes
    const x = screenX + Math.cos(angle) * radius
    const y = screenY + Math.sin(angle) * radius

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  ctx.closePath()

  // Fill with gradient
  const gradient = ctx.createRadialGradient(
    screenX,
    screenY,
    0,
    screenX,
    screenY,
    screenRadius
  )
  gradient.addColorStop(0, '#66FF66')
  gradient.addColorStop(1, COLORS.virus)

  ctx.fillStyle = gradient
  ctx.fill()

  ctx.strokeStyle = COLORS.virusStroke
  ctx.lineWidth = 2 * camera.zoom
  ctx.stroke()

  // Inner circle
  ctx.beginPath()
  ctx.arc(screenX, screenY, innerRadius * 0.5, 0, Math.PI * 2)
  ctx.fillStyle = '#88FF88'
  ctx.fill()
}

export function drawAllViruses(
  ctx: CanvasRenderingContext2D,
  viruses: Virus[],
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number
) {
  for (const virus of viruses) {
    drawVirus(ctx, virus, camera, canvasWidth, canvasHeight)
  }
}

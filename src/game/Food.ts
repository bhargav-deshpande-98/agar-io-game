import type { Food, EjectedMass, Camera } from './types'
import { WORLD_SIZE, FOOD_MASS, FOOD_RADIUS, COLORS, massToRadius, EJECT_MASS_VALUE } from './constants'

let foodIdCounter = 0
let ejectedIdCounter = 0

export function createFood(x?: number, y?: number): Food {
  return {
    id: `food_${foodIdCounter++}`,
    x: x ?? Math.random() * WORLD_SIZE,
    y: y ?? Math.random() * WORLD_SIZE,
    color: COLORS.foodColors[Math.floor(Math.random() * COLORS.foodColors.length)],
    mass: FOOD_MASS,
  }
}

export function spawnInitialFood(count: number): Food[] {
  const foods: Food[] = []
  for (let i = 0; i < count; i++) {
    foods.push(createFood())
  }
  return foods
}

export function createEjectedMass(
  x: number,
  y: number,
  velocityX: number,
  velocityY: number,
  color: string
): EjectedMass {
  return {
    id: `ejected_${ejectedIdCounter++}`,
    x,
    y,
    mass: EJECT_MASS_VALUE,
    velocityX,
    velocityY,
    color,
  }
}

export function updateEjectedMass(ejected: EjectedMass): EjectedMass {
  const updated = { ...ejected }

  // Apply velocity
  updated.x += updated.velocityX
  updated.y += updated.velocityY

  // Decelerate
  updated.velocityX *= 0.9
  updated.velocityY *= 0.9

  // Clamp to world
  updated.x = Math.max(10, Math.min(WORLD_SIZE - 10, updated.x))
  updated.y = Math.max(10, Math.min(WORLD_SIZE - 10, updated.y))

  return updated
}

export function drawFood(
  ctx: CanvasRenderingContext2D,
  food: Food[],
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number
) {
  for (const f of food) {
    const screenX = (f.x - camera.x) * camera.zoom + canvasWidth / 2
    const screenY = (f.y - camera.y) * camera.zoom + canvasHeight / 2
    const screenRadius = FOOD_RADIUS * camera.zoom

    // Skip if off screen
    if (
      screenX < -screenRadius ||
      screenX > canvasWidth + screenRadius ||
      screenY < -screenRadius ||
      screenY > canvasHeight + screenRadius
    ) {
      continue
    }

    ctx.beginPath()
    ctx.arc(screenX, screenY, screenRadius, 0, Math.PI * 2)
    ctx.fillStyle = f.color
    ctx.fill()
  }
}

export function drawEjectedMass(
  ctx: CanvasRenderingContext2D,
  ejectedMass: EjectedMass[],
  camera: Camera,
  canvasWidth: number,
  canvasHeight: number
) {
  for (const e of ejectedMass) {
    const screenX = (e.x - camera.x) * camera.zoom + canvasWidth / 2
    const screenY = (e.y - camera.y) * camera.zoom + canvasHeight / 2
    const screenRadius = massToRadius(e.mass) * camera.zoom

    if (
      screenX < -screenRadius ||
      screenX > canvasWidth + screenRadius ||
      screenY < -screenRadius ||
      screenY > canvasHeight + screenRadius
    ) {
      continue
    }

    ctx.beginPath()
    ctx.arc(screenX, screenY, screenRadius, 0, Math.PI * 2)
    ctx.fillStyle = e.color
    ctx.fill()
    ctx.strokeStyle = '#888888'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

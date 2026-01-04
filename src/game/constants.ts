// World configuration
export const WORLD_SIZE = 5000
export const GRID_SIZE = 50

// Cell configuration
export const STARTING_MASS = 10
export const MIN_SPLIT_MASS = 35
export const MIN_EJECT_MASS = 35
export const EJECT_MASS_LOSS = 16
export const EJECT_MASS_VALUE = 12
export const SPLIT_VELOCITY = 25
export const MERGE_TIME = 30000 // 30 seconds to merge

// Size ratio needed to eat (must be ~10% bigger)
export const EAT_RATIO = 1.1

// Speed configuration (bigger = slower)
export const BASE_SPEED = 2.5
export const MIN_SPEED = 0.8
export const SPEED_FACTOR = 0.004

// Mass decay (big cells lose mass over time)
export const DECAY_RATE = 0.002
export const DECAY_MIN_MASS = 100

// Food configuration
export const FOOD_COUNT = 500
export const FOOD_MASS = 1
export const FOOD_RADIUS = 5

// Virus configuration
export const VIRUS_COUNT = 15
export const VIRUS_MASS = 100
export const VIRUS_RADIUS = 40
export const VIRUS_SPLIT_MASS = 150 // Cells this big or larger will split on virus
export const VIRUS_FEED_COUNT = 7 // Feed 7 times to shoot a virus

// AI configuration
export const AI_COUNT = 10
export const AI_NAMES = [
  'Blob', 'Cell', 'Hungry', 'Chomper', 'Nibbler',
  'Muncher', 'Gobbler', 'Devour', 'Consumer', 'Hunter',
  'Predator', 'Swallower', 'Absorber', 'Glutton', 'Feaster',
  'Eater', 'Slurper', 'Vacuum', 'Devourer', 'Beast'
]

// Colors
export const COLORS = {
  background: '#111111',
  grid: '#1a1a1a',
  
  // Cell colors (vibrant)
  cellColors: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
    '#FF69B4', '#7FFF00', '#FF4500', '#1E90FF',
    '#FFD700', '#FF1493', '#00FA9A', '#FF6347',
  ],
  
  // Food colors
  foodColors: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  ],
  
  // Virus color
  virus: '#33FF33',
  virusStroke: '#00AA00',
  
  // Ejected mass
  ejectedMass: '#AAAAAA',
} as const

// Calculate radius from mass
export function massToRadius(mass: number): number {
  return Math.sqrt(mass) * 4
}

// Calculate speed from mass
export function massToSpeed(mass: number): number {
  return Math.max(MIN_SPEED, BASE_SPEED - mass * SPEED_FACTOR)
}

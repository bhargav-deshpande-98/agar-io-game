import type { LeaderboardEntry } from '@/game/types'

interface GameUIProps {
  score: number
  leaderboard: LeaderboardEntry[]
  onSplit?: () => void
  onEject?: () => void
}

export default function GameUI({ score, leaderboard, onSplit, onEject }: GameUIProps) {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  return (
    <>
      {/* Score - top left */}
      <div className="absolute top-4 left-4 pointer-events-none z-10">
        <div className="bg-black/60 rounded-lg px-4 py-2 backdrop-blur-sm">
          <div className="text-white font-bold text-3xl">{score}</div>
          <div className="text-gray-400 text-xs">SCORE</div>
        </div>
      </div>

      {/* Leaderboard - top right (compact and transparent) */}
      <div className="absolute top-2 right-2 pointer-events-none z-10">
        <div className="bg-black/30 rounded-md px-2 py-1.5 backdrop-blur-sm min-w-[100px]">
          <div className="text-gray-400 text-[10px] mb-1 font-semibold">
            🏆 TOP 5
          </div>
          {leaderboard.slice(0, 5).map((entry, index) => (
            <div
              key={entry.id}
              className={`flex justify-between items-center py-0.5 text-[11px] ${
                entry.isPlayer ? 'text-yellow-400 font-bold' : 'text-white/80'
              }`}
            >
              <span className="flex items-center gap-1">
                <span className="text-gray-500 w-3">{index + 1}.</span>
                <span className="truncate max-w-[60px]">{entry.name}</span>
              </span>
              <span className="text-gray-400/80 ml-1 text-[10px]">{entry.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls hint - bottom (desktop only) */}
      {!isTouchDevice && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <div className="bg-black/40 rounded-lg px-4 py-2 backdrop-blur-sm text-center">
            <div className="text-white/60 text-xs">
              <span className="mx-2">🖱️ Move</span>
              <span className="mx-2">⎵ Split</span>
              <span className="mx-2">W Eject</span>
            </div>
          </div>
        </div>
      )}

      {/* Touch controls - mobile only */}
      {isTouchDevice && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 z-10 px-4">
          <button
            onTouchStart={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onSplit?.()
            }}
            className="w-20 h-20 rounded-full bg-blue-500/70 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg shadow-lg active:bg-blue-600/90 active:scale-95 transition-transform touch-none select-none"
          >
            SPLIT
          </button>
          <button
            onTouchStart={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onEject?.()
            }}
            className="w-20 h-20 rounded-full bg-green-500/70 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg shadow-lg active:bg-green-600/90 active:scale-95 transition-transform touch-none select-none"
          >
            EJECT
          </button>
        </div>
      )}
    </>
  )
}

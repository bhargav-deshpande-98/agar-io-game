import type { LeaderboardEntry } from '@/game/types'

interface GameUIProps {
  score: number
  leaderboard: LeaderboardEntry[]
}

export default function GameUI({ score, leaderboard }: GameUIProps) {
  return (
    <>
      {/* Score - top left */}
      <div className="absolute top-4 left-4 pointer-events-none z-10">
        <div className="bg-black/60 rounded-lg px-4 py-2 backdrop-blur-sm">
          <div className="text-white font-bold text-3xl">{score}</div>
          <div className="text-gray-400 text-xs">SCORE</div>
        </div>
      </div>

      {/* Leaderboard - top right */}
      <div className="absolute top-4 right-4 pointer-events-none z-10">
        <div className="bg-black/60 rounded-lg px-4 py-3 backdrop-blur-sm min-w-[160px]">
          <div className="text-gray-400 text-xs mb-2 font-semibold border-b border-gray-700 pb-2">
            🏆 LEADERBOARD
          </div>
          {leaderboard.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex justify-between items-center py-1 text-sm ${
                entry.isPlayer ? 'text-yellow-400 font-bold' : 'text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-gray-500 w-5">{index + 1}.</span>
                <span className="truncate max-w-[90px]">{entry.name}</span>
              </span>
              <span className="text-gray-400 ml-2">{entry.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls hint - bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <div className="bg-black/40 rounded-lg px-4 py-2 backdrop-blur-sm text-center">
          <div className="text-white/60 text-xs">
            <span className="mx-2">🖱️ Move</span>
            <span className="mx-2">⎵ Split</span>
            <span className="mx-2">W Eject</span>
          </div>
        </div>
      </div>
    </>
  )
}

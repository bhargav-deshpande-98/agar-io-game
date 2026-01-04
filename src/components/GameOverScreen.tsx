interface GameOverScreenProps {
  score: number
  highScore: number
  onRestart: () => void
}

export default function GameOverScreen({
  score,
  highScore,
  onRestart,
}: GameOverScreenProps) {
  const isNewHighScore = score >= highScore && score > 10

  return (
    <div className="absolute inset-0 bg-black/85 flex flex-col justify-center items-center z-50 gap-6 p-8 backdrop-blur-sm">
      {/* Game Over Title */}
      <h1 className="text-5xl font-bold text-red-500 mb-2">
        YOU WERE EATEN!
      </h1>

      {/* New high score */}
      {isNewHighScore && (
        <div className="text-yellow-400 text-xl font-bold animate-bounce">
          🎉 NEW HIGH SCORE! 🎉
        </div>
      )}

      {/* Stats */}
      <div className="bg-white/10 rounded-xl p-8 min-w-[250px]">
        <div className="text-center mb-6">
          <div className="text-gray-400 text-sm">FINAL SCORE</div>
          <div className="text-5xl font-bold text-white">{score}</div>
        </div>

        <div className="flex justify-around gap-8 text-center border-t border-white/10 pt-4">
          <div>
            <div className="text-gray-400 text-xs">BEST</div>
            <div className="text-2xl font-bold text-green-400">{highScore}</div>
          </div>
        </div>
      </div>

      {/* Sad cell animation */}
      <div className="relative w-24 h-24 opacity-50">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-400 to-gray-600">
          {/* Sad eyes */}
          <div className="absolute top-6 left-5 w-3 h-3 bg-white rounded-full">
            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-black rounded-full" />
          </div>
          <div className="absolute top-6 right-5 w-3 h-3 bg-white rounded-full">
            <div className="absolute top-1 left-0.5 w-1.5 h-1.5 bg-black rounded-full" />
          </div>
          {/* Sad mouth */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-6 h-3 border-b-2 border-white rounded-b-full" />
        </div>
      </div>

      {/* Play Again Button */}
      <button
        onClick={onRestart}
        className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold rounded-full shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 transition-all active:scale-95"
      >
        PLAY AGAIN
      </button>

      {/* Tips */}
      <div className="text-gray-500 text-sm text-center max-w-xs">
        <p>💡 Tip: Split near prey to catch them, but be careful of bigger cells!</p>
      </div>
    </div>
  )
}

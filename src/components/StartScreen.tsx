import { useState } from 'react'

interface StartScreenProps {
  onStart: (name: string) => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onStart(name || 'Cell')
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e]/95 to-[#111]/95 flex flex-col justify-center items-center z-50 gap-6 p-8">
      {/* Logo */}
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-2">
          <span className="text-red-500">ag</span>
          <span className="text-green-500">ar</span>
          <span className="text-blue-500">.io</span>
        </h1>
        <p className="text-gray-400">Eat cells, grow bigger, dominate!</p>
      </div>

      {/* Animated cells */}
      <div className="relative w-40 h-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 animate-pulse" />
        <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="absolute top-8 right-6 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="absolute bottom-6 left-8 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 animate-bounce" style={{ animationDelay: '0.3s' }} />
        <div className="absolute bottom-4 right-4 w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>

      {/* Name input */}
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
          maxLength={15}
          className="px-6 py-3 text-lg bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 w-64 text-center"
        />

        <button
          type="submit"
          className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold rounded-full shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 transition-all active:scale-95"
        >
          PLAY
        </button>
      </form>

      {/* Instructions */}
      <div className="text-gray-400 text-center text-sm max-w-sm mt-4">
        <p className="mb-2">🖱️ <strong>Move mouse</strong> to control direction</p>
        <p className="mb-2">⎵ <strong>Space</strong> to split (attack/escape)</p>
        <p className="mb-2">🔤 <strong>W</strong> to eject mass (feed/bait)</p>
        <p>🦠 <strong>Avoid viruses</strong> when big!</p>
      </div>

      {/* Mobile hint */}
      <div className="absolute bottom-6 text-gray-500 text-xs text-center">
        <p>On mobile: Touch to move, double-tap to split</p>
      </div>
    </div>
  )
}

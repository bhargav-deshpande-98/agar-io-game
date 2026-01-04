# 🦠 Agar.io Clone

A multiplayer-style cell eating game built with React, TypeScript, and Canvas. Eat smaller cells, avoid bigger ones, and climb the leaderboard!

## Features

- 🎮 **Smooth controls** - Mouse/touch to move
- ✂️ **Split mechanic** - Press Space to split and catch prey
- 💨 **Eject mass** - Press W to shoot mass (feed/bait)
- 🦠 **Viruses** - Green spiky cells that split big players
- 🤖 **AI opponents** - Smart bots that hunt and flee
- 📊 **Leaderboard** - Real-time top 10 ranking
- 📱 **Mobile support** - Touch controls with double-tap split

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **HTML5 Canvas** - Game rendering

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Controls

| Input | Action |
|-------|--------|
| Mouse / Touch | Move toward cursor |
| Space / Double-tap | Split (attack or escape) |
| W | Eject mass (feed or bait) |

## Project Structure

```
src/
├── components/     # React UI components
│   └── ui/        # Reusable UI components
├── game/          # Game engine & logic
│   ├── constants.ts
│   ├── types.ts
│   ├── Cell.ts
│   ├── Player.ts
│   ├── Food.ts
│   ├── Virus.ts
│   ├── AIPlayer.ts
│   └── GameEngine.ts
├── hooks/         # Custom React hooks
├── lib/           # Utilities
├── pages/         # Page components
├── App.tsx
└── main.tsx
```

## Game Mechanics

- **Growing**: Eat food pellets and smaller cells to grow
- **Splitting**: Press Space to split in half and lunge forward
- **Ejecting**: Press W to shoot small pellets (loses mass)
- **Viruses**: Big cells (150+ mass) explode into pieces on contact
- **Merging**: Split cells merge back together after ~30 seconds
- **Decay**: Very large cells slowly lose mass over time

## Tips

1. Split to catch faster prey, but be vulnerable after
2. Use viruses as shields when small
3. Avoid viruses when big - they'll split you!
4. Eject mass to bait smaller cells
5. Corner enemies against the map edge

## License

MIT

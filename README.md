# Neon Pac-Man | Modern Arcade

A sleek, modern Pac-Man game built with vanilla HTML, CSS, and JavaScript. Featuring a futuristic neon aesthetic, programmatic audio with Web Audio API, and smooth grid-based movement.

## 🚀 Live Demo

Play the game here: [https://alfredang.github.io/pacman-game/](https://alfredang.github.io/pacman-game/)

## 📂 File Structure

```text
/pacman-game
├── index.html          # Main entry point and UI screens (Menu, HUD, Game Over)
├── css/
│   └── style.css       # Neon dark theme design and animations
├── javascript/
│   └── game.js        # Core game engine, logic, AI, and Audio Manager
├── assets/             # Project assets
│   └── sounds/         # (Reserved for external sound files)
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions CI/CD for Pages deployment
```

## 🕹️ Features

- **Modern UI**: Dark mode with glowing neon elements and smooth transitions.
- **Custom AI**: Ghosts with distinct behaviors (Chase, Random) and "scared" modes.
- **Dynamic Audio**: Sound effects generated programmatically using the Web Audio API.
- **Responsive**: Scales perfectly for desktop and tablet play.
- **Smooth Controls**: Supports both WASD and Arrow Keys.

## 🛠️ Local Development

To run the game locally with full module support:

1. Clone the repository.
2. Run a local server:
   - **Python**: `python3 -m http.server 8000`
   - **VS Code**: Use the Live Server extension.
3. Open `http://localhost:8000` in your browser.

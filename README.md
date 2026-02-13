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

### Quick Start (No Server Needed)
1. **Clone the repository**:
   ```bash
   git clone https://github.com/alfredang/pacman-game.git
   ```
2. **Open the game**: 
   Navigate to the folder and double-click `index.html` to play instantly.

### Development Server (Recommended)
To run the game with full module support:
1. Run a local server:
   - **Python**: `python3 -m http.server 8000`
   - **VS Code**: Use the Live Server extension.
2. Open `http://localhost:8000` in your browser.
## 🐳 Running with Docker

You can run the game using Docker:

### Pull and Run from Docker Hub
```bash
docker run -d -p 8080:80 tertiaryinfotech/pacman-game:latest
```
Open `http://localhost:8080` to play.

### Build and Run Locally
1. Build the image:
   ```bash
   docker build -t pacman-game .
   ```
2. Run the container:
   ```bash
   docker run -d -p 8080:80 pacman-game
   ```

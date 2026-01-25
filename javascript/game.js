/**
 * PAC-MAN MODERN ARCADE
 * Clean, modular game engine
 */

// --- Configuration & Constants ---
const CONFIG = {
    TILE_SIZE: 20,
    GAME_SPEED: 120, // Lower is faster (ms per step)
    GHOST_SPEED_RATIO: 0.95,
    POWER_DURATION: 8000, // ms
    COLORS: {
        WALL: '#0021ff',
        PELLET: '#ffb8ae',
        POWER_PELLET: '#ffffff',
        PACMAN: '#ffff00',
        GHOSTS: ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852'],
        SCARED_GHOST: '#2121ff'
    }
};

// --- Game Map Data ---
// 0: Pellet, 1: Wall, 2: Empty, 3: Power Pellet, 4: Ghost House/Gate
const MAP_LAYOUT = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 3, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 3, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 2, 1, 2, 1, 1, 1, 0, 1, 1, 1, 1],
    [2, 2, 2, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 2, 2, 2],
    [1, 1, 1, 1, 0, 1, 2, 1, 1, 4, 1, 1, 2, 1, 0, 1, 1, 1, 1],
    [2, 2, 2, 2, 0, 2, 2, 1, 2, 2, 2, 1, 2, 2, 0, 2, 2, 2, 2],
    [1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1],
    [2, 2, 2, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 2, 2, 2],
    [1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 3, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 3, 1],
    [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// --- Audio Manager ---
class AudioManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    playTone(freq, type, duration, volume = 0.1) {
        if (this.muted || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    pellet() { this.playTone(440, 'sine', 0.1, 0.05); }
    powerUp() { this.playTone(880, 'square', 0.4, 0.05); }
    ghostEaten() { this.playTone(220, 'sawtooth', 0.3, 0.1); }
    death() { this.playTone(110, 'triangle', 0.8, 0.1); }
}

const audio = new AudioManager();

// --- Game Class ---
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.lives = 3;
        this.state = 'MENU'; // MENU, PLAYING, PAUSED, GAMEOVER
        this.isPoweredUp = false;

        this.setupEventListeners();
        this.initScreens();
    }

    setupEventListeners() {
        document.getElementById('start-btn').onclick = () => this.startGame();
        document.getElementById('instructions-btn').onclick = () => this.showScreen('instructions-screen');
        document.getElementById('back-to-menu-btn').onclick = () => this.showScreen('main-menu');
        document.getElementById('restart-btn').onclick = () => this.startGame();
        document.getElementById('exit-to-menu-btn').onclick = () => this.showScreen('main-menu');
        document.getElementById('pause-btn').onclick = () => this.togglePause();
        document.getElementById('audio-toggle').onclick = () => this.toggleAudio();

        window.addEventListener('keydown', (e) => this.handleInput(e));
    }

    initScreens() {
        this.showScreen('main-menu');
    }

    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        this.state = id === 'game-screen' ? 'PLAYING' : 'MENU';
    }

    startGame() {
        audio.init();
        this.score = 0;
        this.lives = 3;
        this.updateHUD();
        this.showScreen('game-screen');
        this.resize();
        this.resetLevel();
        this.loop(performance.now());
    }

    resize() {
        const rows = MAP_LAYOUT.length;
        const cols = MAP_LAYOUT[0].length;
        this.canvas.width = cols * CONFIG.TILE_SIZE;
        this.canvas.height = rows * CONFIG.TILE_SIZE;
    }

    updateHUD() {
        document.getElementById('score-val').textContent = this.score.toString().padStart(4, '0');
        const livesContainer = document.getElementById('lives-container');
        livesContainer.innerHTML = '';
        for (let i = 0; i < this.lives; i++) {
            const life = document.createElement('div');
            life.className = 'life-icon';
            livesContainer.appendChild(life);
        }
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            document.getElementById('pause-icon').textContent = '▶';
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            document.getElementById('pause-icon').textContent = '⏸';
            this.loop(performance.now());
        }
    }

    toggleAudio() {
        audio.muted = !audio.muted;
        document.getElementById('audio-icon').textContent = audio.muted ? '🔇' : '🔊';
    }

    handleInput(e) {
        if (this.state !== 'PLAYING') return;

        const key = e.key.toLowerCase();
        if (key === 'arrowup' || key === 'w') this.pacman.setNextDirection(0, -1);
        if (key === 'arrowdown' || key === 's') this.pacman.setNextDirection(0, 1);
        if (key === 'arrowleft' || key === 'a') this.pacman.setNextDirection(-1, 0);
        if (key === 'arrowright' || key === 'd') this.pacman.setNextDirection(1, 0);
    }

    resetLevel() {
        this.map = JSON.parse(JSON.stringify(MAP_LAYOUT));
        this.pacman = new Pacman(9, 15);
        this.ghosts = [
            new Ghost(9, 9, CONFIG.COLORS.GHOSTS[0], 'CHASE'),
            new Ghost(8, 9, CONFIG.COLORS.GHOSTS[1], 'RANDOM'),
            new Ghost(10, 9, CONFIG.COLORS.GHOSTS[2], 'RANDOM'),
            new Ghost(9, 8, CONFIG.COLORS.GHOSTS[3], 'RANDOM')
        ];
        this.isPoweredUp = false;
        this.lastTime = 0;
        this.accumulator = 0;
    }

    loop(timestamp) {
        if (this.state !== 'PLAYING') return;

        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.accumulator += deltaTime;

        while (this.accumulator >= CONFIG.GAME_SPEED) {
            this.update();
            this.accumulator -= CONFIG.GAME_SPEED;
        }

        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }

    update() {
        if (this.state !== 'PLAYING') return;

        this.pacman.update(this.map);
        this.checkCollisions();

        this.ghosts.forEach(ghost => {
            ghost.update(this.map, this.pacman);
        });

        this.checkCollisions();

        // Check win condition
        if (!this.map.flat().includes(0) && !this.map.flat().includes(3)) {
            this.showGameOver('YOU WIN!');
        }
    }

    checkCollisions() {
        const px = Math.round(this.pacman.x);
        const py = Math.round(this.pacman.y);

        // Pellet collision
        if (this.map[py] && this.map[py][px] === 0) {
            this.map[py][px] = 2;
            this.score += 10;
            audio.pellet();
            this.updateHUD();
        } else if (this.map[py] && this.map[py][px] === 3) {
            this.map[py][px] = 2;
            this.score += 50;
            this.activatePowerPellet();
            audio.powerUp();
            this.updateHUD();
        }

        // Ghost collision
        this.ghosts.forEach(ghost => {
            const gx = Math.round(ghost.x);
            const gy = Math.round(ghost.y);

            if (px === gx && py === gy) {
                if (ghost.isScared) {
                    ghost.reset();
                    this.score += 200;
                    audio.ghostEaten();
                    this.updateHUD();
                } else {
                    this.handleDeath();
                }
            }
        });
    }

    activatePowerPellet() {
        this.isPoweredUp = true;
        this.ghosts.forEach(g => g.scare());
        clearTimeout(this.powerTimeout);
        this.powerTimeout = setTimeout(() => {
            this.isPoweredUp = false;
            this.ghosts.forEach(g => g.unscare());
        }, CONFIG.POWER_DURATION);
    }

    handleDeath() {
        this.lives--;
        audio.death();
        this.updateHUD();
        if (this.lives <= 0) {
            this.showGameOver('GAME OVER');
        } else {
            this.pacman.reset(9, 15);
            this.ghosts.forEach(g => g.reset());
            this.state = 'PAUSED';
            setTimeout(() => {
                if (this.state === 'PAUSED') this.state = 'PLAYING';
                this.loop(performance.now());
            }, 1000);
        }
    }

    showGameOver(title) {
        this.state = 'GAMEOVER';
        document.getElementById('game-over-title').textContent = title;
        document.getElementById('final-score-val').textContent = this.score;
        this.showScreen('game-over-screen');
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMap();
        this.pacman.draw(this.ctx);
        this.ghosts.forEach(ghost => ghost.draw(this.ctx));
    }

    drawMap() {
        for (let r = 0; r < MAP_LAYOUT.length; r++) {
            for (let c = 0; c < MAP_LAYOUT[r].length; c++) {
                const cell = this.map[r][c];
                const x = c * CONFIG.TILE_SIZE;
                const y = r * CONFIG.TILE_SIZE;

                if (cell === 1) { // Wall
                    this.ctx.strokeStyle = CONFIG.COLORS.WALL;
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(x + 2, y + 2, CONFIG.TILE_SIZE - 4, CONFIG.TILE_SIZE - 4);
                } else if (cell === 0) { // Pellet
                    this.ctx.fillStyle = CONFIG.COLORS.PELLET;
                    this.ctx.beginPath();
                    this.ctx.arc(x + CONFIG.TILE_SIZE / 2, y + CONFIG.TILE_SIZE / 2, 2, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (cell === 3) { // Power Pellet
                    this.ctx.fillStyle = CONFIG.COLORS.POWER_PELLET;
                    this.ctx.beginPath();
                    this.ctx.arc(x + CONFIG.TILE_SIZE / 2, y + CONFIG.TILE_SIZE / 2, 5, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
    }
}

// --- Entity Base Class ---
class Entity {
    constructor(x, y) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.dir = { x: 0, y: 0 };
    }

    reset(x = this.startX, y = this.startY) {
        this.x = x;
        this.y = y;
        this.dir = { x: 0, y: 0 };
    }

    isValidMove(nx, ny, map) {
        if (ny < 0 || ny >= map.length || nx < 0 || nx >= map[0].length) return true; // Portal support
        return map[ny][nx] !== 1 && map[ny][nx] !== 4;
    }
}

class Pacman extends Entity {
    constructor(x, y) {
        super(x, y);
        this.nextDir = { x: 0, y: 0 };
        this.mouthOpen = 0;
        this.mouthSpeed = 0.2;
    }

    setNextDirection(x, y) {
        this.nextDir = { x, y };
    }

    update(map) {
        // Try to change to next direction if possible
        if (this.isValidMove(Math.round(this.x + this.nextDir.x), Math.round(this.y + this.nextDir.y), map)) {
            this.dir = this.nextDir;
        }

        const nx = Math.round(this.x + this.dir.x);
        const ny = Math.round(this.y + this.dir.y);

        if (this.isValidMove(nx, ny, map)) {
            this.x += this.dir.x;
            this.y += this.dir.y;

            // Portals
            if (this.x < 0) this.x = map[0].length - 1;
            if (this.x >= map[0].length) this.x = 0;
        }

        this.mouthOpen += this.mouthSpeed;
        if (this.mouthOpen > 0.5 || this.mouthOpen < 0) this.mouthSpeed *= -1;
    }

    draw(ctx) {
        const cx = this.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const cy = this.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const radius = CONFIG.TILE_SIZE / 2 - 2;

        let rotation = 0;
        if (this.dir.x === 1) rotation = 0;
        if (this.dir.x === -1) rotation = Math.PI;
        if (this.dir.y === 1) rotation = Math.PI / 2;
        if (this.dir.y === -1) rotation = -Math.PI / 2;

        ctx.fillStyle = CONFIG.COLORS.PACMAN;
        ctx.shadowBlur = 10;
        ctx.shadowColor = CONFIG.COLORS.PACMAN;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, rotation + this.mouthOpen, rotation + 2 * Math.PI - this.mouthOpen);
        ctx.lineTo(cx, cy);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class Ghost extends Entity {
    constructor(x, y, color, behavior) {
        super(x, y);
        this.color = color;
        this.behavior = behavior;
        this.isScared = false;
        this.timer = 0;
    }

    scare() { this.isScared = true; }
    unscare() { this.isScared = false; }

    update(map, pacman) {
        const possibleMoves = [
            { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
        ].filter(m => {
            // Can't go back immediately if already moving
            if (this.dir.x !== 0 || this.dir.y !== 0) {
                if (m.x === -this.dir.x && m.y === -this.dir.y) return false;
            }
            return this.isValidMove(Math.round(this.x + m.x), Math.round(this.y + m.y), map);
        });

        if (possibleMoves.length > 0) {
            if (this.isScared) {
                this.dir = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            } else {
                // Simple AI: Move towards target based on behavior
                let target = { x: pacman.x, y: pacman.y };
                if (this.behavior === 'RANDOM' && Math.random() > 0.8) {
                    this.dir = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                } else {
                    possibleMoves.sort((a, b) => {
                        const distA = Math.hypot(this.x + a.x - target.x, this.y + a.y - target.y);
                        const distB = Math.hypot(this.x + b.x - target.x, this.y + b.y - target.y);
                        return distA - distB;
                    });
                    this.dir = possibleMoves[0];
                }
            }
        }

        this.x += this.dir.x * CONFIG.GHOST_SPEED_RATIO;
        this.y += this.dir.y * CONFIG.GHOST_SPEED_RATIO;

        // Portals
        if (this.x < 0) this.x = map[0].length - 1;
        if (this.x >= map[0].length) this.x = 0;

        // Snap to grid frequently to prevent drifting
        if (Math.abs(this.x - Math.round(this.x)) < 0.1) this.x = Math.round(this.x);
        if (Math.abs(this.y - Math.round(this.y)) < 0.1) this.y = Math.round(this.y);
    }

    draw(ctx) {
        const cx = this.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const cy = this.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const radius = CONFIG.TILE_SIZE / 2 - 2;

        ctx.fillStyle = this.isScared ? CONFIG.COLORS.SCARED_GHOST : this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.fillStyle;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, Math.PI, 0);
        ctx.lineTo(cx + radius, cy + radius);
        ctx.lineTo(cx - radius, cy + radius);
        ctx.fill();

        // Eyes
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 2, 3, 0, Math.PI * 2);
        ctx.arc(cx + 4, cy - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 2, 1.5, 0, Math.PI * 2);
        ctx.arc(cx + 4, cy - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Instantiate and start
const game = new Game();

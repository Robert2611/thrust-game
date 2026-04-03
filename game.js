// game.js - Main game controller for Thrust: Neon

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.physics = new PhysicsEngine(this.canvas);
        
        this.state = 'MENU';
        this.currentLevelIndex = 0;
        this.difficulty = 'normal';
        
        this.ship = {
            x: 0, y: 0, vx: 0, vy: 0, rotation: 0, 
            fuel: 0, isThrusting: false, isRotatingLeft: false, isRotatingRight: false,
            isExploded: false
        };
        
        this.pod = {
            x: 0, y: 0, vx: 0, vy: 0, isAttached: false
        };
        
        this.initResize();
        this.initControls();
        this.setupMenu();
    }

    initResize() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            if (this.state === 'PLAYING') this.resetLevel();
        };
        window.addEventListener('resize', resize);
        resize();
    }

    initControls() {
        // Keyboard
        window.addEventListener('keydown', (e) => this.handleKey(e, true));
        window.addEventListener('keyup', (e) => this.handleKey(e, false));
        
        // Touch (Mobile)
        const bindTouch = (id, action) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('pointerdown', (e) => { e.preventDefault(); this.handleAction(action, true); });
            el.addEventListener('pointerup', (e) => { e.preventDefault(); this.handleAction(action, false); });
            el.addEventListener('pointermove', (e) => e.preventDefault());
        };

        bindTouch('left-ctrl', 'rotateLeft');
        bindTouch('right-ctrl', 'rotateRight');
        bindTouch('thrust-ctrl', 'thrust');
        bindTouch('beam-ctrl', 'beam');
        
        document.getElementById('start-btn').onclick = () => this.startLevel();
    }

    handleKey(e, isDown) {
        switch(e.code) {
            case 'ArrowLeft': this.handleAction('rotateLeft', isDown); break;
            case 'ArrowRight': this.handleAction('rotateRight', isDown); break;
            case 'ArrowUp': this.handleAction('thrust', isDown); break;
            case 'Space': this.handleAction('beam', isDown); break;
        }
    }

    handleAction(action, isDown) {
        if (this.state !== 'PLAYING' || this.ship.isExploded) return;
        
        switch(action) {
            case 'rotateLeft': this.ship.isRotatingLeft = isDown; break;
            case 'rotateRight': this.ship.isRotatingRight = isDown; break;
            case 'thrust': this.ship.isThrusting = isDown; break;
            case 'beam': if (isDown) this.toggleBeam(); break;
        }
    }

    toggleBeam() {
        // Only attach if close to the pod
        const dx = this.ship.x - this.pod.x;
        const dy = this.ship.y - this.pod.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
            this.pod.isAttached = !this.pod.isAttached;
        }
    }

    setupMenu() {
        document.getElementById('start-screen').style.display = 'flex';
        this.state = 'MENU';
    }

    startLevel() {
        document.getElementById('start-screen').style.display = 'none';
        this.resetLevel();
        this.state = 'PLAYING';
        this.loop();
    }

    resetLevel() {
        const level = levels[this.currentLevelIndex];
        const diff = difficultySettings[this.difficulty];
        
        this.ship = {
            x: level.shipStart.x, y: level.shipStart.y,
            vx: 0, vy: 0, rotation: 0,
            fuel: level.fuel * (1 / diff.fuelMult),
            isThrusting: false, isRotatingLeft: false, isRotatingRight: false,
            isExploded: false
        };
        
        this.pod = {
            x: level.podStart.x, y: level.podStart.y,
            vx: 0, vy: 0, isAttached: false
        };
        
        this.physics.gravity = level.gravity * diff.gravityMult;
        this.physics.thrustStrength = 0.25 * diff.thrustMult;
    }

    update() {
        if (this.state !== 'PLAYING') return;
        
        // Handle rotation speed manually
        if (this.ship.isRotatingLeft) this.ship.rotation -= this.physics.rotationSpeed;
        if (this.ship.isRotatingRight) this.ship.rotation += this.physics.rotationSpeed;
        
        const level = levels[this.currentLevelIndex];
        this.physics.update(this.ship, this.pod, level.terrain);
        
        // Game condition checks
        if (this.ship.fuel <= 0) this.ship.isThrusting = false;
        
        // Update HUD
        const fuelBar = document.getElementById('fuel-bar');
        const maxFuel = level.fuel * (1 / difficultySettings[this.difficulty].fuelMult);
        fuelBar.style.width = `${(this.ship.fuel / maxFuel) * 100}%`;
        
        // Success condition (at exit with pod)
        const distToExit = Math.sqrt((this.ship.x - level.exit.x)**2 + (this.ship.y - level.exit.y)**2);
        if (distToExit < level.exit.radius && this.pod.isAttached) {
            alert("MISSION COMPLETE!");
            this.currentLevelIndex = (this.currentLevelIndex + 1) % levels.length;
            this.startLevel();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const level = levels[this.currentLevelIndex];
        
        // Glow effect
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00f2ff';
        
        // Draw Terrain
        this.ctx.strokeStyle = '#00f2ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        for (let i = 0; i < level.terrain.length; i += 2) {
            if (i === 0) this.ctx.moveTo(level.terrain[i], level.terrain[i+1]);
            else this.ctx.lineTo(level.terrain[i], level.terrain[i+1]);
        }
        this.ctx.stroke();

        // Draw Exit
        this.ctx.beginPath();
        this.ctx.arc(level.exit.x, level.exit.y, level.exit.radius, 0, Math.PI * 2);
        this.ctx.setLineDash([5, 5]);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw Pod
        this.ctx.shadowColor = '#ff00ff';
        this.ctx.strokeStyle = '#ff00ff';
        this.ctx.beginPath();
        this.ctx.arc(this.pod.x, this.pod.y, 15, 0, Math.PI * 2);
        this.ctx.stroke();

        // Draw Ship
        this.ctx.shadowColor = '#fff';
        this.ctx.strokeStyle = '#fff';
        this.ctx.save();
        this.ctx.translate(this.ship.x, this.ship.y);
        this.ctx.rotate(this.ship.rotation);
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, -15);
        this.ctx.lineTo(10, 10);
        this.ctx.lineTo(-10, 10);
        this.ctx.closePath();
        this.ctx.stroke();
        
        if (this.ship.isThrusting && this.ship.fuel > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(-5, 10);
            this.ctx.lineTo(0, 25);
            this.ctx.lineTo(5, 10);
            this.ctx.stroke();
        }
        this.ctx.restore();

        // Draw Tether
        if (this.pod.isAttached) {
            this.ctx.shadowColor = '#fff';
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.beginPath();
            this.ctx.moveTo(this.ship.x, this.ship.y);
            this.ctx.lineTo(this.pod.x, this.pod.y);
            this.ctx.stroke();
        }
    }

    loop() {
        this.update();
        this.draw();
        if (this.state === 'PLAYING') {
            requestAnimationFrame(() => this.loop());
        }
    }
}

// Global hooks for UI buttons
const game = new Game();
window.setDifficulty = (diff) => {
    game.difficulty = diff;
    document.getElementById('difficulty-text').innerText = diff.toUpperCase();
};

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
            isExploded: false, isOnPlatform: true, explosionTriggered: false,
            cargo: null
        };
        
        this.resetTimeout = null;
        
        this.pod = {
            x: 0, y: 0, vx: 0, vy: 0, isAttached: false
        };
        
        this.particles = [];
        
        this.cameraX = 0;
        this.cameraY = 0;
        this.virtualWidth = 1000;
        this.virtualHeight = 800;

        // Input state tracking
        this.inputState = { left: false, right: false, thrust: false };

        this.initResize();
        this.initControls();
        this.updateDifficultyHUD();
        this.setupMenu();
    }

    updateDifficultyHUD() {
        const textEl = document.getElementById('difficulty-text');
        if (textEl) textEl.innerText = this.difficulty.toUpperCase();

        // Highlight selected button
        ['easy', 'normal', 'hard'].forEach(id => {
            const btn = document.getElementById(`btn-${id}`);
            if (btn) {
                if (this.difficulty === id) btn.classList.add('selected');
                else btn.classList.remove('selected');
            }
        });
    }

    initResize() {
        const playArea = document.getElementById('play-area');
        const resize = () => {
            this.canvas.width = playArea.clientWidth;
            this.canvas.height = playArea.clientHeight;
            this.updateCamera(true); // Immediate update on resize
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
        
        document.getElementById('start-btn').onclick = () => this.startLevel();
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) nextBtn.onclick = () => this.nextLevel();
    }

    handleKey(e, isDown) {
        if (this.state === 'MENU' && isDown) {
            if (e.code === 'Enter') this.startLevel();
            if (e.code === 'ArrowLeft') this.cycleDifficulty(-1);
            if (e.code === 'ArrowRight') this.cycleDifficulty(1);
            if (e.code === 'Digit1' || e.code === 'Numpad1') window.setDifficulty('easy');
            if (e.code === 'Digit2' || e.code === 'Numpad2') window.setDifficulty('normal');
            if (e.code === 'Digit3' || e.code === 'Numpad3') window.setDifficulty('hard');
        }

        if (this.state === 'SUCCESS' && isDown) {
            if (e.code === 'Enter') this.nextLevel();
        }

        switch(e.code) {
            case 'ArrowLeft': this.handleAction('rotateLeft', isDown); break;
            case 'ArrowRight': this.handleAction('rotateRight', isDown); break;
            case 'ArrowUp': this.handleAction('thrust', isDown); break;
        }
    }

    cycleDifficulty(dir) {
        const diffs = ['easy', 'normal', 'hard'];
        let idx = diffs.indexOf(this.difficulty);
        idx = (idx + dir + diffs.length) % diffs.length;
        window.setDifficulty(diffs[idx]);
    }

    handleAction(action, isDown) {
        if (this.state !== 'PLAYING' || this.ship.isExploded) return;
        
        // 1. Update internal input states
        if (action === 'rotateLeft') this.inputState.left = isDown;
        if (action === 'rotateRight') this.inputState.right = isDown;
        if (action === 'thrust') this.inputState.thrust = isDown;

        // 2. Derive ship actions
        // Thrust is active if ArrowUp is down OR both Left/Right are down
        const isActuallyThrusting = this.inputState.thrust || (this.inputState.left && this.inputState.right);
        
        this.ship.isThrusting = isActuallyThrusting;

        // Rotation is only active if NOT thrusting (when using combined buttons)
        // This ensures the ship doesn't rotate while thrusting via the dual-press
        if (isActuallyThrusting) {
            this.ship.isRotatingLeft = false;
            this.ship.isRotatingRight = false;
        } else {
            // Only rotate if not on platform
            if (!this.ship.isOnPlatform) {
                this.ship.isRotatingLeft = this.inputState.left;
                this.ship.isRotatingRight = this.inputState.right;
            }
        }

        // 3. Handle platform liftoff (only on thrust)
        if (isActuallyThrusting && this.ship.isOnPlatform) {
            this.ship.isOnPlatform = false;
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
        if (this.resetTimeout) {
            clearTimeout(this.resetTimeout);
            this.resetTimeout = null;
        }

        const level = levels[this.currentLevelIndex];
        const diff = difficultySettings[this.difficulty];

        this.ship = {
            x: level.shipStart.x, y: level.shipStart.y,
            vx: 0, vy: 0, rotation: 0,
            fuel: level.fuel * (1 / diff.fuelMult),
            isThrusting: false, isRotatingLeft: false, isRotatingRight: false,
            isExploded: false, isOnPlatform: true, explosionTriggered: false,
            cargo: null
        };
        
        this.pod = {
            x: level.podStart.x, y: level.podStart.y,
            vx: 0, vy: 0, isAttached: false,
            isCollected: false, type: level.podStart.type
        };

        this.particles = [];
        
        this.physics.gravity = level.gravity * diff.gravityMult;
        this.physics.thrustStrength = 0.25 * diff.thrustMult;
    }

    update() {
        if (this.state !== 'PLAYING') return;

        const level = levels[this.currentLevelIndex];

        // 1. Handle Explosion & Restart
        if (this.ship.isExploded) {
            if (!this.ship.explosionTriggered) {
                this.ship.explosionTriggered = true;
                this.spawnExplosion();
                this.resetTimeout = setTimeout(() => this.resetLevel(), 2000);
            }
            this.updateParticles();
            return;
        }

        // Update lingering particles if any
        this.updateParticles();
        
        // 2. Handle rotation speed if not on platform
        if (!this.ship.isOnPlatform) {
            if (this.ship.isRotatingLeft) this.ship.rotation -= this.physics.rotationSpeed;
            if (this.ship.isRotatingRight) this.ship.rotation += this.physics.rotationSpeed;
        } else {
            this.ship.isRotatingLeft = false;
            this.ship.isRotatingRight = false;
        }
        
        this.physics.update(this.ship, this.pod, level.terrain, level.platforms);
        this.updateCamera();

        // 3. Cargo Collection Logic (on landing)
        if (this.ship.isOnPlatform && !this.pod.isCollected && !this.ship.isExploded) {
            const distToPod = Math.sqrt((this.ship.x - this.pod.x)**2 + (this.ship.y - this.pod.y)**2);
            if (distToPod < 60) {
                this.ship.cargo = this.pod.type;
                this.pod.isCollected = true;
                this.updateCargoHUD();
            }
        }

        // 4. Game condition checks
        if (this.ship.fuel <= 0) this.ship.isThrusting = false;
        
        // Update HUD
        const fuelBar = document.getElementById('fuel-bar');
        const diff = difficultySettings[this.difficulty];
        const maxFuel = level.fuel * (1 / diff.fuelMult);
        fuelBar.style.width = `${(this.ship.fuel / maxFuel) * 100}%`;
        
        // Success condition (at exit platform)
        const distToExit = Math.sqrt((this.ship.x - level.exit.x)**2 + (this.ship.y - level.exit.y)**2);
        if (distToExit < level.exit.radius && this.ship.cargo && this.ship.isOnPlatform && this.state !== 'SUCCESS') {
            // 1. Immediately trigger 'SUCCESS' state visually
            this.state = 'SUCCESS';
            
            // 2. Wait a moment before showing the overlay (Cinematic Delay)
            setTimeout(() => {
                this.showSuccessScreen();
            }, 1200); // 1.2 second delay for the 'feel'
        }
    }

    updateCamera(immediate = false) {
        let targetX, targetY;

        // X Logic
        if (this.canvas.width >= this.virtualWidth) {
            targetX = -(this.canvas.width - this.virtualWidth) / 2;
        } else {
            targetX = Math.max(0, Math.min(this.ship.x - this.canvas.width / 2, this.virtualWidth - this.canvas.width));
        }

        // Y Logic
        if (this.canvas.height >= this.virtualHeight) {
            targetY = -(this.canvas.height - this.virtualHeight) / 2;
        } else {
            targetY = Math.max(0, Math.min(this.ship.y - this.canvas.height / 2, this.virtualHeight - this.canvas.height));
        }

        if (immediate) {
            this.cameraX = targetX;
            this.cameraY = targetY;
        } else {
            // Lerp for smoothness
            this.cameraX += (targetX - this.cameraX) * 0.1;
            this.cameraY += (targetY - this.cameraY) * 0.1;
        }
    }

    showSuccessScreen() {
        // Only show if we are still in SUCCESS state (not crashed)
        if (this.state !== 'SUCCESS') return;
        
        const screen = document.getElementById('success-screen');
        const fuelVal = document.getElementById('final-fuel');
        if (fuelVal) fuelVal.innerText = Math.floor(this.ship.fuel);
        if (screen) screen.style.display = 'flex';
    }

    nextLevel() {
        const screen = document.getElementById('success-screen');
        if (screen) screen.style.display = 'none';
        this.currentLevelIndex = (this.currentLevelIndex + 1) % levels.length;
        this.startLevel();
    }

    updateCargoHUD() {
        const boxEl = document.getElementById('cargo-box-hud');
        if (boxEl) {
            if (this.ship.cargo) {
                boxEl.classList.add('filled');
            } else {
                boxEl.classList.remove('filled');
            }
        }
    }

    spawnExplosion() {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.ship.x,
                y: this.ship.y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                rotation: Math.random() * Math.PI * 2,
                rv: (Math.random() - 0.5) * 0.2,
                life: 1.0
            });
        }
    }

    updateParticles() {
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rv;
            p.life -= 0.01;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const level = levels[this.currentLevelIndex];
        
        // 0. Update Radar
        this.drawRadar(level);

        this.ctx.save();
        this.ctx.translate(-this.cameraX, -this.cameraY);

        // 1. Draw Terrain
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00f2ff';
        this.ctx.strokeStyle = '#00f2ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        for (let i = 0; i < level.terrain.length; i += 2) {
            if (i === 0) this.ctx.moveTo(level.terrain[i], level.terrain[i+1]);
            else this.ctx.lineTo(level.terrain[i], level.terrain[i+1]);
        }
        this.ctx.stroke();

        // 2. Draw Platforms (Neon Green)
        this.ctx.shadowColor = '#39ff14';
        this.ctx.strokeStyle = '#39ff14';
        level.platforms.forEach(p => {
            this.ctx.beginPath();
            this.ctx.moveTo(p.x - p.width/2, p.y);
            this.ctx.lineTo(p.x + p.width/2, p.y);
            this.ctx.stroke();
        });

        // 3. Draw Exit Port (Empty Crate on Platform - Match Cargo Color)
        this.ctx.shadowColor = '#ff00ff';
        this.ctx.strokeStyle = '#ff00ff';
        
        // Draw the empty crate frame sitting on the platform
        this.ctx.strokeRect(level.exit.x - 10, level.exit.y - 20, 20, 20);
        
        // Fill the crate if mission is successful
        if (this.state === 'SUCCESS') {
            this.ctx.fillStyle = '#ff00ff';
            this.ctx.fillRect(level.exit.x - 10, level.exit.y - 20, 20, 20);
        }

        // 4. Draw Pod (if not collected: Filled Square)
        if (!this.pod.isCollected) {
            this.ctx.shadowColor = '#ff00ff';
            this.ctx.fillStyle = '#ff00ff';
            this.ctx.fillRect(this.pod.x - 10, this.pod.y - 10, 20, 20);
        }

        // 5. Draw Ship (if not exploded)
        if (!this.ship.isExploded) {
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
            
            // Draw Cargo Icon inside Ship
            if (this.ship.cargo) {
                this.ctx.fillStyle = '#ff00ff';
                this.ctx.shadowBlur = 10;
                this.ctx.fillRect(-3, -3, 6, 6);
                this.ctx.shadowBlur = 15;
            }
            
            if (this.ship.isThrusting && this.ship.fuel > 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(-5, 10);
                this.ctx.lineTo(0, 25);
                this.ctx.lineTo(5, 10);
                this.ctx.stroke();
            }
            this.ctx.restore();
        }

        // 6. Draw Explosion Particles
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.shadowColor = `rgba(255, 255, 255, ${p.life})`;
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${p.life})`;
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.beginPath();
            this.ctx.moveTo(0, -5);
            this.ctx.lineTo(5, 5);
            this.ctx.lineTo(-5, 5);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.restore();
        });

        this.ctx.restore();
    }

    drawRadar(level) {
        const radarCanvas = document.getElementById('radar-canvas');
        if (!radarCanvas) return;
        const rctx = radarCanvas.getContext('2d');
        const scale = 150 / 1000; // Map 1000 to 150px
        
        rctx.clearRect(0, 0, radarCanvas.width, radarCanvas.height);
        
        // Use a slight neon glow for terrain
        rctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
        rctx.lineWidth = 1;
        rctx.beginPath();
        for (let i = 0; i < level.terrain.length; i += 2) {
            const rx = level.terrain[i] * scale;
            const ry = level.terrain[i+1] * scale;
            if (i === 0) rctx.moveTo(rx, ry);
            else rctx.lineTo(rx, ry);
        }
        rctx.stroke();

        // Ship Icon (Pulsing White)
        const pulse = (Math.sin(Date.now() / 200) + 1) / 2;
        rctx.fillStyle = `rgba(255, 255, 255, ${0.5 + pulse * 0.5})`;
        rctx.fillRect(this.ship.x * scale - 2, this.ship.y * scale - 2, 4, 4);

        // Pod/Cargo (Neon Pink)
        if (!this.pod.isCollected) {
            rctx.fillStyle = '#ff00ff';
            rctx.fillRect(this.pod.x * scale - 2, this.pod.y * scale - 2, 4, 4);
        }

        // Exit Port (Neon Blue)
        rctx.strokeStyle = '#00f2ff';
        rctx.strokeRect(level.exit.x * scale - 3, level.exit.y * scale - 3, 6, 6);
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
    game.updateDifficultyHUD();
};

import { Ship } from '../models/Ship.js';
import { Pod } from '../models/Pod.js';
import { PhysicsEngine } from './PhysicsEngine.js';
import { levels } from '../data/levels.js';
import { GameState, InputActions } from '../constants.js';

export class GameEngine {
    constructor() {
        this.physics = new PhysicsEngine();
        this.ship = new Ship();
        this.pod = new Pod();
        this.particles = [];
        
        this.state = GameState.MENU;
        this.currentLevelIndex = 0;
        
        this.cameraX = 0;
        this.cameraY = 0;
        this.virtualWidth = 1000;
        this.virtualHeight = 800;

        this.inputState = { left: false, right: false, thrust: false };
        
        // Callbacks for UI/View
        this.onHUDUpdate = null;
        this.onStateChange = null;
        this.onExplosion = null;
    }

    startLevel() {
        this.resetLevel();
        this.state = GameState.PLAYING;
        if (this.onStateChange) this.onStateChange(this.state);
    }

    resetLevel() {
        const level = levels[this.currentLevelIndex];

        this.ship.reset(level.shipStart.x, level.shipStart.y, level.fuel);
        this.pod.reset(level.podStart.x, level.podStart.y, level.podStart.type);
        this.particles = [];
        
        this.physics.gravity = level.gravity;
        this.physics.thrustStrength = 0.25;

        this.applyInputToShip();
    }

    update() {
        if (this.state !== GameState.PLAYING) return;

        // Ensure ship state is always synced with latest input, 
        // especially during state changes like liftoff.
        this.applyInputToShip();

        const level = levels[this.currentLevelIndex];

        // 1. Handle Explosion & Restart
        if (this.ship.isExploded) {
            if (!this.ship.explosionTriggered) {
                this.ship.explosionTriggered = true;
                this.spawnExplosion();
                if (this.onExplosion) this.onExplosion();
            }
            this.updateParticles();
            return;
        }

        this.updateParticles();
        
        // 2. Handle rotation if not on platform
        if (!this.ship.isOnPlatform) {
            if (this.ship.isRotatingLeft) this.ship.rotation -= this.physics.rotationSpeed;
            if (this.ship.isRotatingRight) this.ship.rotation += this.physics.rotationSpeed;
        } else {
            this.ship.isRotatingLeft = false;
            this.ship.isRotatingRight = false;
        }
        
        this.physics.update(this.ship, this.pod, level.terrain, level.platforms);
        
        // 3. Cargo Collection Logic
        if (this.ship.isOnPlatform && !this.pod.isCollected && !this.ship.isExploded) {
            const distToPod = Math.sqrt((this.ship.x - this.pod.x)**2 + (this.ship.y - this.pod.y)**2);
            if (distToPod < 60) {
                this.ship.cargo = this.pod.type;
                this.pod.isCollected = true;
                if (this.onHUDUpdate) this.onHUDUpdate();
            }
        }

        // 4. Game condition checks
        if (this.ship.fuel <= 0) this.ship.isThrusting = false;
        
        if (this.onHUDUpdate) this.onHUDUpdate();
        
        // Success condition
        const distToExit = Math.sqrt((this.ship.x - level.exit.x)**2 + (this.ship.y - level.exit.y)**2);
        if (distToExit < level.exit.radius && this.ship.cargo && this.ship.isOnPlatform && this.state !== GameState.SUCCESS) {
            this.state = GameState.SUCCESS;
            if (this.onStateChange) this.onStateChange(this.state);
        }
    }

    handleAction(action, isDown) {
        if (action === InputActions.ROTATE_LEFT) this.inputState.left = isDown;
        if (action === InputActions.ROTATE_RIGHT) this.inputState.right = isDown;
        if (action === InputActions.THRUST) this.inputState.thrust = isDown;

        if (this.state !== GameState.PLAYING || this.ship.isExploded) return;
        this.applyInputToShip();
    }

    applyInputToShip() {
        const isDualThrust = this.inputState.left && this.inputState.right;
        const isActuallyThrusting = this.inputState.thrust || isDualThrust;
        
        this.ship.isThrusting = isActuallyThrusting;

        // Handle platform liftoff BEFORE rotation check
        if (isActuallyThrusting && this.ship.isOnPlatform) {
            this.ship.isOnPlatform = false;
        }

        // Now rotation check will see the updated isOnPlatform state
        if (isDualThrust && !this.inputState.thrust) {
            this.ship.isRotatingLeft = false;
            this.ship.isRotatingRight = false;
        } else {
            // Only rotate if not on platform
            if (!this.ship.isOnPlatform) {
                this.ship.isRotatingLeft = this.inputState.left;
                this.ship.isRotatingRight = this.inputState.right;
            } else {
                this.ship.isRotatingLeft = false;
                this.ship.isRotatingRight = false;
            }
        }
    }

    spawnExplosion() {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.ship.x, y: this.ship.y,
                vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
                rotation: Math.random() * Math.PI * 2,
                rv: (Math.random() - 0.5) * 0.2, life: 1.0
            });
        }
    }

    updateParticles() {
        this.particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            p.rotation += p.rv; p.life -= 0.01;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }

    nextLevel() {
        this.currentLevelIndex = (this.currentLevelIndex + 1) % levels.length;
        this.startLevel();
    }
}

import { Ship } from '../models/ship';
import { Pod } from '../models/pod';
import { PhysicsEngine } from './physics-engine';
import { levels } from '../data/levels';
import {
    GameState, InputActions,
    DEFAULT_VIRTUAL_WIDTH, DEFAULT_VIRTUAL_HEIGHT,
    DEFAULT_THRUST_STRENGTH, POD_PICKUP_RADIUS
} from '../constants';
import { ParticleSystem } from './particle-system';
import { Particle, HUDUpdateCallback, StateChangeCallback, ExplosionCallback } from '../types';
import { getTerrainPolygons } from './terrain-utils';

export class GameEngine {
    public physics: PhysicsEngine;
    public ship: Ship;
    public pod: Pod;
    public particleSystem: ParticleSystem;
    
    get particles(): Particle[] {
        return this.particleSystem.getParticles();
    }
    
    public state: GameState = GameState.MENU;
    public currentLevelIndex: number = 0;
    
    public cameraX: number = 0;
    public cameraY: number = 0;
    public virtualWidth: number = DEFAULT_VIRTUAL_WIDTH;
    public virtualHeight: number = DEFAULT_VIRTUAL_HEIGHT;

    public inputState = { left: false, right: false, thrust: false };
    
    public onHUDUpdate: HUDUpdateCallback | null = null;
    public onStateChange: StateChangeCallback | null = null;
    public onExplosion: ExplosionCallback | null = null;

    constructor() {
        this.physics = new PhysicsEngine();
        this.ship = new Ship();
        this.pod = new Pod();
        this.particleSystem = new ParticleSystem();
        this.state = GameState.MENU;

        // Allow bypassing to a specific level via URL (e.g., ?level=3)
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const levelParam = urlParams.get('level');
            if (levelParam !== null) {
                const parsed = parseInt(levelParam, 10);
                if (!isNaN(parsed) && parsed >= 1 && parsed <= levels.length) {
                    this.currentLevelIndex = parsed - 1;
                }
            }
        }
    }

    public startLevel(): void {
        this.resetLevel();
        this.state = GameState.PLAYING;
        if (this.onStateChange) this.onStateChange(this.state);
    }

    public resetLevel(): void {
        const level = levels[this.currentLevelIndex];

        let maxX = DEFAULT_VIRTUAL_WIDTH;
        let maxY = DEFAULT_VIRTUAL_HEIGHT;

        const polygons = getTerrainPolygons(level.terrain);
        for (const poly of polygons) {
            for (const p of poly.points) {
                if (p.x > maxX) maxX = p.x;
                if (p.y > maxY) maxY = p.y;
            }
        }

        this.virtualWidth = maxX;
        this.virtualHeight = maxY;

        this.ship.reset(level.shipStart.x, level.shipStart.y, level.fuel);
        this.pod.reset(level.podStart.x, level.podStart.y, level.podStart.type);
        this.particleSystem.clear();
        
        this.physics.gravity = level.gravity;
        this.physics.thrustStrength = DEFAULT_THRUST_STRENGTH;

        this.applyInputToShip();
    }

    public update(): void {
        if (this.state !== GameState.PLAYING) return;

        this.applyInputToShip();

        const level = levels[this.currentLevelIndex];

        if (this.ship.isExploded) {
            if (!this.ship.explosionTriggered) {
                this.ship.explosionTriggered = true;
                this.particleSystem.spawnExplosion(this.ship.x, this.ship.y);
                if (this.onExplosion) this.onExplosion();
            }
            this.particleSystem.update();
            return;
        }

        this.particleSystem.update();
        
        if (!this.ship.isOnPlatform) {
            if (this.ship.isRotatingLeft) this.ship.rotation -= this.physics.rotationSpeed;
            if (this.ship.isRotatingRight) this.ship.rotation += this.physics.rotationSpeed;
        } else {
            this.ship.isRotatingLeft = false;
            this.ship.isRotatingRight = false;
        }
        
        this.physics.update(this.ship, this.pod, level.terrain, level.platforms, level.fans);
        
        if (this.ship.isOnPlatform && !this.pod.isCollected && !this.ship.isExploded) {
            const distToPod = Math.sqrt((this.ship.x - this.pod.x)**2 + (this.ship.y - this.pod.y)**2);
            if (distToPod < POD_PICKUP_RADIUS) {
                this.ship.cargo = this.pod.type;
                this.pod.isCollected = true;
                if (this.onHUDUpdate) this.onHUDUpdate();
            }
        }

        if (this.ship.fuel <= 0) this.ship.isThrusting = false;
        
        if (this.onHUDUpdate) this.onHUDUpdate();
        
        const distToExit = Math.sqrt((this.ship.x - level.exit.x)**2 + (this.ship.y - level.exit.y)**2);
        if (distToExit < level.exit.radius && this.ship.cargo && this.ship.isOnPlatform) {
            this.state = GameState.SUCCESS;
            if (this.onStateChange) this.onStateChange(this.state);
        }
    }

    public handleAction(action: InputActions, isDown: boolean): void {
        if (action === InputActions.ROTATE_LEFT) this.inputState.left = isDown;
        if (action === InputActions.ROTATE_RIGHT) this.inputState.right = isDown;
        if (action === InputActions.THRUST) this.inputState.thrust = isDown;

        if (this.state !== GameState.PLAYING || this.ship.isExploded) return;
        this.applyInputToShip();
    }

    public applyInputToShip(): void {
        const isDualThrust = this.inputState.left && this.inputState.right;
        const isActuallyThrusting = this.inputState.thrust || isDualThrust;
        
        this.ship.isThrusting = isActuallyThrusting;

        if (isActuallyThrusting && this.ship.isOnPlatform) {
            this.ship.isOnPlatform = false;
        }

        if (isDualThrust && !this.inputState.thrust) {
            this.ship.isRotatingLeft = false;
            this.ship.isRotatingRight = false;
        } else {
            if (!this.ship.isOnPlatform) {
                this.ship.isRotatingLeft = this.inputState.left;
                this.ship.isRotatingRight = this.inputState.right;
            } else {
                this.ship.isRotatingLeft = false;
                this.ship.isRotatingRight = false;
            }
        }
    }


    public nextLevel(): void {
        this.currentLevelIndex = (this.currentLevelIndex + 1) % levels.length;
        this.startLevel();
    }
}

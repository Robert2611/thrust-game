import { levels } from '../data/levels';
import { GameState } from '../constants';
import { GameEngine } from '../core/GameEngine';
import { Level } from '../types';

export class Renderer {
    private game: GameEngine;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private radarCanvas: HTMLCanvasElement | null;
    private rctx: CanvasRenderingContext2D | null;
    private stars: {x: number, y: number, size: number, blinkSpeed: number}[] = [];

    constructor(gameEngine: GameEngine, canvas: HTMLCanvasElement) {
        this.game = gameEngine;
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) throw new Error("Could not get 2D context");
        this.ctx = context;

        this.radarCanvas = document.getElementById('radar-canvas') as HTMLCanvasElement | null;
        this.rctx = this.radarCanvas ? this.radarCanvas.getContext('2d') : null;

        // Initialize stars
        for (let i = 0; i < 150; i++) {
            this.stars.push({
                x: Math.random() * 2000,
                y: Math.random() * 2000,
                size: Math.random() * 2 + 0.5,
                blinkSpeed: Math.random() * 0.05 + 0.01
            });
        }
    }

    public draw(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const level = levels[this.game.currentLevelIndex];
        
        this.drawRadar(level);

        this.ctx.save();
        
        // Draw Starfield (with parallax)
        this.drawStarfield();

        this.ctx.translate(-this.game.cameraX, -this.game.cameraY);

        this.drawTerrain(level);
        this.drawPlatforms(level);
        this.drawExit(level);
        this.drawPod();
        this.drawShip();
        this.drawParticles();

        this.ctx.restore();
    }

    private drawTerrain(level: Level): void {
        const wallFill = getComputedStyle(document.documentElement).getPropertyValue('--cave-wall-fill').trim() || '#1a1b24';
        const wallEdge = getComputedStyle(document.documentElement).getPropertyValue('--cave-wall-edge').trim() || '#4a9eff';

        this.ctx.save();
        
        // 1. Create the "Hole Punch" Path
        this.ctx.beginPath();
        
        // A. Huge Outer Rectangle (The "Infinite Rock")
        // We use massive coordinates to ensure it covers the entire visible area even when scrolling
        const size = 10000;
        this.ctx.rect(-size/2, -size/2, size, size);
        
        // B. The Cave Corridor (The "Hole")
        // Because of 'even-odd' fill rule, drawing this path inside the rectangle will "punch it out"
        for (let i = 0; i < level.terrain.length; i += 2) {
            if (i === 0) this.ctx.moveTo(level.terrain[i], level.terrain[i+1]);
            else this.ctx.lineTo(level.terrain[i], level.terrain[i+1]);
        }
        this.ctx.closePath();
        
        // 2. Fill the Rock (Everything BUT the corridor)
        this.ctx.fillStyle = wallFill;
        this.ctx.fill('evenodd');

        // 3. Draw the Edge Highlight
        // We draw the corridor again but as a stroke
        this.ctx.beginPath();
        for (let i = 0; i < level.terrain.length; i += 2) {
            if (i === 0) this.ctx.moveTo(level.terrain[i], level.terrain[i+1]);
            else this.ctx.lineTo(level.terrain[i], level.terrain[i+1]);
        }
        this.ctx.closePath();
        
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = wallEdge;
        this.ctx.strokeStyle = wallEdge;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    private drawStarfield(): void {
        const time = Date.now();
        this.ctx.save();
        
        // Parallax effect: stars move slower than the camera
        const px = -this.game.cameraX * 0.3;
        const py = -this.game.cameraY * 0.3;
        
        this.ctx.translate(px, py);

        this.stars.forEach(s => {
            const blink = (Math.sin(time * s.blinkSpeed) + 1) / 2;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + blink * 0.6})`;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.restore();
    }

    private drawPlatforms(level: Level): void {
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = '#50fa7b';
        this.ctx.strokeStyle = '#50fa7b';
        level.platforms.forEach(p => {
            this.ctx.beginPath();
            this.ctx.moveTo(p.x - p.width/2, p.y);
            this.ctx.lineTo(p.x + p.width/2, p.y);
            this.ctx.stroke();
        });
    }

    private drawExit(level: Level): void {
        const exitColor = '#d44eff';
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = exitColor;
        this.ctx.strokeStyle = exitColor;
        this.ctx.strokeRect(level.exit.x - 10, level.exit.y - 20, 20, 20);
        if (this.game.state === GameState.SUCCESS) {
            this.ctx.fillStyle = exitColor;
            this.ctx.fillRect(level.exit.x - 10, level.exit.y - 20, 20, 20);
        }
    }

    private drawPod(): void {
        if (!this.game.pod.isCollected) {
            const podColor = '#d44eff';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = podColor;
            this.ctx.fillStyle = podColor;
            this.ctx.fillRect(this.game.pod.x - 10, this.game.pod.y - 10, 20, 20);
        }
    }

    private drawShip(): void {
        if (!this.game.ship.isExploded) {
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = '#fff';
            this.ctx.strokeStyle = '#fff';
            this.ctx.save();
            this.ctx.translate(this.game.ship.x, this.game.ship.y);
            this.ctx.rotate(this.game.ship.rotation);
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, -15);
            this.ctx.lineTo(10, 10);
            this.ctx.lineTo(-10, 10);
            this.ctx.closePath();
            this.ctx.stroke();
            
            if (this.game.ship.cargo) {
                this.ctx.fillStyle = '#ff00ff';
                this.ctx.fillRect(-3, -3, 6, 6);
            }
            
            if (this.game.ship.isThrusting && this.game.ship.fuel > 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(-5, 10);
                this.ctx.lineTo(0, 25);
                this.ctx.lineTo(5, 10);
                this.ctx.stroke();
            }
            this.ctx.restore();
        }
    }

    private drawParticles(): void {
        this.game.particles.forEach(p => {
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
    }

    private drawRadar(level: Level): void {
        if (!this.rctx || !this.radarCanvas) return;
        const scale = 150 / 1000;
        this.rctx.clearRect(0, 0, this.radarCanvas.width, this.radarCanvas.height);
        this.rctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
        this.rctx.lineWidth = 1;
        this.rctx.beginPath();
        for (let i = 0; i < level.terrain.length; i += 2) {
            const rx = level.terrain[i] * scale;
            const ry = level.terrain[i+1] * scale;
            if (i === 0) this.rctx.moveTo(rx, ry);
            else this.rctx.lineTo(rx, ry);
        }
        this.rctx.stroke();

        // Ship
        const pulse = (Math.sin(Date.now() / 200) + 1) / 2;
        this.rctx.fillStyle = `rgba(255, 255, 255, ${0.5 + pulse * 0.5})`;
        this.rctx.fillRect(this.game.ship.x * scale - 2, this.game.ship.y * scale - 2, 4, 4);
        
        // Pod
        if (!this.game.pod.isCollected) {
            this.rctx.fillStyle = '#d44eff';
            this.rctx.fillRect(this.game.pod.x * scale - 2, this.game.pod.y * scale - 2, 4, 4);
        }
        
        // Exit
        this.rctx.strokeStyle = '#4a9eff';
        this.rctx.strokeRect(level.exit.x * scale - 3, level.exit.y * scale - 3, 6, 6);
    }
}

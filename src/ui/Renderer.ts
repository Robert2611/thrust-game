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

    constructor(gameEngine: GameEngine, canvas: HTMLCanvasElement) {
        this.game = gameEngine;
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) throw new Error("Could not get 2D context");
        this.ctx = context;

        this.radarCanvas = document.getElementById('radar-canvas') as HTMLCanvasElement | null;
        this.rctx = this.radarCanvas ? this.radarCanvas.getContext('2d') : null;
    }

    public draw(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const level = levels[this.game.currentLevelIndex];
        
        this.drawRadar(level);

        this.ctx.save();
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
    }

    private drawPlatforms(level: Level): void {
        this.ctx.shadowColor = '#39ff14';
        this.ctx.strokeStyle = '#39ff14';
        level.platforms.forEach(p => {
            this.ctx.beginPath();
            this.ctx.moveTo(p.x - p.width/2, p.y);
            this.ctx.lineTo(p.x + p.width/2, p.y);
            this.ctx.stroke();
        });
    }

    private drawExit(level: Level): void {
        this.ctx.shadowColor = '#ff00ff';
        this.ctx.strokeStyle = '#ff00ff';
        this.ctx.strokeRect(level.exit.x - 10, level.exit.y - 20, 20, 20);
        if (this.game.state === GameState.SUCCESS) {
            this.ctx.fillStyle = '#ff00ff';
            this.ctx.fillRect(level.exit.x - 10, level.exit.y - 20, 20, 20);
        }
    }

    private drawPod(): void {
        if (!this.game.pod.isCollected) {
            this.ctx.shadowColor = '#ff00ff';
            this.ctx.fillStyle = '#ff00ff';
            this.ctx.fillRect(this.game.pod.x - 10, this.game.pod.y - 10, 20, 20);
        }
    }

    private drawShip(): void {
        if (!this.game.ship.isExploded) {
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
        const pulse = (Math.sin(Date.now() / 200) + 1) / 2;
        this.rctx.fillStyle = `rgba(255, 255, 255, ${0.5 + pulse * 0.5})`;
        this.rctx.fillRect(this.game.ship.x * scale - 2, this.game.ship.y * scale - 2, 4, 4);
        if (!this.game.pod.isCollected) {
            this.rctx.fillStyle = '#ff00ff';
            this.rctx.fillRect(this.game.pod.x * scale - 2, this.game.pod.y * scale - 2, 4, 4);
        }
        this.rctx.strokeStyle = '#00f2ff';
        this.rctx.strokeRect(level.exit.x * scale - 3, level.exit.y * scale - 3, 6, 6);
    }
}

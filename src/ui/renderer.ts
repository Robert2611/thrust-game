import { levels } from '../data/levels';
import { GameState } from '../constants';
import { GameEngine } from '../core/game-engine';
import { Level } from '../types';

export class Renderer {
    private game: GameEngine;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private radarCanvas: HTMLCanvasElement | null;
    private rctx: CanvasRenderingContext2D | null;
    private colors: { [key: string]: string } = {};
    private stars: { x: number, y: number, size: number }[] = [];

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
                size: Math.random() * 2 + 0.5
            });
        }
    }

    private updateColors(): void {
        const style = getComputedStyle(document.documentElement);
        this.colors = {
            caveWallFill: style.getPropertyValue('--cave-wall-fill').trim(),
            caveWallEdge: style.getPropertyValue('--cave-wall-edge').trim(),
            starColor: style.getPropertyValue('--star-color').trim(),
            shipColor: style.getPropertyValue('--ship-color').trim(),
            shipCargoColor: style.getPropertyValue('--ship-cargo-color').trim(),
            shipThrustColor: style.getPropertyValue('--ship-thrust-color').trim(),
            podColor: style.getPropertyValue('--pod-color').trim(),
            exitPortalColor: style.getPropertyValue('--exit-portal-color').trim(),
            platformColor: style.getPropertyValue('--platform-color').trim(),
            particleColor: style.getPropertyValue('--particle-color').trim(),
            radarGridColor: style.getPropertyValue('--radar-grid-color').trim(),
            radarShipColor: style.getPropertyValue('--radar-ship-color').trim(),
            radarPodColor: style.getPropertyValue('--radar-pod-color').trim(),
            radarExitColor: style.getPropertyValue('--radar-exit-color').trim()
        };
    }

    public draw(): void {
        this.updateColors();

        // 1. Fill the viewport with rock color
        this.ctx.fillStyle = this.colors.caveWallFill;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const level = levels[this.game.currentLevelIndex];
        this.drawRadar(level);

        this.ctx.save();
        this.ctx.translate(-this.game.cameraX, -this.game.cameraY);

        // 2. Clear out the corridor and show stars inside it
        this.ctx.save();
        this.ctx.beginPath();
        for (let i = 0; i < level.terrain.length; i += 2) {
            if (i === 0) this.ctx.moveTo(level.terrain[i], level.terrain[i + 1]);
            else this.ctx.lineTo(level.terrain[i], level.terrain[i + 1]);
        }
        this.ctx.closePath();
        this.ctx.clip();

        // Erase the rock we just painted over the whole screen,
        // allowing the dark CSS background (space) to show through.
        this.ctx.clearRect(this.game.cameraX, this.game.cameraY, this.canvas.width, this.canvas.height);

        // Draw Starfield (only visible in corridor)
        this.drawStarfield();
        this.ctx.restore();

        // 3. Draw game entities
        this.drawTerrain(level);
        this.drawPlatforms(level);
        this.drawFans(level);
        this.drawExit(level);
        this.drawPod();
        this.drawShip();
        this.drawParticles();

        this.ctx.restore();
    }

    private drawTerrain(level: Level): void {
        this.ctx.save();
        this.ctx.beginPath();
        for (let i = 0; i < level.terrain.length; i += 2) {
            if (i === 0) this.ctx.moveTo(level.terrain[i], level.terrain[i + 1]);
            else this.ctx.lineTo(level.terrain[i], level.terrain[i + 1]);
        }
        this.ctx.closePath();

        this.ctx.shadowColor = this.colors.caveWallEdge;
        this.ctx.strokeStyle = this.colors.caveWallEdge;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.restore();
    }

    private drawStarfield(): void {
        this.ctx.save();

        // Parallax effect: stars move slower than the camera
        const px = -this.game.cameraX * 0.3;
        const py = -this.game.cameraY * 0.3;

        this.ctx.translate(px, py);
        
        this.ctx.fillStyle = this.colors.starColor;
        this.ctx.globalAlpha = 0.6;

        this.stars.forEach(s => {
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.restore();
    }

    private drawPlatforms(level: Level): void {
        this.ctx.shadowColor = this.colors.platformColor;
        this.ctx.strokeStyle = this.colors.platformColor;
        level.platforms.forEach(p => {
            this.ctx.beginPath();
            this.ctx.moveTo(p.x - p.width / 2, p.y);
            this.ctx.lineTo(p.x + p.width / 2, p.y);
            this.ctx.stroke();
        });
    }

    private drawFans(level: Level): void {
        const fans = level.fans || [];
        fans.forEach(f => {
            this.ctx.save();
            this.ctx.translate(f.x, f.y);
            this.ctx.rotate(f.rotation);

            const W = f.width;
            const R = W * 0.8;           // housing radius
            const cx = -R - W * 0.3;    // center of round housing, offset left from outlet
            const cy = 0;

            // --- Outlet duct walls ---
            this.ctx.fillStyle = '#6B6E7A';
            // Top wall
            this.ctx.fillRect(cx + R * 0.6, -W / 2 - 6, -cx - R * 0.6, 6);
            // Bottom wall
            this.ctx.fillRect(cx + R * 0.6, W / 2, -cx - R * 0.6, 6);

            // --- Housing body (filled circle) ---
            this.ctx.fillStyle = '#5A5C68';
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, R, 0, Math.PI * 2);
            this.ctx.fill();

            // --- Housing rim (stroke) ---
            this.ctx.strokeStyle = '#9EA1AE';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, R, 0, Math.PI * 2);
            this.ctx.stroke();

            // --- Impeller blades ---
            const numBlades = 7;
            const innerR = R * 0.28;
            const outerR = R * 0.82;
            const spinAngle = (Date.now() / 150) % (Math.PI * 2); // spin ~4 RPM
            this.ctx.strokeStyle = '#C0C3D0';
            this.ctx.lineWidth = 2.5;
            for (let i = 0; i < numBlades; i++) {
                const angle = spinAngle + (i / numBlades) * Math.PI * 2;
                const nextAngle = angle + 0.55; // forward-curved blade sweep
                const x1 = cx + Math.cos(angle) * innerR;
                const y1 = cy + Math.sin(angle) * innerR;
                const x2 = cx + Math.cos(nextAngle) * outerR;
                const y2 = cy + Math.sin(nextAngle) * outerR;
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
            }

            // --- Hub circle ---
            this.ctx.fillStyle = '#9EA1AE';
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        });
    }

    private drawExit(level: Level): void {
        const color = this.colors.exitPortalColor;
        this.ctx.shadowColor = color;
        this.ctx.strokeStyle = color;
        this.ctx.strokeRect(level.exit.x - 10, level.exit.y - 20, 20, 20);
        if (this.game.state === GameState.SUCCESS) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(level.exit.x - 10, level.exit.y - 20, 20, 20);
        }
    }

    private drawPod(): void {
        if (!this.game.pod.isCollected) {
            const color = this.colors.podColor;
            this.ctx.shadowColor = color;
            this.ctx.fillStyle = color;
            this.ctx.fillRect(this.game.pod.x - 10, this.game.pod.y - 10, 20, 20);
        }
    }

    private drawShip(): void {
        if (!this.game.ship.isExploded) {
            this.ctx.shadowColor = this.colors.shipColor;
            this.ctx.strokeStyle = this.colors.shipColor;
            this.ctx.fillStyle = this.colors.shipColor;
            this.ctx.save();
            this.ctx.translate(this.game.ship.x, this.game.ship.y);
            this.ctx.rotate(this.game.ship.rotation);

            this.ctx.beginPath();
            this.ctx.moveTo(0, -15);
            this.ctx.lineTo(10, 10);
            this.ctx.lineTo(-10, 10);
            this.ctx.closePath();
            this.ctx.fill();

            if (this.game.ship.cargo) {
                this.ctx.fillStyle = this.colors.shipCargoColor;
                this.ctx.fillRect(-3, -3, 6, 6);
            }

            if (this.game.ship.isThrusting && this.game.ship.fuel > 0) {
                this.ctx.shadowBlur = 10;
                this.ctx.beginPath();
                this.ctx.moveTo(-5, 10);
                this.ctx.lineTo(0, 25);
                this.ctx.lineTo(5, 10);
                this.ctx.fillStyle = this.colors.shipThrustColor;
                this.ctx.fill();
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
        this.rctx.clearRect(0, 0, this.radarCanvas.width, this.radarCanvas.height);
        
        // Fill radar background with rock Fill
        this.rctx.fillStyle = this.colors.caveWallFill || '#1a1b24';
        this.rctx.fillRect(0, 0, this.radarCanvas.width, this.radarCanvas.height);

        // Calculate dynamic scale to fit the entire level, with a 5% margin
        const targetScale = Math.min(
            (this.radarCanvas.width * 0.9) / this.game.virtualWidth, 
            (this.radarCanvas.height * 0.9) / this.game.virtualHeight
        );
        const offsetX = (this.radarCanvas.width - this.game.virtualWidth * targetScale) / 2;
        const offsetY = (this.radarCanvas.height - this.game.virtualHeight * targetScale) / 2;

        this.rctx.save();
        this.rctx.translate(offsetX, offsetY);
        this.rctx.scale(targetScale, targetScale);

        // Clip out the hallway for the sky
        this.rctx.save();
        this.rctx.beginPath();
        for (let i = 0; i < level.terrain.length; i += 2) {
            if (i === 0) this.rctx.moveTo(level.terrain[i], level.terrain[i + 1]);
            else this.rctx.lineTo(level.terrain[i], level.terrain[i + 1]);
        }
        this.rctx.closePath();
        this.rctx.clip();
        
        // Fill hallway with sky/void
        this.rctx.fillStyle = '#050507'; // A dark sky color matching the game background
        this.rctx.fillRect(0, 0, this.game.virtualWidth, this.game.virtualHeight);
        this.rctx.restore();

        // Outline the boundary
        this.rctx.strokeStyle = this.colors.radarGridColor;
        this.rctx.lineWidth = 1 / targetScale; // visually maintain 1px
        this.rctx.beginPath();
        for (let i = 0; i < level.terrain.length; i += 2) {
            if (i === 0) this.rctx.moveTo(level.terrain[i], level.terrain[i + 1]);
            else this.rctx.lineTo(level.terrain[i], level.terrain[i + 1]);
        }
        this.rctx.stroke();

        // Ship
        const pulse = (Math.sin(Date.now() / 200) + 1) / 2;
        this.rctx.fillStyle = this.colors.radarShipColor;
        this.rctx.globalAlpha = 0.5 + pulse * 0.5;
        this.rctx.fillRect(this.game.ship.x - 2/targetScale, this.game.ship.y - 2/targetScale, 4/targetScale, 4/targetScale);
        this.rctx.globalAlpha = 1.0;

        // Pod
        if (!this.game.pod.isCollected) {
            this.rctx.fillStyle = this.colors.radarPodColor;
            this.rctx.fillRect(this.game.pod.x - 2/targetScale, this.game.pod.y - 2/targetScale, 4/targetScale, 4/targetScale);
        }

        // Exit
        this.rctx.strokeStyle = this.colors.radarExitColor;
        this.rctx.lineWidth = 1 / targetScale;
        this.rctx.strokeRect(level.exit.x - 3/targetScale, level.exit.y - 3/targetScale, 6/targetScale, 6/targetScale);

        this.rctx.restore();
    }
}

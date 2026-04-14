import { levels } from '../data/levels';
import {
    GameState,
    STAR_COUNT, STAR_FIELD_SPREAD, STAR_MIN_SIZE, STAR_SIZE_RANGE, STAR_ALPHA, STARFIELD_PARALLAX,
    TERRAIN_LINE_WIDTH,
    SHIP_NOSE_Y, SHIP_WING_X, SHIP_WING_Y, SHIP_THRUST_GLOW_BLUR, SHIP_THRUST_TIP_X, SHIP_THRUST_TIP_Y, SHIP_CARGO_HALF,
    POD_HALF_SIZE, EXIT_HALF_WIDTH, EXIT_HEIGHT,
    FAN_HOUSING_RADIUS_RATIO, FAN_HOUSING_OFFSET_RATIO, FAN_DUCT_WALL_THICKNESS,
    FAN_BLADE_COUNT, FAN_BLADE_INNER_RATIO, FAN_BLADE_OUTER_RATIO, FAN_BLADE_SWEEP,
    FAN_SPIN_PERIOD_MS, FAN_HOUSING_DUCT_JOIN,
    FAN_COLOR_DUCT, FAN_COLOR_HOUSING, FAN_COLOR_RIM, FAN_COLOR_BLADE,
    FAN_RIM_LINE_WIDTH, FAN_BLADE_LINE_WIDTH,
    RADAR_MARGIN, RADAR_PULSE_PERIOD_MS, RADAR_BLIP_SIZE, RADAR_EXIT_BLIP_SIZE,
    RADAR_FALLBACK_BG, RADAR_VOID_COLOR
} from '../constants';
import { GameEngine } from '../core/game-engine';
import { Level, TerrainObject } from '../types';
import { getTerrainPolygons } from '../core/terrain-utils';

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
        for (let i = 0; i < STAR_COUNT; i++) {
            this.stars.push({
                x: Math.random() * STAR_FIELD_SPREAD,
                y: Math.random() * STAR_FIELD_SPREAD,
                size: Math.random() * STAR_SIZE_RANGE + STAR_MIN_SIZE
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
        const polygons = getTerrainPolygons(level.terrain);
        for (const poly of polygons) {
            if (!poly.isSolid) {
                this.addPolygonPath(this.ctx, poly.points);
            }
        }
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

    private addPolygonPath(ctx: CanvasRenderingContext2D, points: { x: number, y: number }[]): void {
        if (points.length < 2) return;
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
    }

    private drawTerrain(level: Level): void {
        const polygons = getTerrainPolygons(level.terrain);
        
        // Draw the edges of the holes and the solid islands
        this.ctx.save();
        this.ctx.shadowColor = this.colors.caveWallEdge;
        this.ctx.strokeStyle = this.colors.caveWallEdge;
        this.ctx.lineWidth = TERRAIN_LINE_WIDTH;

        for (const poly of polygons) {
            this.ctx.beginPath();
            this.addPolygonPath(this.ctx, poly.points);
            
            if (poly.isSolid) {
                // If it's a solid island, we fill it with rock color to restore it
                this.ctx.fillStyle = this.colors.caveWallFill;
                this.ctx.fill();
            }
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    private drawStarfield(): void {
        this.ctx.save();

        // Parallax effect: stars move slower than the camera
        const px = -this.game.cameraX * STARFIELD_PARALLAX;
        const py = -this.game.cameraY * STARFIELD_PARALLAX;

        this.ctx.translate(px, py);
        
        this.ctx.fillStyle = this.colors.starColor;
        this.ctx.globalAlpha = STAR_ALPHA;

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
            const R = W * FAN_HOUSING_RADIUS_RATIO;
            const cx = -R - W * FAN_HOUSING_OFFSET_RATIO;
            const cy = 0;

            // --- Outlet duct walls ---
            this.ctx.fillStyle = FAN_COLOR_DUCT;
            // Top wall
            this.ctx.fillRect(cx + R * FAN_HOUSING_DUCT_JOIN, -W / 2 - FAN_DUCT_WALL_THICKNESS, -cx - R * FAN_HOUSING_DUCT_JOIN, FAN_DUCT_WALL_THICKNESS);
            // Bottom wall
            this.ctx.fillRect(cx + R * FAN_HOUSING_DUCT_JOIN, W / 2, -cx - R * FAN_HOUSING_DUCT_JOIN, FAN_DUCT_WALL_THICKNESS);

            // --- Housing body (filled circle) ---
            this.ctx.fillStyle = FAN_COLOR_HOUSING;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, R, 0, Math.PI * 2);
            this.ctx.fill();

            // --- Housing rim (stroke) ---
            this.ctx.strokeStyle = FAN_COLOR_RIM;
            this.ctx.lineWidth = FAN_RIM_LINE_WIDTH;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, R, 0, Math.PI * 2);
            this.ctx.stroke();

            // --- Impeller blades ---
            const innerR = R * FAN_BLADE_INNER_RATIO;
            const outerR = R * FAN_BLADE_OUTER_RATIO;
            const spinAngle = (Date.now() / FAN_SPIN_PERIOD_MS) % (Math.PI * 2);
            this.ctx.strokeStyle = FAN_COLOR_BLADE;
            this.ctx.lineWidth = FAN_BLADE_LINE_WIDTH;
            for (let i = 0; i < FAN_BLADE_COUNT; i++) {
                const angle = spinAngle + (i / FAN_BLADE_COUNT) * Math.PI * 2;
                const nextAngle = angle + FAN_BLADE_SWEEP;
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
            this.ctx.fillStyle = FAN_COLOR_RIM;
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
        this.ctx.strokeRect(level.exit.x - EXIT_HALF_WIDTH, level.exit.y - EXIT_HEIGHT, EXIT_HALF_WIDTH * 2, EXIT_HEIGHT);
        if (this.game.state === GameState.SUCCESS) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(level.exit.x - EXIT_HALF_WIDTH, level.exit.y - EXIT_HEIGHT, EXIT_HALF_WIDTH * 2, EXIT_HEIGHT);
        }
    }

    private drawPod(): void {
        if (!this.game.pod.isCollected) {
            const color = this.colors.podColor;
            this.ctx.shadowColor = color;
            this.ctx.fillStyle = color;
            this.ctx.fillRect(this.game.pod.x - POD_HALF_SIZE, this.game.pod.y - POD_HALF_SIZE, POD_HALF_SIZE * 2, POD_HALF_SIZE * 2);
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
            this.ctx.moveTo(0, SHIP_NOSE_Y);
            this.ctx.lineTo(SHIP_WING_X, SHIP_WING_Y);
            this.ctx.lineTo(-SHIP_WING_X, SHIP_WING_Y);
            this.ctx.closePath();
            this.ctx.fill();

            if (this.game.ship.cargo) {
                this.ctx.fillStyle = this.colors.shipCargoColor;
                this.ctx.fillRect(-SHIP_CARGO_HALF, -SHIP_CARGO_HALF, SHIP_CARGO_HALF * 2, SHIP_CARGO_HALF * 2);
            }

            if (this.game.ship.isThrusting && this.game.ship.fuel > 0) {
                this.ctx.shadowBlur = SHIP_THRUST_GLOW_BLUR;
                this.ctx.beginPath();
                this.ctx.moveTo(-SHIP_THRUST_TIP_X, SHIP_WING_Y);
                this.ctx.lineTo(0, SHIP_THRUST_TIP_Y);
                this.ctx.lineTo(SHIP_THRUST_TIP_X, SHIP_WING_Y);
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
            this.ctx.moveTo(0, -POD_HALF_SIZE / 2);
            this.ctx.lineTo(POD_HALF_SIZE / 2, POD_HALF_SIZE / 2);
            this.ctx.lineTo(-POD_HALF_SIZE / 2, POD_HALF_SIZE / 2);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.restore();
        });
    }

    private drawRadar(level: Level): void {
        if (!this.rctx || !this.radarCanvas) return;
        this.rctx.clearRect(0, 0, this.radarCanvas.width, this.radarCanvas.height);
        
        // Fill radar background with rock Fill
        this.rctx.fillStyle = this.colors.caveWallFill || RADAR_FALLBACK_BG;
        this.rctx.fillRect(0, 0, this.radarCanvas.width, this.radarCanvas.height);

        // Calculate dynamic scale to fit the entire level, with a margin
        const targetScale = Math.min(
            (this.radarCanvas.width * RADAR_MARGIN) / this.game.virtualWidth,
            (this.radarCanvas.height * RADAR_MARGIN) / this.game.virtualHeight
        );
        const offsetX = (this.radarCanvas.width - this.game.virtualWidth * targetScale) / 2;
        const offsetY = (this.radarCanvas.height - this.game.virtualHeight * targetScale) / 2;

        this.rctx.save();
        this.rctx.translate(offsetX, offsetY);
        this.rctx.scale(targetScale, targetScale);

        // Clip out the hallway for the sky
        this.rctx.save();
        this.rctx.beginPath();
        const polygons = getTerrainPolygons(level.terrain);
        for (const poly of polygons) {
            if (!poly.isSolid) {
                this.addPolygonPath(this.rctx, poly.points);
            }
        }
        this.rctx.clip();
        
        // Fill hallway with sky/void
        this.rctx.fillStyle = RADAR_VOID_COLOR;
        this.rctx.fillRect(0, 0, this.game.virtualWidth, this.game.virtualHeight);
        this.rctx.restore();

        // Outline the boundary and draw solid islands
        this.rctx.strokeStyle = this.colors.radarGridColor;
        this.rctx.lineWidth = 1 / targetScale; // visually maintain 1px
        
        for (const poly of polygons) {
            this.rctx.beginPath();
            this.addPolygonPath(this.rctx, poly.points);
            if (poly.isSolid) {
                this.rctx.fillStyle = this.colors.caveWallFill || RADAR_FALLBACK_BG;
                this.rctx.fill();
            }
            this.rctx.stroke();
        }

        // Ship
        const pulse = (Math.sin(Date.now() / RADAR_PULSE_PERIOD_MS) + 1) / 2;
        this.rctx.fillStyle = this.colors.radarShipColor;
        this.rctx.globalAlpha = 0.5 + pulse * 0.5;
        const blip = RADAR_BLIP_SIZE / targetScale;
        this.rctx.fillRect(this.game.ship.x - blip / 2, this.game.ship.y - blip / 2, blip, blip);
        this.rctx.globalAlpha = 1.0;

        // Pod
        if (!this.game.pod.isCollected) {
            this.rctx.fillStyle = this.colors.radarPodColor;
            this.rctx.fillRect(this.game.pod.x - blip / 2, this.game.pod.y - blip / 2, blip, blip);
        }

        // Exit
        const exitBlip = RADAR_EXIT_BLIP_SIZE / targetScale;
        this.rctx.strokeStyle = this.colors.radarExitColor;
        this.rctx.lineWidth = 1 / targetScale;
        this.rctx.strokeRect(level.exit.x - exitBlip / 2, level.exit.y - exitBlip / 2, exitBlip, exitBlip);

        this.rctx.restore();
    }
}

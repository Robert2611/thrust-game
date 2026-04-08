import { Ship } from '../models/Ship';
import { Pod } from '../models/Pod';
import { Platform } from '../types';

export class PhysicsEngine {
    public gravity: number = 0.1;
    public friction: number = 0.99;
    public thrustStrength: number = 0.25;
    public rotationSpeed: number = 0.08;

    constructor() {
        this.gravity = 0.1;
        this.friction = 0.99;
        this.thrustStrength = 0.25;
        this.rotationSpeed = 0.04;
    }

    update(ship: Ship, _pod: Pod, terrain: number[], platforms: Platform[]): void {
        // 0. Disable physics if exploded or on platform (until thrusting)
        if (ship.isExploded) return;

        if (ship.isOnPlatform) {
            ship.vx = 0;
            ship.vy = 0;
            return;
        }

        // 1. Handle Input (Thrust)
        if (ship.isThrusting && ship.fuel > 0) {
            ship.vx += Math.cos(ship.rotation - Math.PI / 2) * this.thrustStrength;
            ship.vy += Math.sin(ship.rotation - Math.PI / 2) * this.thrustStrength;
            ship.fuel -= 0.5; // Consume fuel
        }

        // 2. Apply Gravity
        ship.vy += this.gravity;

        // 3. Apply Velocity
        ship.x += ship.vx;
        ship.y += ship.vy;

        // 4. Apply Friction (Drift)
        ship.vx *= this.friction;
        ship.vy *= this.friction;

        // 5. Handle Collision with Platforms and Terrain
        const result = this.checkAllCollisions(ship, terrain, platforms);
        if (result === 'DEATH') {
            ship.isExploded = true;
            ship.vx = 0;
            ship.vy = 0;
        } else if (result === 'LANDED') {
            ship.isOnPlatform = true;
            ship.vx = 0;
            ship.vy = 0;
            ship.rotation = 0; // Snap to upright
        }
    }

    private checkAllCollisions(obj: Ship, terrain: number[], platforms: Platform[]): 'LANDED' | 'DEATH' | 'NONE' {
        // 1. Check Platforms (Safe zones)
        for (const p of platforms) {
            const shipBottomY = obj.y + 10;
            // Height check (near the platform surface)
            if (shipBottomY >= p.y - 5 && shipBottomY <= p.y + 5 &&
                obj.x >= p.x - p.width / 2 && obj.x <= p.x + p.width / 2) {

                // Safe landing check: upright, slow, AND moving downwards
                const angle = Math.atan2(Math.sin(obj.rotation), Math.cos(obj.rotation));
                const isUpright = Math.abs(angle) < 0.5; // More gentle: ~28 degrees allowed
                const isSlow = Math.abs(obj.vy) < 2.0 && Math.abs(obj.vx) < 2.0; // More gentle speed
                const isDescending = obj.vy >= 0;

                if (isDescending) {
                    if (isUpright && isSlow) {
                        obj.y = p.y - 10; // Snap to platform
                        return 'LANDED';
                    } else {
                        return 'DEATH'; // Crash landing
                    }
                }
            }
        }

        // 2. Terrain Collision (Fatal walls)
        for (let i = 0; i < terrain.length - 2; i += 2) {
            if (this.lineCircleIntersection(terrain[i], terrain[i + 1], terrain[i + 2], terrain[i + 3], obj.x, obj.y, 8)) {
                return 'DEATH';
            }
        }

        return 'NONE';
    }

    private lineCircleIntersection(x1: number, y1: number, x2: number, y2: number, cx: number, cy: number, radius: number): boolean {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const dot = (((cx - x1) * dx) + ((cy - y1) * dy)) / (len * len);

        const closestX = x1 + (dot * dx);
        const closestY = y1 + (dot * dy);

        // Check if the closest point is on the segment
        if (dot < 0 || dot > 1) return false;

        const dist = Math.sqrt((closestX - cx) ** 2 + (closestY - cy) ** 2);
        return dist < radius;
    }
}

import { Ship } from '../models/ship';
import { Pod } from '../models/pod';
import { Platform } from '../types';
import { CollisionDetector } from './collision-detector';

export class PhysicsEngine {
    public gravity: number = 0.1;
    public friction: number = 0.99;
    public thrustStrength: number = 0.25;
    public rotationSpeed: number = 0.08;
    private collisionDetector: CollisionDetector;

    constructor() {
        this.gravity = 0.1;
        this.friction = 0.99;
        this.thrustStrength = 0.25;
        this.rotationSpeed = 0.04;
        this.collisionDetector = new CollisionDetector();
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
        const result = this.collisionDetector.checkAllCollisions(ship, terrain, platforms);
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
}

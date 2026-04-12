import { Ship } from '../models/ship';
import { Pod } from '../models/pod';
import { Platform, Fan } from '../types';
import { CollisionDetector } from './collision-detector';
import {
    DEFAULT_GRAVITY, DEFAULT_FRICTION, DEFAULT_THRUST_STRENGTH,
    DEFAULT_ROTATION_SPEED, FUEL_BURN_RATE, FAN_LERP_STRENGTH
} from '../constants';

export class PhysicsEngine {
    public gravity: number = DEFAULT_GRAVITY;
    public friction: number = DEFAULT_FRICTION;
    public thrustStrength: number = DEFAULT_THRUST_STRENGTH;
    public rotationSpeed: number = DEFAULT_ROTATION_SPEED;
    private collisionDetector: CollisionDetector;

    constructor() {
        this.gravity = DEFAULT_GRAVITY;
        this.friction = DEFAULT_FRICTION;
        this.thrustStrength = DEFAULT_THRUST_STRENGTH;
        this.rotationSpeed = DEFAULT_ROTATION_SPEED;
        this.collisionDetector = new CollisionDetector();
    }

    update(ship: Ship, _pod: Pod, terrain: number[], platforms: Platform[], fans: Fan[] = []): void {
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
            ship.fuel -= FUEL_BURN_RATE;
        }

        // 1.5. Handle Fans pushes
        if (fans && fans.length > 0 && !ship.isExploded && !ship.isOnPlatform) {
            for (const f of fans) {
                const dx = ship.x - f.x;
                const dy = ship.y - f.y;
                const c = Math.cos(f.rotation);
                const s = Math.sin(f.rotation);
                
                const localX = dx * c + dy * s;
                const localY = -dx * s + dy * c;
                
                if (localX >= 0 && localX <= f.length && Math.abs(localY) <= f.width / 2) {
                    // Wind speed target: how fast the air is moving along the fan axis.
                    // The fan pushes the ship's velocity component towards this target (drag model).
                    // This self-regulates: slow ships feel a strong push, fast ships barely feel it.
                    const targetWindSpeed = f.speed;
                    const currentAlongFan = ship.vx * c + ship.vy * s;
                    const diff = targetWindSpeed - currentAlongFan;
                    const force = diff * FAN_LERP_STRENGTH;

                    ship.vx += c * force;
                    ship.vy += s * force;
                }
            }
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

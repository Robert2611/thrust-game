import { describe, it, expect, beforeEach } from 'vitest';
import { PhysicsEngine } from './physics-engine';
import { Ship } from '../models/ship';
import { Pod } from '../models/pod';

describe('PhysicsEngine', () => {
    let physics: PhysicsEngine;
    let ship: Ship;
    let pod: Pod;

    beforeEach(() => {
        physics = new PhysicsEngine();
        ship = new Ship();
        pod = new Pod();
        ship.reset(100, 100, 100);
        ship.isOnPlatform = false; // So it falls
    });

    it('should apply gravity when not on platform', () => {
        physics.update(ship, pod, [], []);
        expect(ship.vy).toBeGreaterThan(0);
        expect(ship.y).toBeGreaterThan(100);
    });

    it('should not move if on platform and not thrusting', () => {
        ship.isOnPlatform = true;
        physics.update(ship, pod, [], []);
        expect(ship.vy).toBe(0);
        expect(ship.y).toBe(100);
    });

    it('should apply thrust when thrusting', () => {
        ship.isThrusting = true;
        ship.rotation = 0; // pointing up
        physics.update(ship, pod, [], []);
        
        // At rotation=0, moving up is negative Y
        expect(ship.vy).toBeLessThan(0);
        expect(ship.fuel).toBe(99.5);
    });

    it('should accelerate ship if inside fan area', () => {
        ship.reset(100, 100, 100);
        ship.isOnPlatform = false;
        // dist dx = 50. localX = 50. length = 100.
        // factor = 1 - 50/100 = 0.5.
        // force = speed(20) * 0.1 * 0.5 = 1.0
        const fan = { x: 50, y: 100, width: 40, length: 100, rotation: 0, speed: 20 };
        physics.update(ship, pod, [], [], [fan]);
        
        expect(ship.x).toBe(101); // 1.0 vx applied
        expect(ship.vx).toBe(0.99); // 1.0 * friction
    });

    it('should not push ship if outside fan stream', () => {
        ship.reset(100, 50, 100); // outside width limits
        ship.isOnPlatform = false;
        const fan = { x: 50, y: 100, width: 40, length: 100, rotation: 0, speed: 2 };
        physics.update(ship, pod, [], [], [fan]);
        
        expect(ship.x).toBe(100); // untranslated
    });
});

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
});

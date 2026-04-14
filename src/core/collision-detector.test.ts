import { describe, it, expect, beforeEach } from 'vitest';
import { CollisionDetector } from './collision-detector';
import { Ship } from '../models/ship';
import { Platform } from '../types';

describe('CollisionDetector', () => {
    let detector: CollisionDetector;
    let ship: Ship;

    beforeEach(() => {
        detector = new CollisionDetector();
        ship = new Ship();
    });

    it('should detect line circle intersection', () => {
        // Line from (0,0) to (10,0)
        // Circle at (5, 5) with radius 6 should intersect
        expect(detector.lineCircleIntersection(0, 0, 10, 0, 5, 5, 6)).toBe(true);
        // Circle at (5, 5) with radius 4 should not intersect
        expect(detector.lineCircleIntersection(0, 0, 10, 0, 5, 5, 4)).toBe(false);
    });

    it('should return DEATH on fatal terrain collision', () => {
        ship.reset(5, 5, 100);
        const terrain = [{
            type: 'polygon' as const,
            points: [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 10 }
            ]
        }];
        const result = detector.checkAllCollisions(ship, terrain, []);
        expect(result).toBe('DEATH');
    });

    it('should return LANDED when landing safely on platform', () => {
        ship.reset(50, 95, 100); // slightly above platform at y=100
        ship.rotation = 0; // Upright
        ship.vy = 1; // Slow descent
        const platforms: Platform[] = [{ x: 50, y: 100, width: 40 }];
        
        const result = detector.checkAllCollisions(ship, [], platforms);
        expect(result).toBe('LANDED');
    });
});

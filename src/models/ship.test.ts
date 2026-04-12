import { describe, it, expect, beforeEach } from 'vitest';
import { Ship } from './ship';

describe('Ship', () => {
    let ship: Ship;

    beforeEach(() => {
        ship = new Ship();
    });

    it('should initialize with default values', () => {
        expect(ship.x).toBe(0);
        expect(ship.y).toBe(0);
        expect(ship.fuel).toBe(0);
        expect(ship.isExploded).toBe(false);
    });

    it('should reset properly', () => {
        ship.isExploded = true;
        ship.reset(100, 200, 500);
        
        expect(ship.x).toBe(100);
        expect(ship.y).toBe(200);
        expect(ship.fuel).toBe(500);
        expect(ship.isExploded).toBe(false);
        expect(ship.vx).toBe(0);
        expect(ship.vy).toBe(0);
    });
});

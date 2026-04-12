import { describe, it, expect } from 'vitest';
import { levels } from './levels';

describe('Levels Sanity Checks', () => {
    it('should have at least one level defined', () => {
        expect(levels.length).toBeGreaterThan(0);
    });

    it('should have valid properties on all levels', () => {
        levels.forEach((level) => {
            // Basic constants
            expect(level.name.length).toBeGreaterThan(0);
            expect(level.gravity).toBeGreaterThan(0);
            expect(level.fuel).toBeGreaterThan(0);

            // Starting locs
            expect(level.shipStart).toBeDefined();
            expect(level.shipStart.x).toBeDefined();
            expect(level.shipStart.y).toBeDefined();

            expect(level.podStart).toBeDefined();
            expect(level.podStart.type).toBeDefined();

            // Exit
            expect(level.exit).toBeDefined();
            expect(level.exit.radius).toBeGreaterThan(0);

            // Terrain points must be xy pairs (even length) and non empty
            expect(level.terrain.length).toBeGreaterThan(0);
            expect(level.terrain.length % 2).toBe(0);

            // Platforms
            expect(level.platforms.length).toBeGreaterThanOrEqual(1);
            level.platforms.forEach(p => {
                expect(p.width).toBeGreaterThan(0);
                expect(p.x).toBeDefined();
                expect(p.y).toBeDefined();
            });
        });
    });
});

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

            // Terrain objects
            expect(level.terrain.length).toBeGreaterThan(0);
            level.terrain.forEach(obj => {
                expect(['polygon', 'rect']).toContain(obj.type);
                if (obj.type === 'polygon') {
                    expect(obj.points.length).toBeGreaterThanOrEqual(2);
                } else if (obj.type === 'rect') {
                    expect(obj.width).toBeGreaterThan(0);
                    expect(obj.height).toBeGreaterThan(0);
                }
            });

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

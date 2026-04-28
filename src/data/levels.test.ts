import { describe, it, expect } from 'vitest';
import { levels } from './levels';
import { PlatformType } from '../constants';

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

            expect(level.cargoType).toBeDefined();

            // Terrain objects
            expect(level.terrain.length).toBeGreaterThan(0);
            level.terrain.forEach(obj => {
                expect(obj.type).toBe('polygon');
                expect(obj.points.length).toBeGreaterThanOrEqual(2);
            });

            // Platforms
            expect(level.platforms.length).toBeGreaterThanOrEqual(1);
            level.platforms.forEach(p => {
                expect(p.width).toBeGreaterThan(0);
                expect(p.x).toBeDefined();
                expect(p.y).toBeDefined();
                expect(p.type).toBeDefined();
            });
            expect(level.platforms.some((p) => p.type === PlatformType.START)).toBe(true);
            expect(level.platforms.some((p) => p.type === PlatformType.CARGO)).toBe(true);
            expect(level.platforms.some((p) => p.type === PlatformType.DROP)).toBe(true);
        });
    });
});

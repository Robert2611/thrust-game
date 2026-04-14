import { describe, it, expect } from 'vitest';
import { getTerrainPolygons, getTerrainSegments } from './terrain-utils';
import { TerrainObject } from '../types';

describe('Terrain Utilities', () => {
    it('should convert polygons to normalized format', () => {
        const terrain: TerrainObject[] = [
            {
                type: 'polygon',
                points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }]
            }
        ];
        const polys = getTerrainPolygons(terrain);
        expect(polys).toHaveLength(1);
        expect(polys[0].points).toHaveLength(3);
        expect(polys[0].isSolid).toBe(false);
    });

    it('should convert rectangles to polygons', () => {
        const terrain: TerrainObject[] = [
            {
                type: 'rect',
                x: 10,
                y: 10,
                width: 100,
                height: 50,
                isSolid: true
            }
        ];
        const polys = getTerrainPolygons(terrain);
        expect(polys).toHaveLength(1);
        expect(polys[0].points).toHaveLength(4);
        expect(polys[0].points[0]).toEqual({ x: 10, y: 10 });
        expect(polys[0].points[2]).toEqual({ x: 110, y: 60 });
        expect(polys[0].isSolid).toBe(true);
    });

    it('should generate segments including the closing one', () => {
        const terrain: TerrainObject[] = [
            {
                type: 'polygon',
                points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }]
            }
        ];
        const segments = getTerrainSegments(terrain);
        // 3 points = 3 segments = 12 numbers (x1, y1, x2, y2 per segment)
        expect(segments).toHaveLength(12);
        // Check the closing segment (last to first)
        expect(segments[8]).toBe(10); // p2.x (10,10)
        expect(segments[9]).toBe(10); // p2.y
        expect(segments[10]).toBe(0); // p1.x (0,0)
        expect(segments[11]).toBe(0); // p1.y
    });
});

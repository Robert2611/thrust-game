import { Point, TerrainObject } from '../types';

/**
 * Normalizes various terrain objects into a standard polyline format (Point[])
 */
export function getTerrainPolygons(terrain: TerrainObject[]): { points: Point[], isSolid: boolean }[] {
    return terrain.map(obj => {
        if (obj.type === 'polygon') {
            return { points: obj.points, isSolid: !!obj.isSolid };
        } else {
            // Rect to polygon
            const points: Point[] = [
                { x: obj.x, y: obj.y },
                { x: obj.x + obj.width, y: obj.y },
                { x: obj.x + obj.width, y: obj.y + obj.height },
                { x: obj.x, y: obj.y + obj.height }
            ];
            return { points, isSolid: !!obj.isSolid };
        }
    });
}

/**
 * Flattens terrain polygons into segments for collision detection.
 * Includes the closing segment for each polygon.
 */
export function getTerrainSegments(terrain: TerrainObject[]): number[] {
    const polygons = getTerrainPolygons(terrain);
    const segments: number[] = [];

    for (const poly of polygons) {
        const points = poly.points;
        if (points.length < 2) continue;

        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            
            segments.push(p1.x, p1.y, p2.x, p2.y);
        }
    }

    return segments;
}

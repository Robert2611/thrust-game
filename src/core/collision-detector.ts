import { Ship } from '../models/ship';
import { Platform, TerrainObject } from '../types';
import { getTerrainPolygons } from './terrain-utils';
import {
    SHIP_HALF_HEIGHT, SHIP_COLLISION_RADIUS,
    PLATFORM_SNAP_TOLERANCE, LANDING_MAX_SPEED, LANDING_MAX_ANGLE
} from '../constants';

export class CollisionDetector {
    public checkAllCollisions(obj: Ship, terrain: TerrainObject[], platforms: Platform[]): 'LANDED' | 'DEATH' | 'NONE' {
        // 1. Check Platforms (Safe zones)
        for (const p of platforms) {
            const shipBottomY = obj.y + SHIP_HALF_HEIGHT;
            // Height check (near the platform surface)
            if (shipBottomY >= p.y - PLATFORM_SNAP_TOLERANCE && shipBottomY <= p.y + PLATFORM_SNAP_TOLERANCE &&
                obj.x >= p.x - p.width / 2 && obj.x <= p.x + p.width / 2) {

                // Safe landing check: upright, slow, AND moving downwards
                const angle = Math.atan2(Math.sin(obj.rotation), Math.cos(obj.rotation));
                const isUpright = Math.abs(angle) < LANDING_MAX_ANGLE;
                const isSlow = Math.abs(obj.vy) < LANDING_MAX_SPEED && Math.abs(obj.vx) < LANDING_MAX_SPEED;
                const isDescending = obj.vy >= 0;

                if (isDescending) {
                    if (isUpright && isSlow) {
                        obj.y = p.y - SHIP_HALF_HEIGHT; // Snap to platform
                        return 'LANDED';
                    } else {
                        return 'DEATH'; // Crash landing
                    }
                }
            }
        }

        // 2. Terrain Collision (Fatal walls)
        const polygons = getTerrainPolygons(terrain);
        for (const poly of polygons) {
            const points = poly.points;
            if (points.length < 2) continue;

            for (let i = 0; i < points.length; i++) {
                const p1 = points[i];
                const p2 = points[(i + 1) % points.length]; // wraps around to close the loop
                
                if (this.lineCircleIntersection(p1.x, p1.y, p2.x, p2.y, obj.x, obj.y, SHIP_COLLISION_RADIUS)) {
                    return 'DEATH';
                }
            }
        }

        return 'NONE';
    }

    public lineCircleIntersection(x1: number, y1: number, x2: number, y2: number, cx: number, cy: number, radius: number): boolean {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return false;
        
        const dot = (((cx - x1) * dx) + ((cy - y1) * dy)) / (len * len);

        const closestX = x1 + (dot * dx);
        const closestY = y1 + (dot * dy);

        // Check if the closest point is on the segment
        if (dot < 0 || dot > 1) return false;

        const dist = Math.sqrt((closestX - cx) ** 2 + (closestY - cy) ** 2);
        return dist < radius;
    }
}

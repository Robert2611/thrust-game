import { Ship } from '../models/ship';
import { Platform } from '../types';

export class CollisionDetector {
    public checkAllCollisions(obj: Ship, terrain: number[], platforms: Platform[]): 'LANDED' | 'DEATH' | 'NONE' {
        // 1. Check Platforms (Safe zones)
        for (const p of platforms) {
            const shipBottomY = obj.y + 10;
            // Height check (near the platform surface)
            if (shipBottomY >= p.y - 5 && shipBottomY <= p.y + 5 &&
                obj.x >= p.x - p.width / 2 && obj.x <= p.x + p.width / 2) {

                // Safe landing check: upright, slow, AND moving downwards
                const angle = Math.atan2(Math.sin(obj.rotation), Math.cos(obj.rotation));
                const isUpright = Math.abs(angle) < 0.5; // More gentle: ~28 degrees allowed
                const isSlow = Math.abs(obj.vy) < 2.0 && Math.abs(obj.vx) < 2.0; // More gentle speed
                const isDescending = obj.vy >= 0;

                if (isDescending) {
                    if (isUpright && isSlow) {
                        obj.y = p.y - 10; // Snap to platform
                        return 'LANDED';
                    } else {
                        return 'DEATH'; // Crash landing
                    }
                }
            }
        }

        // 2. Terrain Collision (Fatal walls)
        for (let i = 0; i < terrain.length - 2; i += 2) {
            if (this.lineCircleIntersection(terrain[i], terrain[i + 1], terrain[i + 2], terrain[i + 3], obj.x, obj.y, 8)) {
                return 'DEATH';
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

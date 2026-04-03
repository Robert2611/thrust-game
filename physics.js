class PhysicsEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gravity = 0.1;
        this.friction = 0.99;
        this.thrustStrength = 0.25;
        this.rotationSpeed = 0.08;
        this.isExploded = false;
    }

    update(ship, pod, terrain) {
        // 1. Handle Input (Thrust and Rotation)
        if (ship.isThrusting && ship.fuel > 0) {
            ship.vx += Math.cos(ship.rotation - Math.PI / 2) * this.thrustStrength;
            ship.vy += Math.sin(ship.rotation - Math.PI / 2) * this.thrustStrength;
            ship.fuel -= 0.5; // Consume fuel
        }

        // 2. Apply Gravity
        ship.vy += this.gravity;

        // 3. Apply Velocity
        ship.x += ship.vx;
        ship.y += ship.vy;

        // 4. Apply Friction (Drift)
        ship.vx *= this.friction;
        ship.vy *= this.friction;

        // 5. Rotation is handled by input events directly in the ship object

        // 6. Handle Collision with Terrain
        const collision = this.checkCollisions(ship, terrain);
        if (collision) {
            ship.isExploded = true;
            ship.vx = 0;
            ship.vy = 0;
        }

        // 7. Handle Pod and Tether (Optional Feature)
        if (pod && pod.isAttached) {
            this.handleTether(ship, pod);
        }
    }

    checkCollisions(obj, terrain) {
        // 1. Boundary check
        if (obj.y > this.canvas.height || obj.y < 0 || obj.x < 0 || obj.x > this.canvas.width) {
            return true;
        }

        // 2. Terrain Collision (Point in Polygon)
        // We iterate through segments of the terrain and check for proximity
        for (let i = 0; i < terrain.length - 2; i += 2) {
            const x1 = terrain[i];
            const y1 = terrain[i + 1];
            const x2 = terrain[i + 2];
            const y2 = terrain[i + 3];

            if (this.lineCircleIntersection(x1, y1, x2, y2, obj.x, obj.y, 8)) {
                return true;
            }
        }
        return false;
    }

    lineCircleIntersection(x1, y1, x2, y2, cx, cy, radius) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const dot = (((cx - x1) * dx) + ((cy - y1) * dy)) / (len * len);

        const closestX = x1 + (dot * dx);
        const closestY = y1 + (dot * dy);

        // Check if the closest point is on the segment
        if (dot < 0 || dot > 1) return false;

        const dist = Math.sqrt((closestX - cx) ** 2 + (closestY - cy) ** 2);
        return dist < radius;
    }

    handleTether(ship, pod) {
        // Distance between ship and pod
        const dx = ship.x - pod.x;
        const dy = ship.y - pod.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const tetherLength = 50;
        const stiffness = 0.05;

        // Simple spring constraint
        if (dist > tetherLength) {
            const forceX = (dx / dist) * (dist - tetherLength) * stiffness;
            const forceY = (dy / dist) * (dist - tetherLength) * stiffness;

            ship.vx -= forceX;
            ship.vy -= forceY;
            pod.vx += forceX;
            pod.vy += forceY;
        }

        // Pod physics
        pod.vy += this.gravity;
        pod.x += pod.vx;
        pod.y += pod.vy;
        pod.vx *= this.friction;
        pod.vy *= this.friction;
    }
}
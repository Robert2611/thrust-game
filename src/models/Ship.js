export class Ship {
    constructor() {
        this.reset(0, 0, 0);
    }

    reset(x, y, fuel) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.rotation = 0;
        this.fuel = fuel;
        this.isThrusting = false;
        this.isRotatingLeft = false;
        this.isRotatingRight = false;
        this.isExploded = false;
        this.isOnPlatform = true;
        this.explosionTriggered = false;
        this.cargo = null;
    }
}

export class Pod {
    constructor() {
        this.reset(0, 0, null);
    }

    reset(x, y, type) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.isAttached = false;
        this.isCollected = false;
        this.type = type;
    }
}

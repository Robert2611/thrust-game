import { CargoType } from '../constants';

export class Pod {
    public x: number = 0;
    public y: number = 0;
    public vx: number = 0;
    public vy: number = 0;
    public isAttached: boolean = false;
    public isCollected: boolean = false;
    public type: CargoType | null = null;

    constructor() {
        this.reset(0, 0, null);
    }

    reset(x: number, y: number, type: CargoType | null): void {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.isAttached = false;
        this.isCollected = false;
        this.type = type;
    }
}

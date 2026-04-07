import { CargoType } from '../constants';

export class Ship {
    public x: number = 0;
    public y: number = 0;
    public vx: number = 0;
    public vy: number = 0;
    public rotation: number = 0;
    public fuel: number = 0;
    public isThrusting: boolean = false;
    public isRotatingLeft: boolean = false;
    public isRotatingRight: boolean = false;
    public isExploded: boolean = false;
    public isOnPlatform: boolean = true;
    public explosionTriggered: boolean = false;
    public cargo: CargoType | null = null;

    constructor() {
        this.reset(0, 0, 0);
    }

    reset(x: number, y: number, fuel: number): void {
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

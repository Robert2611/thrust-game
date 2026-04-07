import { CargoType, GameState } from './constants';

export interface Point {
    x: number;
    y: number;
}

export interface Platform extends Point {
    width: number;
}

export interface Level {
    name: string;
    gravity: number;
    fuel: number;
    shipStart: Point;
    podStart: Point & { type: CargoType };
    exit: Point & { radius: number };
    platforms: Platform[];
    terrain: number[];
}

export interface Particle extends Point {
    vx: number;
    vy: number;
    rotation: number;
    rv: number;
    life: number;
}

export type StateChangeCallback = (state: GameState) => void;
export type HUDUpdateCallback = () => void;
export type ExplosionCallback = () => void;

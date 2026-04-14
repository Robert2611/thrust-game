import { CargoType, GameState } from './constants';

export interface Point {
    x: number;
    y: number;
}

export interface Platform extends Point {
    width: number;
}

export interface Fan extends Point {
    width: number;
    length: number;
    rotation: number;
    speed: number;
}

export type TerrainObject =
    | { type: 'polygon'; points: Point[]; isSolid?: boolean }
    | { type: 'rect'; x: number; y: number; width: number; height: number; isSolid?: boolean };

export interface Level {
    name: string;
    gravity: number;
    fuel: number;
    shipStart: Point;
    podStart: Point & { type: CargoType };
    exit: Point & { radius: number };
    platforms: Platform[];
    fans?: Fan[];
    terrain: TerrainObject[];
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

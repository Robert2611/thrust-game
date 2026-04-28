import { CargoType, GameState, PlatformType } from './constants';

export interface Point {
    x: number;
    y: number;
}

export interface Platform extends Point {
    width: number;
    type: PlatformType;
}

export interface Fan extends Point {
    width: number;
    length: number;
    rotation: number;
    speed: number;
}

export type TerrainObject = { type: 'polygon'; points: Point[]; isSolid?: boolean };

export interface Level {
    name: string;
    gravity: number;
    fuel: number;
    cargoType: CargoType;
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

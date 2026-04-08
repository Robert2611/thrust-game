import { CargoType } from '../constants';
import { Level } from '../types';

export const levels: Level[] = [
    {
        name: "VALLEY OF NEON",
        gravity: 0.12,
        fuel: 250,
        shipStart: { x: 100, y: 590 },
        podStart: { x: 800, y: 690, type: CargoType.NEON_CORE },
        exit: { x: 100, y: 100, radius: 40 },
        platforms: [
            { x: 100, y: 600, width: 80 }, // Start platform
            { x: 800, y: 700, width: 80 }, // Cargo platform
            { x: 100, y: 100, width: 80 }  // Exit platform
        ],
        terrain: [
            0, 600, 200, 600, 300, 400, 500, 400, 600, 700, 900, 700, 1000, 500,
            1000, 20, 800, 50, 400, 100, 0, 20, 0, 600
        ]
    },
    {
        name: "THE GAUNTLET",
        gravity: 0.14,
        fuel: 250,
        shipStart: { x: 100, y: 340 },
        podStart: { x: 900, y: 740, type: CargoType.QUANTUM_FUEL },
        exit: { x: 100, y: 350, radius: 40 },
        platforms: [
            { x: 100, y: 350, width: 80 },
            { x: 900, y: 750, width: 80 }
        ],
        terrain: [
            0, 0, 1000, 0, 1000, 800, 0, 800,
            0, 520, 750, 520, 750, 480, 0, 480,
            0, 220, 750, 220, 750, 180, 0, 180, 0, 0
        ]
    }
];

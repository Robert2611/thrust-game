import { CargoType } from '../constants';
import { Level } from '../types';

export const levels: Level[] = [
    {
        name: "VALLEY OF NEON",
        gravity: 0.12,
        fuel: 300,
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
        fuel: 300,
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
    },
    {
        name: "DEEP DELVE",
        gravity: 0.16,
        fuel: 2000,
        shipStart: { x: 100, y: 190 },
        podStart: { x: 500, y: 940, type: CargoType.NEON_CORE },
        exit: { x: 900, y: 190, radius: 40 },
        platforms: [
            { x: 100, y: 200, width: 80 },
            { x: 500, y: 950, width: 80 },
            { x: 900, y: 200, width: 80 }
        ],
        terrain: [
            0, 200, 200, 200, 400, 950, 600, 950, 800, 200, 1000, 200,
            1000, 50, 750, 50, 550, 750, 450, 750, 250, 50, 0, 50,
            0, 200
        ]
    },
    {
        name: "THE CRUSHER",
        gravity: 0.18,
        fuel: 1400,
        shipStart: { x: 100, y: 140 },
        podStart: { x: 1400, y: 140, type: CargoType.QUANTUM_FUEL },
        exit: { x: 100, y: 140, radius: 40 },
        platforms: [
            { x: 100, y: 150, width: 80 },
            { x: 1400, y: 150, width: 80 }
        ],
        terrain: [
            0, 150, 200, 150, 300, 250, 400, 150, 600, 250, 800, 100,
            1000, 250, 1200, 150, 1500, 150,
            1500, 40, 1200, 40, 1000, 140, 800, -10, 600, 140, 400, 40,
            300, 140, 200, 40, 0, 40,
            0, 150
        ]
    }
];

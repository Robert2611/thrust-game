import { CargoType, DEFAULT_GRAVITY } from '../constants';
import { Level } from '../types';

export const levels: Level[] = [
    {
        name: "VALLEY OF NEON",
        gravity: DEFAULT_GRAVITY,
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
            {
                type: 'polygon',
                points: [
                    { x: 0, y: 600 }, { x: 200, y: 600 }, { x: 300, y: 400 },
                    { x: 500, y: 400 }, { x: 600, y: 700 }, { x: 900, y: 700 },
                    { x: 1000, y: 500 }, { x: 1000, y: 20 }, { x: 800, y: 50 },
                    { x: 400, y: 100 }, { x: 0, y: 20 }
                ]
            }
        ]
    },
    {
        name: "THE GAUNTLET",
        gravity: DEFAULT_GRAVITY,
        fuel: 300,
        shipStart: { x: 100, y: 340 },
        podStart: { x: 900, y: 740, type: CargoType.QUANTUM_FUEL },
        exit: { x: 100, y: 350, radius: 40 },
        platforms: [
            { x: 100, y: 350, width: 80 },
            { x: 900, y: 750, width: 80 }
        ],
        terrain: [
            // The main cavern
            { type: 'rect', x: 0, y: 0, width: 1000, height: 800 },
            // Two solid shelves that constrict the passage
            { type: 'rect', x: 0, y: 480, width: 750, height: 40, isSolid: true },
            { type: 'rect', x: 0, y: 180, width: 750, height: 40, isSolid: true }
        ]
    },
    {
        name: "DEEP DELVE",
        gravity: DEFAULT_GRAVITY,
        fuel: 500,
        shipStart: { x: 100, y: 190 },
        podStart: { x: 500, y: 940, type: CargoType.NEON_CORE },
        exit: { x: 900, y: 190, radius: 40 },
        platforms: [
            { x: 100, y: 200, width: 80 },
            { x: 500, y: 950, width: 80 },
            { x: 900, y: 200, width: 80 }
        ],
        terrain: [
            {
                type: 'polygon',
                points: [
                    { x: 0, y: 200 }, { x: 200, y: 200 }, { x: 400, y: 950 },
                    { x: 600, y: 950 }, { x: 800, y: 200 }, { x: 1000, y: 200 },
                    { x: 1000, y: 50 }, { x: 750, y: 50 }, { x: 550, y: 750 },
                    { x: 450, y: 750 }, { x: 250, y: 50 }, { x: 0, y: 50 }
                ]
            }
        ]
    },
    {
        name: "THE CRUSHER",
        gravity: DEFAULT_GRAVITY,
        fuel: 500,
        shipStart: { x: 100, y: 180 },
        podStart: { x: 1400, y: 180, type: CargoType.QUANTUM_FUEL },
        exit: { x: 100, y: 180, radius: 40 },
        platforms: [
            { x: 100, y: 190, width: 80 },
            { x: 1400, y: 190, width: 80 }
        ],
        terrain: [
            {
                type: 'polygon',
                points: [
                    { x: 0, y: 190 }, { x: 200, y: 190 }, { x: 300, y: 290 },
                    { x: 400, y: 190 }, { x: 600, y: 290 }, { x: 800, y: 140 },
                    { x: 1000, y: 290 }, { x: 1200, y: 190 }, { x: 1500, y: 190 },
                    { x: 1500, y: 0 }, { x: 1200, y: 0 }, { x: 1000, y: 100 },
                    { x: 800, y: -50 }, { x: 600, y: 100 }, { x: 400, y: 0 },
                    { x: 300, y: 100 }, { x: 200, y: 0 }, { x: 0, y: 0 }
                ]
            }
        ]
    },
    {
        name: "WIND TUNNEL",
        gravity: DEFAULT_GRAVITY,
        fuel: 500,
        shipStart: { x: 100, y: 590 },
        podStart: { x: 800, y: 690, type: CargoType.NEON_CORE },
        exit: { x: 100, y: 100, radius: 40 },
        platforms: [
            { x: 100, y: 600, width: 80 },
            { x: 800, y: 700, width: 80 },
            { x: 100, y: 100, width: 80 }
        ],
        fans: [
            { x: 550, y: 700, width: 50, length: 400, rotation: -Math.PI / 2, speed: 7 }
        ],
        terrain: [
            {
                type: 'polygon',
                points: [
                    { x: 0, y: 600 }, { x: 200, y: 600 }, { x: 300, y: 700 },
                    { x: 500, y: 700 }, { x: 600, y: 700 }, { x: 900, y: 700 },
                    { x: 1000, y: 500 }, { x: 400, y: 500 }, { x: 400, y: 100 },
                    { x: 250, y: 100 }, { x: 0, y: 20 }
                ]
            }
        ]
    },
    {
        name: "CROSSWINDS",
        gravity: DEFAULT_GRAVITY,
        fuel: 600,
        shipStart: { x: 100, y: 740 },
        podStart: { x: 900, y: 240, type: CargoType.QUANTUM_FUEL },
        exit: { x: 100, y: 250, radius: 40 },
        platforms: [
            { x: 100, y: 750, width: 80 },  // Start platform — bottom left
            { x: 900, y: 250, width: 80 },  // Pod platform  — upper right
            { x: 100, y: 250, width: 80 },  // Exit platform — upper left
        ],
        fans: [
            // Rightward fan in the lower part
            { x: 500, y: 500, width: 50, length: 450, rotation: -Math.PI, speed: 3 },
            // Rightward fan across the upper room
            { x: 100, y: 150, width: 50, length: 700, rotation: 0, speed: 3 },
        ],
        terrain: [
            {
                type: 'polygon',
                points: [
                    { x: 0, y: 750 }, { x: 550, y: 750 }, { x: 550, y: 400 },
                    { x: 340, y: 400 }, { x: 340, y: 250 }, { x: 1000, y: 250 },
                    { x: 1000, y: 50 }, { x: 0, y: 50 }, { x: 0, y: 250 },
                    { x: 260, y: 250 }, { x: 260, y: 400 }, { x: 0, y: 400 }
                ]
            }
        ]
    }
];

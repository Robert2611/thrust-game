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
            0, 600, 200, 600, 300, 400, 500, 400, 600, 700, 900, 700, 1000, 500,
            1000, 20, 800, 50, 400, 100, 0, 20, 0, 600
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
            0, 0, 1000, 0, 1000, 800, 0, 800,
            0, 520, 750, 520, 750, 480, 0, 480,
            0, 220, 750, 220, 750, 180, 0, 180, 0, 0
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
            0, 200, 200, 200, 400, 950, 600, 950, 800, 200, 1000, 200,
            1000, 50, 750, 50, 550, 750, 450, 750, 250, 50, 0, 50,
            0, 200
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
            0, 190, 200, 190, 300, 290, 400, 190, 600, 290, 800, 140,
            1000, 290, 1200, 190, 1500, 190,
            1500, 0, 1200, 0, 1000, 100, 800, -50, 600, 100, 400, 0,
            300, 100, 200, 0, 0, 0,
            0, 190
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
            0, 600, 200, 600, 300, 700, 500, 700, 600, 700, 900, 700, 1000, 500,
            400, 500, 400, 100, 250, 100, 0, 20, 0, 600
        ]
    },
    {
        // H-shaped cave: lower room connected to upper room via a narrow shaft.
        // Fan 1 (upward) lifts you through the shaft.
        // Fan 2 (rightward) pushes you across the upper room to reach the pod.
        // Return trip fights both fans.
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
        // H-shape: shaft is 80px wide (x=260–340) to match Fan 1
        terrain: [
            0, 750, 550, 750, 550, 400, 340, 400,
            340, 250, 1000, 250, 1000, 50, 0, 50,
            0, 250, 260, 250, 260, 400, 0, 400,
            0, 750
        ]
    }
];

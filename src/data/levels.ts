import { CargoType, DEFAULT_GRAVITY } from '../constants';
import { Level } from '../types';

export const levels: Level[] = [
    {
        name: "VALLEY OF NEON",
        gravity: 0.1,
        fuel: 300,
        shipStart: { "x": 100, "y": 590 },
        podStart: { x: 660, y: 580, type: CargoType.NEON_CORE },
        exit: { "x": 390, "y": 470, "radius": 40 },
        platforms: [
            {
                x: 100,
                y: 600,
                width: 80
            },
            {
                x: 660,
                y: 590,
                width: 80
            },
            {
                x: 390,
                y: 470,
                width: 80
            }
        ],
        fans: [],
        terrain: [
            {
                type: 'polygon',
                points: [
                    { x: 0, y: 600 }, { x: 200, y: 600 }, { x: 320, y: 470 }, { x: 470, y: 470 }, { x: 590, y: 590 }, { x: 740, y: 590 }, { x: 750, y: 320 }, { x: 560, y: 190 }, { x: 190, y: 190 }, { x: 0, y: 320 }
                ]
            }
        ]
    }, {
        name: "THE GAUNTLET",
        gravity: 0.1,
        fuel: 300,
        shipStart: { x: 100, y: 340 },
        podStart: { x: 600, y: 340, type: CargoType.QUANTUM_FUEL },
        exit: { x: 100, y: 350, radius: 40 },
        platforms: [
            {
                x: 100,
                y: 350,
                width: 80
            },
            {
                x: 600,
                y: 350,
                width: 80
            }
        ],
        fans: [],
        terrain: [
            {
                type: 'polygon',
                points: [
                    { x: -30, y: 0 }, { x: 240, y: 0 }, { x: 290, y: 20 }, { x: 330, y: 30 }, { x: 380, y: 30 }, { x: 420, y: 20 }, { x: 450, y: 0 }, { x: 730, y: 0 }, { x: 730, y: 350 }, { x: 370, y: 350 }, { x: 350, y: 340 }, { x: 310, y: 330 }, { x: 270, y: 340 }, { x: 230, y: 350 }, { x: -30, y: 350 }
                ]
            },
            {
                type: 'polygon',
                points: [
                    { x: 260, y: 150 }, { x: 300, y: 140 }, { x: 340, y: 140 }, { x: 360, y: 150 }, { x: 380, y: 170 }, { x: 390, y: 200 }, { x: 380, y: 240 }, { x: 360, y: 270 }, { x: 340, y: 280 }, { x: 300, y: 280 }, { x: 280, y: 270 }, { x: 250, y: 250 }, { x: 240, y: 230 }, { x: 240, y: 190 }
                ],
                isSolid: true
            }
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
        shipStart: { "x": 100, "y": 740 },
        podStart: { "x": 540, "y": 240, "type": CargoType.QUANTUM_FUEL },
        exit: { "x": 100, "y": 250, "radius": 40 },
        platforms: [
            {
                x: 100,
                y: 750,
                width: 80
            },
            {
                x: 510,
                y: 250,
                width: 80
            },
            {
                x: 100,
                y: 250,
                width: 80
            }
        ],
        fans: [
            {
                x: 0,
                y: 480,
                width: 50,
                length: 450,
                rotation: 0,
                speed: 3
            },
            {
                x: 170,
                y: 270,
                width: 50,
                length: 400,
                rotation: 5.689773361501514,
                speed: 3
            }
        ],
        terrain: [
            {
                type: 'polygon',
                points: [
                    { x: 0, y: 750 }, { x: 440, y: 750 }, { x: 440, y: 400 }, { x: 340, y: 400 }, { x: 340, y: 250 }, { x: 600, y: 250 }, { x: 600, y: 50 }, { x: 370, y: 50 }, { x: 0, y: 50 }, { x: 0, y: 250 }, { x: 260, y: 250 }, { x: 260, y: 400 }, { x: 0, y: 400 }
                ]
            }
        ]
    }
];

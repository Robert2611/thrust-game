export const levels = [
    {
        name: "VALLEY OF NEON",
        gravity: 0.12,
        fuel: 1200,
        shipStart: { x: 100, y: 590 },
        podStart: { x: 800, y: 690, type: "NEON CORE" },
        exit: { x: 100, y: 100, radius: 40 },
        platforms: [
            { x: 100, y: 600, width: 80 }, // Start platform
            { x: 800, y: 700, width: 80 }, // Cargo platform
            { x: 100, y: 100, width: 80 }  // Exit platform
        ],
        terrain: [
            0, 600, 200, 600, 300, 400, 500, 400, 600, 700, 900, 700, 1000, 500, 1000, 0, 0, 0, 0, 600
        ]
    },
    {
        name: "THE GAUNTLET",
        gravity: 0.14,
        fuel: 1500,
        shipStart: { x: 100, y: 340 },
        podStart: { x: 900, y: 740, type: "QUANTUM FUEL" },
        exit: { x: 100, y: 350, radius: 40 },
        platforms: [
            { x: 100, y: 350, width: 80 },
            { x: 900, y: 750, width: 80 }
        ],
        terrain: [
            0, 0, 1000, 0, 1000, 800, 0, 800, 
            0, 500, 750, 500, 0, 500, // Bottom slat (double back)
            0, 200, 750, 200, 0, 200, // Top slat (double back)
            0, 0 // Home
        ]
    }
];

export const difficultySettings = {
    easy: { gravityMult: 0.6, fuelMult: 0.6, thrustMult: 1.3 },
    normal: { gravityMult: 1.0, fuelMult: 1.0, thrustMult: 1.0 },
    hard: { gravityMult: 1.4, fuelMult: 1.8, thrustMult: 0.8 }
};

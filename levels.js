const levels = [
    {
        name: "VALLEY OF NEON",
        gravity: 0.12,
        fuel: 1200,
        shipStart: { x: 100, y: 590 },
        podStart: { x: 800, y: 690, type: "NEON CORE" }, // On a different platform if added
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
        gravity: 0.18,
        fuel: 1000,
        shipStart: { x: 50, y: 290 },
        podStart: { x: 900, y: 790, type: "QUANTUM FUEL" },
        exit: { x: 50, y: 300, radius: 40 },
        platforms: [
            { x: 50, y: 300, width: 60 },
            { x: 900, y: 800, width: 60 }
        ],
        terrain: [
            0, 0, 1000, 0, 1000, 800, 0, 800, 0, 450, 800, 450, 800, 250, 0, 250, 0, 0
        ]
    }
];

const difficultySettings = {
    easy: { gravityMult: 0.6, fuelMult: 0.6, thrustMult: 1.3 },
    normal: { gravityMult: 1.0, fuelMult: 1.0, thrustMult: 1.0 },
    hard: { gravityMult: 1.4, fuelMult: 1.8, thrustMult: 0.8 }
};

// Expose to window for global access
window.levels = levels;
window.difficultySettings = difficultySettings;

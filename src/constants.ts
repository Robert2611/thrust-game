export enum GameState {
    MENU = 'MENU',
    PLAYING = 'PLAYING',
    SUCCESS = 'SUCCESS'
}

export enum InputActions {
    ROTATE_LEFT = 'rotateLeft',
    ROTATE_RIGHT = 'rotateRight',
    THRUST = 'thrust'
}

export enum CargoType {
    NEON_CORE = 'NEON CORE',
    QUANTUM_FUEL = 'QUANTUM FUEL'
}

// --- Physics ---
export const DEFAULT_GRAVITY = 0.1;
export const DEFAULT_FRICTION = 0.99;
export const DEFAULT_THRUST_STRENGTH = 0.25;
export const DEFAULT_ROTATION_SPEED = 0.04;
export const FUEL_BURN_RATE = 0.5;
export const FAN_LERP_STRENGTH = 0.08;

// --- Collision ---
export const SHIP_HALF_HEIGHT = 10;           // half-height of ship bounding box
export const SHIP_COLLISION_RADIUS = 8;       // radius for terrain line-circle check
export const PLATFORM_SNAP_TOLERANCE = 5;     // vertical tolerance for landing/snap
export const LANDING_MAX_SPEED = 2.0;         // max vy/vx for a safe landing
export const LANDING_MAX_ANGLE = 0.5;         // max rotation offset (radians) for safe landing
export const POD_PICKUP_RADIUS = 60;          // distance to auto-collect pod

// --- World ---
export const DEFAULT_VIRTUAL_WIDTH = 1000;
export const DEFAULT_VIRTUAL_HEIGHT = 800;

// --- Particles ---
export const EXPLOSION_PARTICLE_COUNT = 15;
export const EXPLOSION_SCATTER_SPEED = 10;
export const EXPLOSION_ROTATION_SPEED = 0.2;
export const PARTICLE_LIFE_DECAY = 0.01;

// --- Renderer: Starfield ---
export const STAR_COUNT = 150;
export const STAR_FIELD_SPREAD = 2000;
export const STAR_MIN_SIZE = 0.5;
export const STAR_SIZE_RANGE = 2;
export const STAR_ALPHA = 0.6;
export const STARFIELD_PARALLAX = 0.3;

// --- Renderer: Terrain ---
export const TERRAIN_LINE_WIDTH = 2;

// --- Renderer: Ship ---
export const SHIP_NOSE_Y = -15;
export const SHIP_WING_X = 10;
export const SHIP_WING_Y = 10;
export const SHIP_THRUST_GLOW_BLUR = 10;
export const SHIP_THRUST_TIP_X = 5;
export const SHIP_THRUST_TIP_Y = 25;
export const SHIP_CARGO_HALF = 3;            // half-size of cargo indicator box

// --- Renderer: Pod ---
export const POD_HALF_SIZE = 10;

// --- Renderer: Exit ---
export const EXIT_HALF_WIDTH = 10;
export const EXIT_HEIGHT = 20;

// --- Renderer: Fan ---
export const FAN_HOUSING_RADIUS_RATIO = 0.8; // R = width * this
export const FAN_HOUSING_OFFSET_RATIO = 0.3; // cx = -R - width * this
export const FAN_DUCT_WALL_THICKNESS = 6;
export const FAN_BLADE_COUNT = 7;
export const FAN_BLADE_INNER_RATIO = 0.28;
export const FAN_BLADE_OUTER_RATIO = 0.82;
export const FAN_BLADE_SWEEP = 0.55;         // forward-curve angle offset (radians)
export const FAN_SPIN_PERIOD_MS = 150;       // lower = faster spin
export const FAN_HOUSING_DUCT_JOIN = 0.6;    // fraction of R where duct walls start
export const FAN_COLOR_DUCT = '#6B6E7A';
export const FAN_COLOR_HOUSING = '#5A5C68';
export const FAN_COLOR_RIM = '#9EA1AE';
export const FAN_COLOR_BLADE = '#C0C3D0';
export const FAN_RIM_LINE_WIDTH = 3;
export const FAN_BLADE_LINE_WIDTH = 2.5;

// --- Renderer: Radar ---
export const RADAR_MARGIN = 0.9;             // fraction of radar canvas used (rest is border)
export const RADAR_PULSE_PERIOD_MS = 200;
export const RADAR_BLIP_SIZE = 4;            // blip size in world units (divided by scale)
export const RADAR_EXIT_BLIP_SIZE = 6;
export const RADAR_FALLBACK_BG = '#1a1b24';
export const RADAR_VOID_COLOR = '#050507';

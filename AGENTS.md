# Thrust Game — Project Coding Guidelines

This file contains project-specific rules for any AI assistant (or human!) working on this codebase.
These rules must be followed for every code change, regardless of how small.

---

## Rules

### No Magic Numbers or Inline Constants

**All numeric literals and string constants used in logic must be defined in `src/constants.ts`.**

Do **not** write:
```typescript
ship.fuel -= 0.5;
this.physics.gravity = 0.12;
const force = diff * 0.08;
this.ctx.lineWidth = 3;
```

Do **write**:
```typescript
import { FUEL_BURN_RATE, FAN_LERP_STRENGTH } from '../constants';

ship.fuel -= FUEL_BURN_RATE;
const force = diff * FAN_LERP_STRENGTH;
```

This applies to:
- Physics tuning values (gravity, friction, thrust strength, fan lerp strength, etc.)
- Rendering values (line widths, colors used in code rather than CSS, blade counts, etc.)
- Game rules (collision radii, platform snap tolerance, explosion thresholds, etc.)
- Level-independent defaults

**Exceptions** — the following are fine inline:
- `0`, `1`, `-1` used as neutral/identity multipliers
- `Math.PI`, `Math.PI * 2` (these are math, not configuration)
- Array indices
- String template literals

---

## File Structure Reference

| Path | Purpose |
|------|---------|
| `src/constants.ts` | All named constants and enums |
| `src/types.ts` | All TypeScript interfaces and types |
| `src/data/levels.ts` | Level definitions (may use constants from `constants.ts`) |
| `src/core/` | Pure logic — physics, game engine, collision, particles |
| `src/models/` | Stateful entity classes (Ship, Pod) |
| `src/ui/` | Rendering and input — thin wrappers, no game logic |

---

## Naming Conventions

- All source files use **kebab-case** (e.g. `physics-engine.ts`, `game-engine.ts`)
- Test files are colocated with their source: `physics-engine.test.ts` lives next to `physics-engine.ts`
- Constants in `constants.ts` use **SCREAMING_SNAKE_CASE**
- Enums use **PascalCase** for the type and **SCREAMING_SNAKE_CASE** for values

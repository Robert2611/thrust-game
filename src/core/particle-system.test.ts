import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from './particle-system';

describe('ParticleSystem', () => {
    let ps: ParticleSystem;

    beforeEach(() => {
        ps = new ParticleSystem();
    });

    it('should spawn 15 particles on explosion', () => {
        ps.spawnExplosion(10, 20);
        expect(ps.getParticles().length).toBe(15);
    });

    it('should decay particle life on update', () => {
        ps.spawnExplosion(10, 20);
        const particles = ps.getParticles();
        expect(particles[0].life).toBe(1.0);
        
        ps.update();
        expect(ps.getParticles()[0].life).toBeLessThan(1.0);
    });
});

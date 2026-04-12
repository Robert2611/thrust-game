import { Particle } from '../types';
import {
    EXPLOSION_PARTICLE_COUNT, EXPLOSION_SCATTER_SPEED,
    EXPLOSION_ROTATION_SPEED, PARTICLE_LIFE_DECAY
} from '../constants';

export class ParticleSystem {
    private particles: Particle[] = [];

    public getParticles(): Particle[] {
        return this.particles;
    }

    public spawnExplosion(x: number, y: number): void {
        for (let i = 0; i < EXPLOSION_PARTICLE_COUNT; i++) {
            this.particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * EXPLOSION_SCATTER_SPEED,
                vy: (Math.random() - 0.5) * EXPLOSION_SCATTER_SPEED,
                rotation: Math.random() * Math.PI * 2,
                rv: (Math.random() - 0.5) * EXPLOSION_ROTATION_SPEED, life: 1.0
            });
        }
    }

    public update(): void {
        this.particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            p.rotation += p.rv; p.life -= PARTICLE_LIFE_DECAY;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }

    public clear(): void {
        this.particles = [];
    }
}

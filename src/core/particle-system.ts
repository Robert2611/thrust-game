import { Particle } from '../types';

export class ParticleSystem {
    private particles: Particle[] = [];

    public getParticles(): Particle[] {
        return this.particles;
    }

    public spawnExplosion(x: number, y: number): void {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
                rotation: Math.random() * Math.PI * 2,
                rv: (Math.random() - 0.5) * 0.2, life: 1.0
            });
        }
    }

    public update(): void {
        this.particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            p.rotation += p.rv; p.life -= 0.01;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }

    public clear(): void {
        this.particles = [];
    }
}

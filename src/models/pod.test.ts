import { describe, it, expect, beforeEach } from 'vitest';
import { Pod } from './pod';
import { CargoType } from '../constants';

describe('Pod', () => {
    let pod: Pod;

    beforeEach(() => {
        pod = new Pod();
    });

    it('should initialize with default values', () => {
        expect(pod.x).toBe(0);
        expect(pod.y).toBe(0);
        expect(pod.vx).toBe(0);
        expect(pod.vy).toBe(0);
        expect(pod.isAttached).toBe(false);
        expect(pod.isCollected).toBe(false);
        expect(pod.type).toBeNull();
    });

    it('should reset properly with new values', () => {
        pod.isCollected = true;
        pod.isAttached = true;
        pod.vx = 10;
        
        pod.reset(150, 300, CargoType.NEON_CORE);
        
        expect(pod.x).toBe(150);
        expect(pod.y).toBe(300);
        expect(pod.vx).toBe(0);
        expect(pod.vy).toBe(0);
        expect(pod.isAttached).toBe(false);
        expect(pod.isCollected).toBe(false);
        expect(pod.type).toBe(CargoType.NEON_CORE);
    });
});

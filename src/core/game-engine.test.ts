import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEngine } from './game-engine';
import { GameState, InputActions } from '../constants';

// We mock window since GameEngine tries to read URLSearchParams from it.
vi.stubGlobal('window', {
    location: { search: '' },
});

describe('GameEngine', () => {
    let game: GameEngine;

    beforeEach(() => {
        game = new GameEngine();
    });

    it('should start in MENU state', () => {
        expect(game.state).toBe(GameState.MENU);
    });

    it('should change to PLAYING on startLevel', () => {
        const spy = vi.fn();
        game.onStateChange = spy;
        
        game.startLevel();
        
        expect(game.state).toBe(GameState.PLAYING);
        expect(spy).toHaveBeenCalledWith(GameState.PLAYING);
    });

    it('should process thrust input', () => {
        game.startLevel();
        game.handleAction(InputActions.THRUST, true);
        expect(game.ship.isThrusting).toBe(true);
    });
});

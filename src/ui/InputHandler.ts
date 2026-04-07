import { GameState, InputActions } from '../constants';
import { GameEngine } from '../core/GameEngine';

export class InputHandler {
    private game: GameEngine;

    constructor(gameEngine: GameEngine) {
        this.game = gameEngine;
        this.initEventListeners();
    }

    private initEventListeners(): void {
        window.addEventListener('keydown', (e: KeyboardEvent) => this.handleKey(e, true));
        window.addEventListener('keyup', (e: KeyboardEvent) => this.handleKey(e, false));
        
        const bindTouch = (id: string, action: InputActions): void => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('pointerdown', (e: PointerEvent) => { 
                e.preventDefault(); 
                this.game.handleAction(action, true); 
            });
            el.addEventListener('pointerup', (e: PointerEvent) => { 
                e.preventDefault(); 
                this.game.handleAction(action, false); 
            });
            el.addEventListener('pointermove', (e: PointerEvent) => e.preventDefault());
        };

        bindTouch('left-ctrl', InputActions.ROTATE_LEFT);
        bindTouch('thrust-ctrl', InputActions.THRUST);
        bindTouch('right-ctrl', InputActions.ROTATE_RIGHT);
        
        const startBtn = document.getElementById('start-btn');
        if (startBtn) startBtn.onclick = () => this.game.startLevel();
        
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) nextBtn.onclick = () => this.game.nextLevel();
    }

    private handleKey(e: KeyboardEvent, isDown: boolean): void {
        if (this.game.state === GameState.MENU && isDown) {
            if (e.code === 'Enter') this.game.startLevel();
        }

        if (this.game.state === GameState.SUCCESS && isDown) {
            if (e.code === 'Enter') this.game.nextLevel();
        }

        switch(e.code) {
            case 'ArrowLeft': this.game.handleAction(InputActions.ROTATE_LEFT, isDown); break;
            case 'ArrowRight': this.game.handleAction(InputActions.ROTATE_RIGHT, isDown); break;
            case 'ArrowUp': this.game.handleAction(InputActions.THRUST, isDown); break;
        }
    }
}

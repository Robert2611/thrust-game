import { GameState, InputActions } from '../constants.js';

export class InputHandler {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.initEventListeners();
    }

    initEventListeners() {
        // Keyboard
        window.addEventListener('keydown', (e) => this.handleKey(e, true));
        window.addEventListener('keyup', (e) => this.handleKey(e, false));
        
        // Touch (Mobile)
        const bindTouch = (id, action) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('pointerdown', (e) => { e.preventDefault(); this.game.handleAction(action, true); });
            el.addEventListener('pointerup', (e) => { e.preventDefault(); this.game.handleAction(action, false); });
            el.addEventListener('pointermove', (e) => e.preventDefault());
        };

        bindTouch('left-ctrl', InputActions.ROTATE_LEFT);
        bindTouch('thrust-ctrl', InputActions.THRUST);
        bindTouch('right-ctrl', InputActions.ROTATE_RIGHT);
        
        document.getElementById('start-btn').onclick = () => this.game.startLevel();
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) nextBtn.onclick = () => this.game.nextLevel();
    }

    handleKey(e, isDown) {
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

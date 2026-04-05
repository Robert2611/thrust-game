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

        bindTouch('left-ctrl', 'rotateLeft');
        bindTouch('thrust-ctrl', 'thrust');
        bindTouch('right-ctrl', 'rotateRight');
        
        document.getElementById('start-btn').onclick = () => this.game.startLevel();
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) nextBtn.onclick = () => this.game.nextLevel();

        window.setDifficulty = (diff) => {
            this.game.setDifficulty(diff);
            if (this.game.onHUDUpdate) this.game.onHUDUpdate();
        };
    }

    handleKey(e, isDown) {
        if (this.game.state === 'MENU' && isDown) {
            if (e.code === 'Enter') this.game.startLevel();
            if (e.code === 'ArrowLeft') this.cycleDifficulty(-1);
            if (e.code === 'ArrowRight') this.cycleDifficulty(1);
            if (['Digit1', 'Digit2', 'Digit3', 'Numpad1', 'Numpad2', 'Numpad3'].includes(e.code)) {
                const diffs = ['easy', 'normal', 'hard'];
                const idx = parseInt(e.code.slice(-1)) - 1;
                window.setDifficulty(diffs[idx]);
            }
        }

        if (this.game.state === 'SUCCESS' && isDown) {
            if (e.code === 'Enter') this.game.nextLevel();
        }

        switch(e.code) {
            case 'ArrowLeft': this.game.handleAction('rotateLeft', isDown); break;
            case 'ArrowRight': this.game.handleAction('rotateRight', isDown); break;
            case 'ArrowUp': this.game.handleAction('thrust', isDown); break;
        }
    }

    cycleDifficulty(dir) {
        const diffs = ['easy', 'normal', 'hard'];
        let idx = diffs.indexOf(this.game.difficulty);
        idx = (idx + dir + diffs.length) % diffs.length;
        window.setDifficulty(diffs[idx]);
    }
}

import { GameEngine } from './core/GameEngine.js';
import { UIManager } from './ui/UIManager.js';
import { InputHandler } from './ui/InputHandler.js';
import { Renderer } from './ui/Renderer.js';

class App {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.game = new GameEngine();
        this.renderer = new Renderer(this.game, this.canvas);
        this.ui = new UIManager(this.game);
        this.input = new InputHandler(this.game);

        this.initResize();
        this.game.startLevel(); // Initialize but don't start the loop until START buttons
        
        // Return to Menu at start
        this.game.state = 'MENU';
        this.ui.handleStateChange('MENU');
        
        this.loop();
    }

    initResize() {
        const playArea = document.getElementById('play-area');
        const resize = () => {
            this.canvas.width = playArea.clientWidth;
            this.canvas.height = playArea.clientHeight;
            this.updateCamera(true);
        };
        window.addEventListener('resize', resize);
        resize();
    }

    updateCamera(immediate = false) {
        let targetX, targetY;
        if (this.canvas.width >= this.game.virtualWidth) {
            targetX = -(this.canvas.width - this.game.virtualWidth) / 2;
        } else {
            targetX = Math.max(0, Math.min(this.game.ship.x - this.canvas.width / 2, this.game.virtualWidth - this.canvas.width));
        }

        if (this.canvas.height >= this.game.virtualHeight) {
            targetY = -(this.canvas.height - this.game.virtualHeight) / 2;
        } else {
            targetY = Math.max(0, Math.min(this.game.ship.y - this.canvas.height / 2, this.game.virtualHeight - this.canvas.height));
        }

        if (immediate) {
            this.game.cameraX = targetX;
            this.game.cameraY = targetY;
        } else {
            this.game.cameraX += (targetX - this.game.cameraX) * 0.1;
            this.game.cameraY += (targetY - this.game.cameraY) * 0.1;
        }
    }

    loop() {
        this.game.update();
        this.updateCamera();
        this.renderer.draw();
        requestAnimationFrame(() => this.loop());
    }
}

// Start the app when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

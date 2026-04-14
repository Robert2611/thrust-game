import { GameEngine } from './core/game-engine';
import { UIManager } from './ui/ui-manager';
import { InputHandler } from './ui/input-handler';
import { Renderer } from './ui/renderer';
import { GameState } from './constants';
import { LevelEditor } from './ui/level-editor';

class App {
    private canvas: HTMLCanvasElement;
    private game: GameEngine;
    private _renderer: Renderer;
    private _ui: UIManager;
    private _editor: LevelEditor;

    constructor() {
        const canvasElement = document.getElementById('game-canvas') as HTMLCanvasElement;
        if (!canvasElement) throw new Error("Canvas element not found");
        this.canvas = canvasElement;

        this.game = new GameEngine();
        this._renderer = new Renderer(this.game, this.canvas);
        this._ui = new UIManager(this.game);
        this._editor = new LevelEditor(this.game, this.canvas);
        new InputHandler(this.game);

        this.initResize();
        this.game.startLevel(); // Initialize but don't start the loop until START buttons
        
        // Return to Menu at start
        this.game.state = GameState.MENU;
        this._ui.handleStateChange(GameState.MENU);
        
        this.loop();
    }

    private initResize(): void {
        const playArea = document.getElementById('play-area');
        const resize = () => {
            if (!playArea) return;
            this.canvas.width = playArea.clientWidth;
            this.canvas.height = playArea.clientHeight;
            this.updateCamera(true);
        };
        window.addEventListener('resize', resize);
        resize();
    }

    private updateCamera(immediate: boolean = false): void {
        const marginX = 150; // Allow camera to travel 150px outside borders
        const marginY = 150;

        let targetX: number, targetY: number;
        
        // Horizontal bounds
        if (this.canvas.width >= this.game.virtualWidth + marginX * 2) {
            targetX = -(this.canvas.width - this.game.virtualWidth) / 2;
        } else {
            targetX = Math.max(-marginX, Math.min(this.game.ship.x - this.canvas.width / 2, this.game.virtualWidth - this.canvas.width + marginX));
        }

        // Vertical bounds
        if (this.canvas.height >= this.game.virtualHeight + marginY * 2) {
            targetY = -(this.canvas.height - this.game.virtualHeight) / 2;
        } else {
            targetY = Math.max(-marginY, Math.min(this.game.ship.y - this.canvas.height / 2, this.game.virtualHeight - this.canvas.height + marginY));
        }

        if (immediate) {
            this.game.cameraX = targetX;
            this.game.cameraY = targetY;
        } else {
            this.game.cameraX += (targetX - this.game.cameraX) * 0.1;
            this.game.cameraY += (targetY - this.game.cameraY) * 0.1;
        }
    }

    private loop(): void {
        if (!this._editor.active) {
            this.game.update();
            this.updateCamera();
        }
        this._renderer.draw(this._editor.active);
        requestAnimationFrame(() => this.loop());
    }
}

// Start the app when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

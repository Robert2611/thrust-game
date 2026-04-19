import { levels } from '../data/levels';
import { GameState } from '../constants';
import { GameEngine } from '../core/game-engine';
import { LevelEditor } from './level-editor';

export class UIManager {
    private game: GameEngine;
    private editor: LevelEditor;
    private startScreen: HTMLElement | null;
    private successScreen: HTMLElement | null;
    private exportBtn: HTMLElement | null;
    private fuelBar: HTMLElement | null;
    private finalFuel: HTMLElement | null;
    private cargoBox: HTMLElement | null;

    constructor(gameEngine: GameEngine, editor: LevelEditor) {
        this.game = gameEngine;
        this.editor = editor;
        this.startScreen = document.getElementById('start-screen');
        this.successScreen = document.getElementById('success-screen');
        this.exportBtn = document.getElementById('export-success-btn');
        this.fuelBar = document.getElementById('fuel-bar');
        this.finalFuel = document.getElementById('final-fuel');
        this.cargoBox = document.getElementById('cargo-box-hud');
        
        this.setupCallbacks();
        this.setupEventListeners();
    }

    private setupCallbacks(): void {
        this.game.onHUDUpdate = () => this.updateHUD();
        this.game.onStateChange = (state) => this.handleStateChange(state);
        this.game.onExplosion = () => {
            setTimeout(() => this.game.resetLevel(), 2000);
        };
    }

    private setupEventListeners(): void {
        if (this.exportBtn) {
            this.exportBtn.onclick = () => this.editor.showExportDialog();
        }
    }

    public updateHUD(): void {
        const level = levels[this.game.currentLevelIndex];
        const maxFuel = level.fuel;
        
        if (this.fuelBar) {
            this.fuelBar.style.width = `${(this.game.ship.fuel / maxFuel) * 100}%`;
        }

        if (this.cargoBox) {
            if (this.game.ship.cargo) this.cargoBox.classList.add('filled');
            else this.cargoBox.classList.remove('filled');
        }
    }

    public handleStateChange(state: GameState): void {
        if (this.startScreen) {
            this.startScreen.style.display = (state === GameState.MENU) ? 'flex' : 'none';
        }
        
        if (this.successScreen) {
            if (state === GameState.SUCCESS) {
                // Show Export button only if level was modified
                if (this.exportBtn) {
                    this.exportBtn.style.display = this.editor.isModified ? 'block' : 'none';
                }

                setTimeout(() => {
                    if (this.finalFuel) this.finalFuel.innerText = Math.floor(this.game.ship.fuel).toString();
                    if (this.successScreen) this.successScreen.style.display = 'flex';
                }, 1200);
            } else {
                this.successScreen.style.display = 'none';
            }
        }
    }
}

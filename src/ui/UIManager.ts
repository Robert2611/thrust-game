import { levels } from '../data/levels';
import { GameState } from '../constants';
import { GameEngine } from '../core/GameEngine';

export class UIManager {
    private game: GameEngine;
    private startScreen: HTMLElement | null;
    private successScreen: HTMLElement | null;
    private fuelBar: HTMLElement | null;
    private finalFuel: HTMLElement | null;
    private cargoBox: HTMLElement | null;

    constructor(gameEngine: GameEngine) {
        this.game = gameEngine;
        this.startScreen = document.getElementById('start-screen');
        this.successScreen = document.getElementById('success-screen');
        this.fuelBar = document.getElementById('fuel-bar');
        this.finalFuel = document.getElementById('final-fuel');
        this.cargoBox = document.getElementById('cargo-box-hud');
        
        this.setupCallbacks();
    }

    private setupCallbacks(): void {
        this.game.onHUDUpdate = () => this.updateHUD();
        this.game.onStateChange = (state) => this.handleStateChange(state);
        this.game.onExplosion = () => {
            setTimeout(() => this.game.resetLevel(), 2000);
        };
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

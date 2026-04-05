import { levels, difficultySettings } from '../data/levels.js';

export class UIManager {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.startScreen = document.getElementById('start-screen');
        this.successScreen = document.getElementById('success-screen');
        this.fuelBar = document.getElementById('fuel-bar');
        this.finalFuel = document.getElementById('final-fuel');
        this.difficultyText = document.getElementById('difficulty-text');
        this.cargoBox = document.getElementById('cargo-box-hud');
        
        this.setupCallbacks();
    }

    setupCallbacks() {
        this.game.onHUDUpdate = () => this.updateHUD();
        this.game.onStateChange = (state) => this.handleStateChange(state);
        this.game.onExplosion = () => {
            setTimeout(() => this.game.resetLevel(), 2000);
        };
    }

    updateHUD() {
        const level = levels[this.game.currentLevelIndex];
        const diff = difficultySettings[this.game.difficulty];
        const maxFuel = level.fuel * (1 / diff.fuelMult);
        
        if (this.fuelBar) {
            this.fuelBar.style.width = `${(this.game.ship.fuel / maxFuel) * 100}%`;
        }

        if (this.difficultyText) {
            this.difficultyText.innerText = this.game.difficulty.toUpperCase();
        }

        if (this.cargoBox) {
            if (this.game.ship.cargo) this.cargoBox.classList.add('filled');
            else this.cargoBox.classList.remove('filled');
        }

        // Highlight difficulty buttons
        ['easy', 'normal', 'hard'].forEach(id => {
            const btn = document.getElementById(`btn-${id}`);
            if (btn) {
                if (this.game.difficulty === id) btn.classList.add('selected');
                else btn.classList.remove('selected');
            }
        });
    }

    handleStateChange(state) {
        if (state === 'MENU') {
            this.startScreen.style.display = 'flex';
            this.successScreen.style.display = 'none';
        } else if (state === 'PLAYING') {
            this.startScreen.style.display = 'none';
            this.successScreen.style.display = 'none';
        } else if (state === 'SUCCESS') {
            setTimeout(() => {
                const fuelVal = document.getElementById('final-fuel');
                if (fuelVal) fuelVal.innerText = Math.floor(this.game.ship.fuel);
                this.successScreen.style.display = 'flex';
            }, 1200);
        }
    }
}

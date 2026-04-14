import { GameEngine } from '../core/game-engine';
import { Point, TerrainObject } from '../types';
import { EDITOR_GRID_SIZE, EDITOR_POINT_RADIUS } from '../constants';
import { levels } from '../data/levels';

export class LevelEditor {
    private game: GameEngine;
    private canvas: HTMLCanvasElement;
    private isActive: boolean = false;
    
    private selectedPoint: { shapeIndex: number, pointIndex: number } | null = null;
    private isDragging: boolean = false;
    
    private panel: HTMLElement | null = null;
    private exportOverlay: HTMLElement | null = null;

    constructor(gameEngine: GameEngine, canvas: HTMLCanvasElement) {
        this.game = gameEngine;
        this.canvas = canvas;
        
        this.setupEventListeners();
        this.createPanel();
    }

    public toggle(): void {
        this.isActive = !this.isActive;
        if (this.panel) {
            this.panel.style.display = this.isActive ? 'flex' : 'none';
        }
        
        // When activating, reset selection
        if (this.isActive) {
            this.selectedPoint = null;
            this.isDragging = false;
        }
    }

    public get active(): boolean {
        return this.isActive;
    }

    private setupEventListeners(): void {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mouseup', () => this.onMouseUp());
        
        // Keyboard shortcut Alt+E
        window.addEventListener('keydown', (e) => {
            if (e.altKey && e.key.toLowerCase() === 'e') {
                this.toggle();
                e.preventDefault();
            }
        });
    }

    private getMouseWorldPos(e: MouseEvent): Point {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) + this.game.cameraX;
        const y = (e.clientY - rect.top) + this.game.cameraY;
        return { x, y };
    }

    private onMouseDown(e: MouseEvent): void {
        if (!this.isActive) return;
        
        const mousePos = this.getMouseWorldPos(e);
        const level = levels[this.game.currentLevelIndex];
        
        // Hit-test polygon points
        for (let s = 0; s < level.terrain.length; s++) {
            const shape = level.terrain[s];
            if (shape.type === 'polygon') {
                for (let p = 0; p < shape.points.length; p++) {
                    const point = shape.points[p];
                    const dist = Math.sqrt((point.x - mousePos.x) ** 2 + (point.y - mousePos.y) ** 2);
                    
                    if (dist < EDITOR_POINT_RADIUS * 1.5) {
                        this.selectedPoint = { shapeIndex: s, pointIndex: p };
                        this.isDragging = true;
                        return;
                    }
                }
            }
        }
        
        this.selectedPoint = null;
    }

    private onMouseMove(e: MouseEvent): void {
        if (!this.isActive || !this.isDragging || !this.selectedPoint) return;
        
        const mousePos = this.getMouseWorldPos(e);
        const level = levels[this.game.currentLevelIndex];
        const shape = level.terrain[this.selectedPoint.shapeIndex];
        
        if (shape.type === 'polygon') {
            const point = shape.points[this.selectedPoint.pointIndex];
            
            // Apply snap to grid
            point.x = Math.round(mousePos.x / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE;
            point.y = Math.round(mousePos.y / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE;
        }
    }

    private onMouseUp(): void {
        this.isDragging = false;
    }

    private createPanel(): void {
        this.panel = document.createElement('div');
        this.panel.id = 'editor-panel';
        this.panel.innerHTML = `
            <h3>LEVEL EDITOR</h3>
            <div class="editor-info">Mode: Polygon Edit</div>
            <button id="export-btn">EXPORT CODE</button>
            <div class="editor-hint">Alt+E to Toggle</div>
        `;
        document.body.appendChild(this.panel);
        this.panel.style.display = 'none';

        document.getElementById('export-btn')?.addEventListener('click', () => this.showExportDialog());
    }

    private showExportDialog(): void {
        if (this.exportOverlay) this.exportOverlay.remove();
        
        this.exportOverlay = document.createElement('div');
        this.exportOverlay.id = 'export-overlay';
        this.exportOverlay.className = 'overlay';
        
        const level = levels[this.game.currentLevelIndex];
        const code = this.generateLevelCode(level);
        
        this.exportOverlay.innerHTML = `
            <div class="export-content">
                <h2>Export Level Code</h2>
                <p>Copy and paste this into src/data/levels.ts</p>
                <textarea id="export-textarea" readonly>${code}</textarea>
                <div class="export-actions">
                    <button id="copy-btn">COPY TO CLIPBOARD</button>
                    <button id="close-export-btn">CLOSE</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.exportOverlay);
        this.exportOverlay.style.display = 'flex';
        
        document.getElementById('copy-btn')?.addEventListener('click', () => {
            const textarea = document.getElementById('export-textarea') as HTMLTextAreaElement;
            textarea.select();
            navigator.clipboard.writeText(textarea.value);
            const btn = document.getElementById('copy-btn');
            if (btn) btn.innerText = 'COPIED!';
        });
        
        document.getElementById('close-export-btn')?.addEventListener('click', () => {
            if (this.exportOverlay) this.exportOverlay.style.display = 'none';
        });
    }

    private generateLevelCode(level: any): string {
        const json = JSON.stringify(level, (key, value) => {
            if (key === 'points' && Array.isArray(value)) {
                // Keep points on one line for better readability
                return value; 
            }
            return value;
        }, 4);
        
        // Post-process to fix point readability if needed, but for now we'll just return formatted JSON
        return `{\n    name: "${level.name}",\n    gravity: ${level.gravity},\n    fuel: ${level.fuel},\n    shipStart: ${JSON.stringify(level.shipStart)},\n    podStart: ${JSON.stringify(level.podStart)},\n    exit: ${JSON.stringify(level.exit)},\n    platforms: ${JSON.stringify(level.platforms, null, 12).replace(/"/g, '')},\n    fans: ${JSON.stringify(level.fans || [], null, 12).replace(/"/g, '')},\n    terrain: ${this.formatTerrain(level.terrain)}\n}`;
    }

    private formatTerrain(terrain: TerrainObject[]): string {
        return '[\n        ' + terrain.map(t => {
            if (t.type === 'polygon') {
                const points = t.points.map(p => `{ x: ${p.x}, y: ${p.y} }`).join(', ');
                return `{\n            type: 'polygon',\n            points: [\n                ${points}\n            ]${t.isSolid ? ',\n            isSolid: true' : ''}\n        }`;
            } else if (t.type === 'rect') {
                return `{\n            type: 'rect', x: ${t.x}, y: ${t.y}, width: ${t.width}, height: ${t.height}${t.isSolid ? ', isSolid: true' : ''}\n        }`;
            }
            return '';
        }).join(',\n        ') + '\n    ]';
    }
}

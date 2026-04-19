import { GameEngine } from '../core/game-engine';
import { Point, TerrainObject } from '../types';
import { EDITOR_GRID_SIZE, EDITOR_POINT_RADIUS } from '../constants';
import { levels } from '../data/levels';

export class LevelEditor {
    private game: GameEngine;
    private canvas: HTMLCanvasElement;
    private isActive: boolean = false;
    
    private selectedItem: { 
        type: 'vertex' | 'ship' | 'pod' | 'exit' | 'platform' | 'fan', 
        shapeIndex?: number, 
        pointIndex?: number,
        index?: number 
    } | null = null;
    private isDragging: boolean = false;
    private isPanning: boolean = false;
    private lastMouseScreenPos: Point = { x: 0, y: 0 };
    
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
        
        // When activating, reset selection and camera state
        if (this.isActive) {
            this.selectedItem = null;
            this.isDragging = false;
            this.isPanning = false;
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
        const hitRadius = EDITOR_POINT_RADIUS * 1.5;
        
        // 1. Hit-test Ship Start
        if (this.dist(mousePos, level.shipStart) < hitRadius) {
            this.selectedItem = { type: 'ship' };
            this.isDragging = true;
            return;
        }

        // 2. Hit-test Pod Start
        if (this.dist(mousePos, level.podStart) < hitRadius) {
            this.selectedItem = { type: 'pod' };
            this.isDragging = true;
            return;
        }

        // 3. Hit-test Exit
        if (this.dist(mousePos, level.exit) < hitRadius) {
            this.selectedItem = { type: 'exit' };
            this.isDragging = true;
            return;
        }

        // 4. Hit-test Platforms
        for (let i = 0; i < level.platforms.length; i++) {
            if (this.dist(mousePos, level.platforms[i]) < hitRadius) {
                this.selectedItem = { type: 'platform', index: i };
                this.isDragging = true;
                return;
            }
        }

        // 5. Hit-test Fans
        const fans = level.fans || [];
        for (let i = 0; i < fans.length; i++) {
            const f = fans[i];
            // The visual handle is at the center of the fan's range
            const handleX = f.x + Math.cos(f.rotation) * (f.length / 2);
            const handleY = f.y + Math.sin(f.rotation) * (f.length / 2);
            
            if (this.dist(mousePos, { x: handleX, y: handleY }) < hitRadius) {
                this.selectedItem = { type: 'fan', index: i };
                this.isDragging = true;
                return;
            }
        }
        
        // 6. Hit-test Polygon vertices
        for (let s = 0; s < level.terrain.length; s++) {
            const shape = level.terrain[s];
            if (shape.type === 'polygon') {
                for (let p = 0; p < shape.points.length; p++) {
                    const point = shape.points[p];
                    if (this.dist(mousePos, point) < hitRadius) {
                        this.selectedItem = { type: 'vertex', shapeIndex: s, pointIndex: p };
                        this.isDragging = true;
                        return;
                    }
                }
            }
        }
        
        this.selectedItem = null;
        this.isPanning = true;
        this.lastMouseScreenPos = { x: e.clientX, y: e.clientY };
    }

    private dist(p1: Point, p2: Point): number {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }

    private onMouseMove(e: MouseEvent): void {
        if (!this.isActive) return;

        if (this.isDragging && this.selectedItem) {
            const mousePos = this.getMouseWorldPos(e);
            const level = levels[this.game.currentLevelIndex];
            
            let target: Point | null = null;

            switch (this.selectedItem.type) {
                case 'ship': 
                    target = level.shipStart; 
                    this.game.ship.x = Math.round(mousePos.x / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE;
                    this.game.ship.y = Math.round(mousePos.y / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE;
                    break;
                case 'pod': 
                    target = level.podStart; 
                    this.game.pod.x = Math.round(mousePos.x / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE;
                    this.game.pod.y = Math.round(mousePos.y / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE;
                    break;
                case 'exit': target = level.exit; break;
                case 'platform': target = level.platforms[this.selectedItem.index!]; break;
                case 'fan': target = (level.fans || [])[this.selectedItem.index!]; break;
                case 'vertex': 
                    const shape = level.terrain[this.selectedItem.shapeIndex!];
                    if (shape.type === 'polygon') {
                        target = shape.points[this.selectedItem.pointIndex!];
                    }
                    break;
            }

            if (target) {
                target.x = Math.round(mousePos.x / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE;
                target.y = Math.round(mousePos.y / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE;
            }
        } else if (this.isPanning) {
            const dx = e.clientX - this.lastMouseScreenPos.x;
            const dy = e.clientY - this.lastMouseScreenPos.y;
            
            this.game.cameraX -= dx;
            this.game.cameraY -= dy;
            
            this.lastMouseScreenPos = { x: e.clientX, y: e.clientY };
        }
    }

    private onMouseUp(): void {
        this.isDragging = false;
        this.isPanning = false;
    }

    private createPanel(): void {
        this.panel = document.createElement('div');
        this.panel.id = 'editor-panel';
        this.panel.innerHTML = `
            <h3>LEVEL EDITOR</h3>
            <div class="editor-info">Mode: Polygon Edit</div>
            <div class="editor-actions">
                <button id="export-btn">EXPORT CODE</button>
                <button id="reset-cam-btn">RESET VIEW</button>
            </div>
            <div class="editor-hint">Drag handle to move point</div>
            <div class="editor-hint">Drag space to pan camera</div>
            <div class="editor-hint">Alt+E to Toggle</div>
        `;
        document.body.appendChild(this.panel);
        this.panel.style.display = 'none';

        document.getElementById('export-btn')?.addEventListener('click', () => this.showExportDialog());
        document.getElementById('reset-cam-btn')?.addEventListener('click', () => this.resetCamera());
    }

    private resetCamera(): void {
        // Trigger the original camera positioning by temporarily toggling off the editor smoothing
        // but for a dev tool, we can just snap it back to ship
        this.game.cameraX = this.game.ship.x - this.canvas.width / 2;
        this.game.cameraY = this.game.ship.y - this.canvas.height / 2;
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

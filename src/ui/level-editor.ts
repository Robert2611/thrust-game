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
    private dragOffset: Point = { x: 0, y: 0 };
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
        const isDelete = e.ctrlKey;
        const isDeleteShape = e.ctrlKey && e.shiftKey;
        
        // Reset offset
        this.dragOffset = { x: 0, y: 0 };
        
        // --- 1. Hit-test entities (Ship, Pod, Exit, Platforms, Fans) ---
        
        // Ship Start (No delete)
        if (this.dist(mousePos, level.shipStart) < hitRadius) {
            this.selectedItem = { type: 'ship' };
            this.dragOffset = { x: mousePos.x - level.shipStart.x, y: mousePos.y - level.shipStart.y };
            this.isDragging = true;
            return;
        }

        // Pod Start (No delete)
        if (this.dist(mousePos, level.podStart) < hitRadius) {
            this.selectedItem = { type: 'pod' };
            this.dragOffset = { x: mousePos.x - level.podStart.x, y: mousePos.y - level.podStart.y };
            this.isDragging = true;
            return;
        }

        // Exit (No delete)
        if (this.dist(mousePos, level.exit) < hitRadius) {
            this.selectedItem = { type: 'exit' };
            this.dragOffset = { x: mousePos.x - level.exit.x, y: mousePos.y - level.exit.y };
            this.isDragging = true;
            return;
        }

        // Platforms (Deletion supported)
        for (let i = 0; i < level.platforms.length; i++) {
            if (this.dist(mousePos, level.platforms[i]) < hitRadius) {
                if (isDeleteShape) {
                    level.platforms.splice(i, 1);
                    this.selectedItem = null;
                } else {
                    this.selectedItem = { type: 'platform', index: i };
                    this.dragOffset = { x: mousePos.x - level.platforms[i].x, y: mousePos.y - level.platforms[i].y };
                    this.isDragging = true;
                }
                return;
            }
        }

        // Fans (Deletion supported)
        const fans = level.fans || [];
        for (let i = 0; i < fans.length; i++) {
            const f = fans[i];
            const handleX = f.x + Math.cos(f.rotation) * (f.length / 2);
            const handleY = f.y + Math.sin(f.rotation) * (f.length / 2);
            
            if (this.dist(mousePos, { x: handleX, y: handleY }) < hitRadius) {
                if (isDeleteShape) {
                    fans.splice(i, 1);
                    this.selectedItem = null;
                } else {
                    this.selectedItem = { type: 'fan', index: i };
                    // For fans, the dragOffset is relative to the pivot, but the handle is offset.
                    // This stores the offset between the mouse and the pivot (f.x, f.y)
                    this.dragOffset = { x: mousePos.x - f.x, y: mousePos.y - f.y };
                    this.isDragging = true;
                }
                return;
            }
        }
        
        // --- 2. Hit-test Polygon vertices ---
        for (let s = 0; s < level.terrain.length; s++) {
            const shape = level.terrain[s];
            if (shape.type === 'polygon') {
                for (let p = 0; p < shape.points.length; p++) {
                    const point = shape.points[p];
                    if (this.dist(mousePos, point) < hitRadius) {
                        if (isDeleteShape) {
                            level.terrain.splice(s, 1);
                            this.selectedItem = null;
                        } else if (isDelete) {
                            if (shape.points.length > 3) {
                                shape.points.splice(p, 1);
                            }
                            this.selectedItem = null;
                        } else {
                            this.selectedItem = { type: 'vertex', shapeIndex: s, pointIndex: p };
                            this.dragOffset = { x: mousePos.x - point.x, y: mousePos.y - point.y };
                            this.isDragging = true;
                        }
                        return;
                    }
                }
            }
        }

        // --- 3. Hit-test Segments (Add Vertex) ---
        if (!isDelete && !isDeleteShape) {
            for (let s = 0; s < level.terrain.length; s++) {
                const shape = level.terrain[s];
                if (shape.type === 'polygon') {
                    for (let p = 0; p < shape.points.length; p++) {
                        const p1 = shape.points[p];
                        const p2 = shape.points[(p + 1) % shape.points.length];
                        
                        if (this.distToSegment(mousePos, p1, p2) < hitRadius) {
                            const newPoint = { 
                                x: Math.round(mousePos.x / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE, 
                                y: Math.round(mousePos.y / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE 
                            };
                            // Insert between p1 and p2
                            shape.points.splice(p + 1, 0, newPoint);
                            this.selectedItem = { type: 'vertex', shapeIndex: s, pointIndex: p + 1 };
                            this.dragOffset = { x: 0, y: 0 }; // Start fresh on new point
                            this.isDragging = true;
                            return;
                        }
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
                case 'ship': target = level.shipStart; break;
                case 'pod': target = level.podStart; break;
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
                target.x = Math.round((mousePos.x - this.dragOffset.x) / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE;
                target.y = Math.round((mousePos.y - this.dragOffset.y) / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE;
                
                // Sync live entities if moving start points
                if (this.selectedItem.type === 'ship') {
                    this.game.ship.x = target.x;
                    this.game.ship.y = target.y;
                } else if (this.selectedItem.type === 'pod') {
                    this.game.pod.x = target.x;
                    this.game.pod.y = target.y;
                }
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

    private distToSegment(p: Point, a: Point, b: Point): number {
        const l2 = this.dist(a, b) ** 2;
        if (l2 === 0) return this.dist(p, a);
        let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return this.dist(p, {
            x: a.x + t * (b.x - a.x),
            y: a.y + t * (b.y - a.y)
        });
    }

    private createPanel(): void {
        this.panel = document.createElement('div');
        this.panel.id = 'editor-panel';
        this.panel.innerHTML = `
            <h3>LEVEL EDITOR</h3>
            <div class="editor-info">Mode: Hybrid Edit</div>
            
            <div class="editor-section">
                <span>ADD ENTITY:</span>
                <div class="editor-actions">
                    <button id="add-poly-btn">+ POLYGON</button>
                    <button id="add-fan-btn" disabled style="opacity: 0.5">+ FAN (TBA)</button>
                </div>
            </div>

            <div class="editor-section">
                <span>PROJECT:</span>
                <div class="editor-actions">
                    <button id="export-btn">EXPORT CODE</button>
                    <button id="reset-cam-btn">RESET VIEW</button>
                </div>
            </div>

            <div class="editor-hint"><b>Drag</b>: Move handle / Pan space</div>
            <div class="editor-hint"><b>Click Line</b>: Add Vertex</div>
            <div class="editor-hint"><b>Ctrl + Click</b>: Delete Vertex</div>
            <div class="editor-hint"><b>Ctrl + Shift + Click</b>: Delete Shape/Entity</div>
            <div class="editor-hint"><b>Alt + E</b>: Toggle Editor</div>
        `;
        document.body.appendChild(this.panel);
        this.panel.style.display = 'none';

        document.getElementById('add-poly-btn')?.addEventListener('click', () => this.addPolygon());
        document.getElementById('export-btn')?.addEventListener('click', () => this.showExportDialog());
        document.getElementById('reset-cam-btn')?.addEventListener('click', () => this.resetCamera());
    }

    private addPolygon(): void {
        const level = levels[this.game.currentLevelIndex];
        const cx = this.game.cameraX + this.canvas.width / 2;
        const cy = this.game.cameraY + this.canvas.height / 2;
        
        // Spawn a default triangle
        const size = 50;
        const newPoly = {
            type: 'polygon' as const,
            points: [
                { x: Math.round(cx / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE, y: Math.round((cy - size) / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE },
                { x: Math.round((cx + size) / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE, y: Math.round((cy + size) / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE },
                { x: Math.round((cx - size) / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE, y: Math.round((cy + size) / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE }
            ],
            isSolid: true
        };
        
        level.terrain.push(newPoly);
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

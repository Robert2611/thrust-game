import { GameEngine } from '../core/game-engine';
import { Point, TerrainObject } from '../types';
import {
    EDITOR_DEFAULT_EXIT_RADIUS,
    EDITOR_DEFAULT_FAN_LENGTH,
    EDITOR_DEFAULT_FAN_SPEED,
    EDITOR_DEFAULT_FAN_WIDTH,
    EDITOR_DEFAULT_PLATFORM_WIDTH,
    EDITOR_DEFAULT_POLYGON_SIZE,
    EDITOR_GRID_SIZE,
    EDITOR_POINT_RADIUS
} from '../constants';
import { levels } from '../data/levels';
import {
    createEditorPanel,
    createExportOverlay,
    renderEntityInspector,
    renderFanInspector,
    renderPlatformInspector,
    renderVertexInspector
} from './level-editor-dom';

export class LevelEditor {
    private game: GameEngine;
    private canvas: HTMLCanvasElement;
    private isActive: boolean = false;
    
    public selectedItem: { 
        type: 'vertex' | 'ship' | 'pod' | 'exit' | 'platform' | 'fan', 
        shapeIndex?: number, 
        pointIndex?: number,
        index?: number 
    } | null = null;
    public isModified: boolean = false;
    public get currentLevel() { return levels[this.game.currentLevelIndex]; }

    private dragOffset: Point = { x: 0, y: 0 };
    private isDragging: boolean = false;
    private isPanning: boolean = false;
    private lastMouseScreenPos: Point = { x: 0, y: 0 };
    
    private panel: HTMLElement | null = null;
    private exportOverlay: HTMLElement | null = null;
    private inspectorSection: HTMLDivElement | null = null;
    private inspectorContent: HTMLDivElement | null = null;

    constructor(gameEngine: GameEngine, canvas: HTMLCanvasElement) {
        this.game = gameEngine;
        this.canvas = canvas;
        
        this.setupEventListeners();
        this.createPanel();
    }

    public toggle(): void {
        this.isActive = !this.isActive;
        if (this.panel) {
            this.panel.style.display = this.isActive ? 'block' : 'none';
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
                    this.isModified = true;
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
                    this.isModified = true;
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
                            this.isModified = true;
                            this.selectedItem = null;
                        } else if (isDelete) {
                            if (shape.points.length > 3) {
                                shape.points.splice(p, 1);
                                this.isModified = true;
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
                            this.isModified = true;
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
        this.updateInspector();
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
                const oldX = target.x;
                const oldY = target.y;
                target.x = Math.round((mousePos.x - this.dragOffset.x) / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE;
                target.y = Math.round((mousePos.y - this.dragOffset.y) / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE;
                
                if (target.x !== oldX || target.y !== oldY) {
                    this.isModified = true;
                }

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
        if (this.isDragging || this.isPanning) {
            this.isDragging = false;
            this.isPanning = false;
            this.updateInspector();
        }
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
        const panelElements = createEditorPanel();
        this.panel = panelElements.panel;
        this.inspectorSection = panelElements.inspectorSection;
        this.inspectorContent = panelElements.inspectorContent;

        document.body.appendChild(this.panel);
        this.panel.style.display = 'none';

        panelElements.addPolygonButton.addEventListener('click', () => this.addPolygon());
        panelElements.addPlatformButton.addEventListener('click', () => this.addPlatform());
        panelElements.addFanButton.addEventListener('click', () => this.addFan());
        panelElements.addShipButton.addEventListener('click', () => this.setShipStart());
        panelElements.addPodButton.addEventListener('click', () => this.setPodStart());
        panelElements.addExitButton.addEventListener('click', () => this.setExit());
        panelElements.exportButton.addEventListener('click', () => this.showExportDialog());
        panelElements.resetCameraButton.addEventListener('click', () => this.resetCamera());
    }

    private updateInspector(): void {
        if (!this.inspectorSection || !this.inspectorContent) return;

        if (!this.selectedItem) {
            this.inspectorSection.style.display = 'none';
            return;
        }

        this.inspectorSection.style.display = 'block';
        this.inspectorContent.replaceChildren();

        const level = levels[this.game.currentLevelIndex];
        
        if (this.selectedItem.type === 'fan') {
            const fan = (level.fans || [])[this.selectedItem.index!];
            if (!fan) return;

            renderFanInspector(this.inspectorContent, fan);

            const rotationInput = this.inspectorContent.querySelector('#prop-rot');
            const lengthInput = this.inspectorContent.querySelector('#prop-len');
            const widthInput = this.inspectorContent.querySelector('#prop-wid');
            const speedInput = this.inspectorContent.querySelector('#prop-spd');

            rotationInput?.addEventListener('input', (e) => {
                fan.rotation = (e.target as HTMLInputElement).valueAsNumber * Math.PI / 180;
                this.isModified = true;
            });
            lengthInput?.addEventListener('input', (e) => {
                fan.length = (e.target as HTMLInputElement).valueAsNumber;
                this.isModified = true;
            });
            widthInput?.addEventListener('input', (e) => {
                fan.width = (e.target as HTMLInputElement).valueAsNumber;
                this.isModified = true;
            });
            speedInput?.addEventListener('input', (e) => {
                fan.speed = (e.target as HTMLInputElement).valueAsNumber;
                this.isModified = true;
            });
        } else if (this.selectedItem.type === 'platform') {
            const plat = level.platforms[this.selectedItem.index!];
            renderPlatformInspector(this.inspectorContent, plat);
            this.inspectorContent.querySelector('#prop-wid')?.addEventListener('input', (e) => {
                plat.width = (e.target as HTMLInputElement).valueAsNumber;
                this.isModified = true;
            });
        } else if (this.selectedItem.type === 'vertex') {
            const shape = level.terrain[this.selectedItem.shapeIndex!];
            renderVertexInspector(this.inspectorContent, shape);
            this.inspectorContent.querySelector('#prop-solid')?.addEventListener('change', (e) => {
                shape.isSolid = (e.target as HTMLInputElement).checked;
                this.isModified = true;
            });
        } else {
            renderEntityInspector(this.inspectorContent, this.selectedItem.type);
        }
    }

    private addPolygon(): void {
        const level = levels[this.game.currentLevelIndex];
        const center = this.getSnappedScreenCenterWorldPos();
        
        // Spawn a default triangle
        const size = EDITOR_DEFAULT_POLYGON_SIZE;
        const newPoly = {
            type: 'polygon' as const,
            points: [
                { x: center.x, y: this.snapToGrid(center.y - size) },
                { x: this.snapToGrid(center.x + size), y: this.snapToGrid(center.y + size) },
                { x: this.snapToGrid(center.x - size), y: this.snapToGrid(center.y + size) }
            ],
            isSolid: true
        };
        
        level.terrain.push(newPoly);
        this.isModified = true;
    }

    private addPlatform(): void {
        const level = levels[this.game.currentLevelIndex];
        const center = this.getSnappedScreenCenterWorldPos();
        level.platforms.push({
            x: center.x,
            y: center.y,
            width: EDITOR_DEFAULT_PLATFORM_WIDTH
        });
        this.isModified = true;
    }

    private addFan(): void {
        const level = levels[this.game.currentLevelIndex];
        const center = this.getSnappedScreenCenterWorldPos();
        if (!level.fans) {
            level.fans = [];
        }
        level.fans.push({
            x: center.x,
            y: center.y,
            width: EDITOR_DEFAULT_FAN_WIDTH,
            length: EDITOR_DEFAULT_FAN_LENGTH,
            rotation: 0,
            speed: EDITOR_DEFAULT_FAN_SPEED
        });
        this.isModified = true;
    }

    private setShipStart(): void {
        const level = levels[this.game.currentLevelIndex];
        const center = this.getSnappedScreenCenterWorldPos();
        level.shipStart.x = center.x;
        level.shipStart.y = center.y;
        this.game.ship.x = center.x;
        this.game.ship.y = center.y;
        this.isModified = true;
    }

    private setPodStart(): void {
        const level = levels[this.game.currentLevelIndex];
        const center = this.getSnappedScreenCenterWorldPos();
        level.podStart.x = center.x;
        level.podStart.y = center.y;
        this.game.pod.x = center.x;
        this.game.pod.y = center.y;
        this.isModified = true;
    }

    private setExit(): void {
        const level = levels[this.game.currentLevelIndex];
        const center = this.getSnappedScreenCenterWorldPos();
        level.exit.x = center.x;
        level.exit.y = center.y;
        level.exit.radius = EDITOR_DEFAULT_EXIT_RADIUS;
        this.isModified = true;
    }

    private snapToGrid(value: number): number {
        return Math.round(value / EDITOR_GRID_SIZE) * EDITOR_GRID_SIZE;
    }

    private getSnappedScreenCenterWorldPos(): Point {
        return {
            x: this.snapToGrid(this.game.cameraX + this.canvas.width / 2),
            y: this.snapToGrid(this.game.cameraY + this.canvas.height / 2)
        };
    }

    private resetCamera(): void {
        // Trigger the original camera positioning by temporarily toggling off the editor smoothing
        // but for a dev tool, we can just snap it back to ship
        this.game.cameraX = this.game.ship.x - this.canvas.width / 2;
        this.game.cameraY = this.game.ship.y - this.canvas.height / 2;
    }

    public showExportDialog(): void {
        if (this.exportOverlay) this.exportOverlay.remove();

        const level = levels[this.game.currentLevelIndex];
        const code = this.generateLevelCode(level);

        const exportElements = createExportOverlay(code);
        this.exportOverlay = exportElements.overlay;

        document.body.appendChild(this.exportOverlay);
        this.exportOverlay.style.display = 'flex';

        exportElements.copyButton.addEventListener('click', () => {
            exportElements.textarea.select();
            navigator.clipboard.writeText(exportElements.textarea.value);
            exportElements.copyButton.innerText = 'COPIED!';
        });

        exportElements.closeButton.addEventListener('click', () => {
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

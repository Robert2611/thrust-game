import { Fan, Platform, TerrainObject } from '../types';

interface PropertyRowInputConfig {
    id: string;
    label: string;
    type: 'range' | 'number' | 'checkbox';
    value: string;
    min?: string;
    max?: string;
    step?: string;
}

export interface EditorPanelElements {
    panel: HTMLDivElement;
    inspectorSection: HTMLDivElement;
    inspectorContent: HTMLDivElement;
    addPolygonButton: HTMLButtonElement;
    exportButton: HTMLButtonElement;
    resetCameraButton: HTMLButtonElement;
}

export interface ExportOverlayElements {
    overlay: HTMLDivElement;
    textarea: HTMLTextAreaElement;
    copyButton: HTMLButtonElement;
    closeButton: HTMLButtonElement;
}

const HINT_LINES = [
    { action: 'Drag', description: 'Move handle / Pan space' },
    { action: 'Click Line', description: 'Add Vertex' },
    { action: 'Ctrl + Click', description: 'Delete Vertex' },
    { action: 'Ctrl + Shift + Click', description: 'Delete Shape/Entity' },
    { action: 'Alt + E', description: 'Toggle Editor' }
];

function createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    textContent?: string
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (textContent !== undefined) {
        element.textContent = textContent;
    }
    return element;
}

function createPropertyRow(config: PropertyRowInputConfig): HTMLDivElement {
    const row = createElement('div', 'prop-row');
    const label = createElement('label', undefined, config.label);
    label.setAttribute('for', config.id);
    row.appendChild(label);

    const input = createElement('input') as HTMLInputElement;
    input.id = config.id;
    input.type = config.type;

    if (config.type === 'checkbox') {
        input.checked = config.value === 'true';
    } else {
        input.value = config.value;
    }

    if (config.min) {
        input.min = config.min;
    }
    if (config.max) {
        input.max = config.max;
    }
    if (config.step) {
        input.step = config.step;
    }

    row.appendChild(input);
    return row;
}

function createSectionLabel(text: string): HTMLSpanElement {
    return createElement('span', undefined, text);
}

export function createEditorPanel(): EditorPanelElements {
    const panel = createElement('div') as HTMLDivElement;
    panel.id = 'editor-panel';

    const heading = createElement('h3', undefined, 'LEVEL EDITOR');
    panel.appendChild(heading);

    panel.appendChild(createElement('div', 'editor-info', 'Mode: Hybrid Edit'));

    const addSection = createElement('div', 'editor-section');
    addSection.appendChild(createSectionLabel('ADD ENTITY:'));
    const addActions = createElement('div', 'editor-actions');
    const addPolygonButton = createElement('button') as HTMLButtonElement;
    addPolygonButton.id = 'add-poly-btn';
    addPolygonButton.textContent = '+ POLYGON';
    const addFanButton = createElement('button') as HTMLButtonElement;
    addFanButton.id = 'add-fan-btn';
    addFanButton.textContent = '+ FAN (TBA)';
    addFanButton.disabled = true;
    addFanButton.style.opacity = '0.5';
    addActions.append(addPolygonButton, addFanButton);
    addSection.appendChild(addActions);
    panel.appendChild(addSection);

    const inspectorSection = createElement('div', 'editor-section') as HTMLDivElement;
    inspectorSection.id = 'inspector-section';
    inspectorSection.style.display = 'none';
    inspectorSection.appendChild(createSectionLabel('PROPERTIES:'));
    const inspectorContent = createElement('div') as HTMLDivElement;
    inspectorContent.id = 'inspector-content';
    inspectorSection.appendChild(inspectorContent);
    panel.appendChild(inspectorSection);

    const projectSection = createElement('div', 'editor-section');
    projectSection.appendChild(createSectionLabel('PROJECT:'));
    const projectActions = createElement('div', 'editor-actions');
    const exportButton = createElement('button') as HTMLButtonElement;
    exportButton.id = 'export-btn';
    exportButton.textContent = 'EXPORT CODE';
    const resetCameraButton = createElement('button') as HTMLButtonElement;
    resetCameraButton.id = 'reset-cam-btn';
    resetCameraButton.textContent = 'RESET VIEW';
    projectActions.append(exportButton, resetCameraButton);
    projectSection.appendChild(projectActions);
    panel.appendChild(projectSection);

    for (const line of HINT_LINES) {
        const hint = createElement('div', 'editor-hint') as HTMLDivElement;
        const action = createElement('b', undefined, line.action);
        hint.appendChild(action);
        hint.appendChild(document.createTextNode(`: ${line.description}`));
        panel.appendChild(hint);
    }

    return {
        panel,
        inspectorSection,
        inspectorContent,
        addPolygonButton,
        exportButton,
        resetCameraButton
    };
}

export function renderFanInspector(content: HTMLDivElement, fan: Fan): void {
    content.replaceChildren(
        createPropertyRow({
            id: 'prop-rot',
            label: 'Rot (deg)',
            type: 'range',
            value: String(Math.round((fan.rotation * 180) / Math.PI)),
            min: '0',
            max: '360'
        }),
        createPropertyRow({ id: 'prop-len', label: 'Length', type: 'number', value: String(fan.length), step: '10' }),
        createPropertyRow({ id: 'prop-wid', label: 'Width', type: 'number', value: String(fan.width), step: '5' }),
        createPropertyRow({ id: 'prop-spd', label: 'Speed', type: 'number', value: String(fan.speed), step: '0.5' })
    );
}

export function renderPlatformInspector(content: HTMLDivElement, platform: Platform): void {
    content.replaceChildren(
        createPropertyRow({ id: 'prop-wid', label: 'Width', type: 'number', value: String(platform.width), step: '10' })
    );
}

export function renderVertexInspector(content: HTMLDivElement, shape: TerrainObject): void {
    content.replaceChildren(
        createPropertyRow({
            id: 'prop-solid',
            label: 'Solid',
            type: 'checkbox',
            value: String(Boolean(shape.isSolid))
        })
    );
}

export function renderEntityInspector(content: HTMLDivElement, entityType: string): void {
    const row = createElement('div', 'prop-row');
    row.appendChild(createElement('span', undefined, `Entity: ${entityType.toUpperCase()}`));
    content.replaceChildren(row);
}

export function createExportOverlay(code: string): ExportOverlayElements {
    const overlay = createElement('div', 'overlay') as HTMLDivElement;
    overlay.id = 'export-overlay';

    const exportContent = createElement('div', 'export-content');
    exportContent.appendChild(createElement('h2', undefined, 'Export Level Code'));
    exportContent.appendChild(createElement('p', undefined, 'Copy and paste this into src/data/levels.ts'));

    const textarea = createElement('textarea') as HTMLTextAreaElement;
    textarea.id = 'export-textarea';
    textarea.readOnly = true;
    textarea.value = code;
    exportContent.appendChild(textarea);

    const actions = createElement('div', 'export-actions');
    const copyButton = createElement('button') as HTMLButtonElement;
    copyButton.id = 'copy-btn';
    copyButton.textContent = 'COPY TO CLIPBOARD';
    const closeButton = createElement('button') as HTMLButtonElement;
    closeButton.id = 'close-export-btn';
    closeButton.textContent = 'CLOSE';
    actions.append(copyButton, closeButton);
    exportContent.appendChild(actions);

    overlay.appendChild(exportContent);

    return {
        overlay,
        textarea,
        copyButton,
        closeButton
    };
}

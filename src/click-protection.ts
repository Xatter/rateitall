import { type ModifierKey, getModifierKey } from './platform';
export type { ModifierKey };
export { getModifierKey };

function isModifierHeld(e: { altKey: boolean; ctrlKey: boolean }, modifier: ModifierKey): boolean {
    return modifier === 'Alt' ? e.altKey : e.ctrlKey;
}

export function shouldInterceptMousedown(e: { altKey: boolean; ctrlKey: boolean; button: number }, modifier: ModifierKey): boolean {
    return isModifierHeld(e, modifier) && e.button === 0;
}

export function shouldInterceptMouseup(protectedDragActive: boolean): boolean {
    return protectedDragActive;
}

export function shouldInterceptClick(e: { altKey: boolean; ctrlKey: boolean }, modifier: ModifierKey): boolean {
    return isModifierHeld(e, modifier);
}

// Injected while the modifier is held to force text cursor and override
// user-select:none on cards (common on GrubHub and similar sites).
const selectionModeStyle = document.createElement('style');
selectionModeStyle.textContent = '* { cursor: text !important; user-select: text !important; }';

let protectedDragActive = false;

export function installClickProtection(): void {
    const modifier = getModifierKey();

    // Intercept both mouse AND pointer events — React and many modern sites
    // use pointer events, so stopping only mousedown isn't enough.
    const onDown = (e: MouseEvent | PointerEvent) => {
        if (shouldInterceptMousedown(e, modifier)) {
            protectedDragActive = true;
            e.stopPropagation();
            // Do NOT preventDefault — that would block text selection.
        }
    };

    const onUp = (e: MouseEvent | PointerEvent) => {
        if (shouldInterceptMouseup(protectedDragActive)) {
            protectedDragActive = false;
            e.stopPropagation();
        }
    };

    const onClickOrContextMenu = (e: MouseEvent) => {
        if (shouldInterceptClick(e, modifier)) {
            e.stopPropagation();
            e.preventDefault();
        }
    };

    window.addEventListener('mousedown', onDown, true);
    window.addEventListener('mouseup', onUp, true);
    window.addEventListener('pointerdown', onDown, true);
    window.addEventListener('pointerup', onUp, true);

    // Suppress the click that follows (prevents new tab, card navigation, etc.)
    window.addEventListener('click', onClickOrContextMenu, true);

    // Some sites preventDefault on selectstart to block text selection entirely.
    window.addEventListener('selectstart', (e: Event) => {
        if (protectedDragActive) e.stopPropagation();
    }, true);

    // Visual feedback: text cursor + unlock user-select while modifier is held.
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === modifier && !selectionModeStyle.isConnected) {
            document.head.appendChild(selectionModeStyle);
        }
    });

    document.addEventListener('keyup', (e: KeyboardEvent) => {
        if (e.key === modifier) selectionModeStyle.remove();
    });
}

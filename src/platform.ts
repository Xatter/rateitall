export type ModifierKey = 'Alt' | 'Control';

export function getModifierKey(): ModifierKey {
    return navigator.platform.startsWith('Linux') ? 'Control' : 'Alt';
}

// Human-readable label matching what's printed on the keycap
export function getModifierLabel(): string {
    if (navigator.platform.startsWith('Mac')) return 'Option (⌥)';
    if (navigator.platform.startsWith('Linux')) return 'Ctrl';
    return 'Alt';
}

import { getModifierKey, shouldInterceptMousedown, shouldInterceptMouseup, shouldInterceptClick } from './click-protection';

describe('getModifierKey', () => {
    const realPlatform = navigator.platform;
    afterEach(() => Object.defineProperty(navigator, 'platform', { value: realPlatform, configurable: true }));

    const setPlatform = (p: string) =>
        Object.defineProperty(navigator, 'platform', { value: p, configurable: true });

    it('returns Alt on Mac', () => {
        setPlatform('MacIntel');
        expect(getModifierKey()).toBe('Alt');
    });

    it('returns Alt on Windows', () => {
        setPlatform('Win32');
        expect(getModifierKey()).toBe('Alt');
    });

    it('returns Control on Linux', () => {
        setPlatform('Linux x86_64');
        expect(getModifierKey()).toBe('Control');
    });
});

// shouldInterceptMousedown also covers pointerdown — same shape
describe('shouldInterceptMousedown', () => {
    it('intercepts left-click when the correct modifier is held (Alt)', () => {
        expect(shouldInterceptMousedown({ altKey: true, ctrlKey: false, button: 0 }, 'Alt')).toBe(true);
    });

    it('intercepts left-click when the correct modifier is held (Control)', () => {
        expect(shouldInterceptMousedown({ altKey: false, ctrlKey: true, button: 0 }, 'Control')).toBe(true);
    });

    it('does not intercept when the wrong modifier is held', () => {
        expect(shouldInterceptMousedown({ altKey: true, ctrlKey: false, button: 0 }, 'Control')).toBe(false);
        expect(shouldInterceptMousedown({ altKey: false, ctrlKey: true, button: 0 }, 'Alt')).toBe(false);
    });

    it('does not intercept left-click with no modifier', () => {
        expect(shouldInterceptMousedown({ altKey: false, ctrlKey: false, button: 0 }, 'Alt')).toBe(false);
    });

    it('does not intercept right-click even with modifier', () => {
        expect(shouldInterceptMousedown({ altKey: true, ctrlKey: false, button: 2 }, 'Alt')).toBe(false);
    });
});

describe('shouldInterceptMouseup', () => {
    it('intercepts mouseup/pointerup when a protected drag is active', () => {
        expect(shouldInterceptMouseup(true)).toBe(true);
    });

    it('does not intercept mouseup/pointerup when no protected drag is active', () => {
        expect(shouldInterceptMouseup(false)).toBe(false);
    });
});

describe('shouldInterceptClick', () => {
    it('intercepts click when Alt is held', () => {
        expect(shouldInterceptClick({ altKey: true, ctrlKey: false }, 'Alt')).toBe(true);
    });

    it('intercepts click when Control is held', () => {
        expect(shouldInterceptClick({ altKey: false, ctrlKey: true }, 'Control')).toBe(true);
    });

    it('does not intercept normal click', () => {
        expect(shouldInterceptClick({ altKey: false, ctrlKey: false }, 'Alt')).toBe(false);
    });
});

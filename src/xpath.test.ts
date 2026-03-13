import { getPathTo } from './xpath';

describe('getPathTo', () => {
    it('returns id-based xpath for element with id', () => {
        document.body.innerHTML = '<div id="chicken-parm"><span>Chicken Parm</span></div>';
        const el = document.getElementById('chicken-parm')!;
        expect(getPathTo(el)).toBe('//*[@id="chicken-parm"]');
    });

    it('returns data-testid xpath when present', () => {
        document.body.innerHTML = '<div><span data-testid="menu-item-123">Chicken Parm</span></div>';
        const el = document.querySelector('[data-testid="menu-item-123"]') as HTMLElement;
        expect(getPathTo(el)).toBe('//SPAN[@data-testid="menu-item-123"]');
    });

    it('returns aria-label xpath when present', () => {
        document.body.innerHTML = '<div><button aria-label="Add Chicken Parm to cart">+</button></div>';
        const el = document.querySelector('[aria-label="Add Chicken Parm to cart"]') as HTMLElement;
        expect(getPathTo(el)).toBe('//BUTTON[@aria-label="Add Chicken Parm to cart"]');
    });

    it('falls back to positional xpath for element with no stable attributes', () => {
        document.body.innerHTML = '<div><span>Sushi</span><span>Thai</span></div>';
        const spans = document.querySelectorAll('span');
        const firstSpan = spans[0] as HTMLElement;
        const secondSpan = spans[1] as HTMLElement;
        expect(getPathTo(firstSpan)).toMatch(/SPAN\[1\]/);
        expect(getPathTo(secondSpan)).toMatch(/SPAN\[2\]/);
    });

    it('skips rate-it-all wrapper elements and uses their parent', () => {
        document.body.innerHTML = '<div id="item-456"><div rate-it-all="true"><span>Pizza</span></div></div>';
        const wrapper = document.querySelector('[rate-it-all]') as HTMLElement;
        expect(getPathTo(wrapper)).toBe('//*[@id="item-456"]');
    });

    it('returns BODY for the body element', () => {
        expect(getPathTo(document.body)).toBe('BODY');
    });

    it('prefers id over data-testid when both are present', () => {
        document.body.innerHTML = '<div id="item-1" data-testid="item-test">Food</div>';
        const el = document.getElementById('item-1')!;
        expect(getPathTo(el)).toBe('//*[@id="item-1"]');
    });

    it('prefers data-testid over aria-label', () => {
        document.body.innerHTML = '<div data-testid="item-test" aria-label="Chicken">Food</div>';
        const el = document.querySelector('[data-testid]') as HTMLElement;
        expect(getPathTo(el)).toBe('//DIV[@data-testid="item-test"]');
    });
});

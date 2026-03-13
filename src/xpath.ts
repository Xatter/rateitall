const STABLE_ATTRS = ['data-testid', 'data-id', 'data-item-id', 'aria-label', 'name'];

export function getPathTo(element: HTMLElement): string | undefined {
    if (element.id !== '') {
        return `//*[@id="${element.id}"]`;
    }
    if (element === document.body) {
        return element.tagName;
    }
    if (element.hasAttribute('rate-it-all')) {
        return getPathTo(element.parentNode as HTMLElement);
    }

    for (const attr of STABLE_ATTRS) {
        const value = element.getAttribute(attr);
        if (value !== null) {
            return `//${element.tagName}[@${attr}="${value}"]`;
        }
    }

    if (element.parentNode === null) {
        return undefined;
    }

    let ix = 0;
    const siblings = element.parentNode.childNodes;
    for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i] as HTMLElement;
        if (sibling === element) {
            return getPathTo(element.parentNode as HTMLElement) + '/' + element.tagName + '[' + (ix + 1) + ']';
        }
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
            ix++;
        }
    }
}

import { MessageType } from './types';

let navListener: ((details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) => void) | null = null;
const mockNavAddListener = jest.fn((cb: any) => { navListener = cb; });
const mockSendMessage = jest.fn();

(global as any).chrome = {
    runtime: {
        onInstalled: { addListener: jest.fn() },
        onMessage: { addListener: jest.fn() },
    },
    contextMenus: {
        create: jest.fn(),
        onClicked: { addListener: jest.fn() },
    },
    storage: { local: { set: jest.fn(), get: jest.fn().mockResolvedValue({}) } },
    tabs: { sendMessage: mockSendMessage },
    webNavigation: { onHistoryStateUpdated: { addListener: mockNavAddListener } },
};

// Import after chrome mock is set up
require('./background');

test('sends UrlChanged to the tab when SPA navigation occurs', () => {
    // navListener being set proves the addListener was called during background.ts init
    expect(navListener).not.toBeNull();
    navListener!({ tabId: 42, url: 'https://grubhub.com/restaurant/123' } as any);
    expect(mockSendMessage).toHaveBeenCalledWith(
        42,
        { type: MessageType.UrlChanged, url: 'https://grubhub.com/restaurant/123' },
        expect.any(Function)
    );
});

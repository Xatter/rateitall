import { MessageType, RatingType } from './types';

let navListener: ((details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) => void) | null = null;
let contextMenuListener: ((info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => void) | null = null;
let messageListener: ((message: any, sender: any, sendResponse: (response?: any) => void) => boolean | void) | null = null;

const mockNavAddListener = jest.fn((cb: any) => { navListener = cb; });
const mockContextMenuClickedAddListener = jest.fn((cb: any) => { contextMenuListener = cb; });
const mockMessageAddListener = jest.fn((cb: any) => { messageListener = cb; });
const mockTabsSendMessage = jest.fn();
const mockStorageGet = jest.fn().mockResolvedValue({});
const mockStorageSet = jest.fn().mockResolvedValue(undefined);
const mockStorageClear = jest.fn();

(global as any).chrome = {
    runtime: {
        onInstalled: { addListener: jest.fn() },
        onMessage: { addListener: mockMessageAddListener },
        lastError: null,
    },
    contextMenus: {
        create: jest.fn(),
        onClicked: { addListener: mockContextMenuClickedAddListener },
    },
    storage: { local: { set: mockStorageSet, get: mockStorageGet, clear: mockStorageClear } },
    tabs: { sendMessage: mockTabsSendMessage },
    webNavigation: { onHistoryStateUpdated: { addListener: mockNavAddListener } },
};

// Import after chrome mock is set up
require('./background');

beforeEach(() => {
    mockTabsSendMessage.mockReset();
    mockStorageGet.mockReset().mockResolvedValue({});
    mockStorageSet.mockReset().mockResolvedValue(undefined);
    mockStorageClear.mockReset();
});

test('sends UrlChanged to the tab when SPA navigation occurs', () => {
    expect(navListener).not.toBeNull();
    navListener!({ tabId: 42, url: 'https://grubhub.com/restaurant/123' } as any);
    expect(mockTabsSendMessage).toHaveBeenCalledWith(
        42,
        { type: MessageType.UrlChanged, url: 'https://grubhub.com/restaurant/123' },
        expect.any(Function)
    );
});

test('context menu sendMessage does not throw when content script is unavailable', () => {
    expect(contextMenuListener).not.toBeNull();

    // Simulate chrome.tabs.sendMessage throwing (content script not loaded)
    mockTabsSendMessage.mockImplementation(() => {
        throw new Error('Could not establish connection. Receiving end does not exist.');
    });

    expect(() => {
        contextMenuListener!(
            { menuItemId: 'rate-it-all' } as any,
            { id: 99 } as chrome.tabs.Tab
        );
    }).not.toThrow();
});

test('Rated sendMessage to content script does not throw when tab is gone', async () => {
    expect(messageListener).not.toBeNull();

    const currentSelection = {
        type: MessageType.Selection,
        url: 'https://example.com',
        path: '//*[@id="item"]',
        text: 'Test item',
    };
    mockStorageGet.mockResolvedValue({ currentSelection });

    // Simulate chrome.tabs.sendMessage throwing (tab closed)
    mockTabsSendMessage.mockImplementation(() => {
        throw new Error('Could not establish connection. Receiving end does not exist.');
    });

    const sendResponse = jest.fn();

    // This should not throw even when tabs.sendMessage throws
    messageListener!(
        { type: MessageType.Rating, url: 'https://example.com', rating: 5, note: 'Great' },
        { tab: { id: 42 } },
        sendResponse
    );

    // Wait for the async handler to complete
    await new Promise(r => setTimeout(r, 50));

    // sendResponse should still be called despite the sendMessage error
    expect(sendResponse).toHaveBeenCalled();
});

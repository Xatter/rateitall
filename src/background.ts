import { AppMessage, MessageType, PageRatings, RatingData, RatingType, SelectElementMessage, UrlChangedMessage } from "./types";

console.log("[background.js] Loaded");

// SPA navigation: fire when any tab changes URL via the History API
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    const msg: UrlChangedMessage = { type: MessageType.UrlChanged, url: details.url };
    chrome.tabs.sendMessage(details.tabId, msg, () => { void chrome.runtime.lastError; });
});

// Register the right-click context menu item once on install
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "rate-it-all",
        title: "Rate It!",
        contexts: ["selection"]
    });
});

// Context menu click → tell the content script to show the rating widget
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "rate-it-all" && tab?.id) {
        try {
            chrome.tabs.sendMessage(tab.id, { type: MessageType.ShowRatingWidget }, () => { void chrome.runtime.lastError; });
        } catch { /* content script not available */ }
    }
});

chrome.runtime.onMessage.addListener((m: AppMessage, sender, sendResponse) => {
    switch (m.type) {
        case MessageType.Selection:
            chrome.storage.local.set({ currentSelection: m });
            break;

        case MessageType.Rating: {
            (async () => {
                const selStorage = await chrome.storage.local.get("currentSelection");
                const currentSelection: SelectElementMessage = selStorage.currentSelection;
                if (!currentSelection) { sendResponse(null); return; }

                const url = currentSelection.url;
                const data: RatingData = {
                    rating: m.rating,
                    note: m.note,
                    text: currentSelection.text
                };

                const stored = await chrome.storage.local.get(url);
                const existing: PageRatings = stored[url] ?? {};
                const isUpdate = existing[currentSelection.path] !== undefined;

                await chrome.storage.local.set({
                    [url]: { ...existing, [currentSelection.path]: data }
                });

                const responseMessage = {
                    type: MessageType.Rated,
                    ratingType: isUpdate ? RatingType.Updated : RatingType.Added,
                    url,
                    path: currentSelection.path,
                    data
                };

                // Push the Rated message to the content script so it can render the badge
                if (sender.tab?.id) {
                    try {
                        chrome.tabs.sendMessage(sender.tab.id, responseMessage, () => { void chrome.runtime.lastError; });
                    } catch { /* tab closed or content script unloaded */ }
                }

                sendResponse(responseMessage);
            })();
            return true; // keep message channel open for async sendResponse
        }

        case MessageType.RatingsQuery: {
            chrome.storage.local.get(m.url).then(stored => {
                sendResponse(stored[m.url] ?? null);
            });
            return true;
        }

        case MessageType.ClearRatings:
            chrome.storage.local.clear();
            break;
    }
});

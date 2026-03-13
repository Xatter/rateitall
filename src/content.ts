import { PageRatings, AppMessage, MessageType, RatingType, RatingData, RatingMessage } from "./types";
import { getPathTo } from "./xpath";

const MAX_RETRY_ATTEMPTS = 20;

// Last captured selection, updated on every mouseup and contextmenu
let currentSelection: { path: string; text: string; rect: DOMRect } | null = null;
let ratingWidget: HTMLElement | null = null;

function captureSelection(): { path: string; text: string; rect: DOMRect } | null {
    const sel = document.getSelection();
    if (!sel || !sel.toString().trim() || !sel.rangeCount) return null;
    const focusNode = sel.focusNode;
    if (!focusNode?.parentElement) return null;
    const path = getPathTo(focusNode.parentElement);
    if (!path) return null;
    return { path, text: sel.toString().trim(), rect: sel.getRangeAt(0).getBoundingClientRect() };
}

// Capture text selections on mouseup (general tracking)
document.addEventListener("mouseup", () => {
    const captured = captureSelection();
    if (!captured) return;
    currentSelection = captured;
    chrome.runtime.sendMessage(
        { type: MessageType.Selection, url: document.location.href, path: captured.path, text: captured.text },
        () => { void chrome.runtime.lastError; /* suppress "no listener" errors */ }
    );
});

// Snapshot the selection on contextmenu — this fires before the user clicks any
// menu item, so the text selection is guaranteed to still be active. By the time
// ShowRatingWidget arrives, Chrome has already cleared the selection.
document.addEventListener("contextmenu", () => {
    const captured = captureSelection();
    if (captured) currentSelection = captured;
});

// Messages from the background service worker
chrome.runtime.onMessage.addListener((message: AppMessage) => {
    switch (message.type) {
        case MessageType.ShowRatingWidget: {
            // Re-query the live selection — it's still active when the context menu fires,
            // and this gives us a fresh rect even if the page was scrolled since mouseup.
            const live = captureSelection();
            console.debug('[rate-it-all] ShowRatingWidget — live selection:', live, 'stored:', currentSelection);
            if (live) {
                showRatingWidget(live);
            } else if (currentSelection) {
                // Fallback to the last stored selection
                showRatingWidget(currentSelection);
            }
            break;
        }
        case MessageType.Rated:
            addRatingWhenReady(message.path, message.data);
            hideRatingWidget();
            break;
    }
});

// ── Floating rating widget ─────────────────────────────────────────────────

function showRatingWidget(sel: { path: string; text: string; rect: DOMRect }) {
    hideRatingWidget();

    const widget = document.createElement("div");
    widget.id = "rate-it-all-widget";
    widget.setAttribute("rate-it-all", "true");

    const { bottom, left } = sel.rect;
    widget.style.cssText = `
        position: fixed;
        top: ${Math.min(bottom + 8, window.innerHeight - 280)}px;
        left: ${Math.min(Math.max(8, left), window.innerWidth - 320)}px;
        z-index: 2147483647;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 10px;
        padding: 14px 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.18);
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        width: 280px;
        box-sizing: border-box;
    `;

    // Selected text label
    const label = document.createElement("div");
    label.style.cssText = "font-weight: 600; margin-bottom: 10px; color: #222; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;";
    label.title = sel.text;
    label.textContent = sel.text;
    widget.appendChild(label);

    // Stars
    let selectedRating = 0;
    const starsContainer = document.createElement("div");
    starsContainer.style.cssText = "display: flex; gap: 4px; margin-bottom: 10px; cursor: pointer;";

    const stars: HTMLSpanElement[] = [];

    function highlightStars(upTo: number) {
        stars.forEach((s, idx) => {
            s.textContent = idx < upTo ? "★" : "☆";
            s.style.color = idx < upTo ? "#f5a623" : "#bbb";
        });
    }

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement("span");
        star.textContent = "☆";
        star.style.cssText = "font-size: 28px; color: #bbb; transition: color 0.1s; line-height: 1; user-select: none;";
        star.addEventListener("mouseover", () => highlightStars(i));
        star.addEventListener("mouseout", () => highlightStars(selectedRating));
        star.addEventListener("click", () => {
            selectedRating = i;
            highlightStars(i);
        });
        stars.push(star);
        starsContainer.appendChild(star);
    }
    widget.appendChild(starsContainer);

    // Notes
    const notes = document.createElement("textarea");
    notes.placeholder = "Notes (optional)...";
    notes.style.cssText = "width: 100%; box-sizing: border-box; border: 1px solid #ddd; border-radius: 6px; padding: 7px 9px; font-size: 13px; font-family: inherit; resize: vertical; min-height: 56px; margin-bottom: 10px; outline: none;";
    widget.appendChild(notes);

    // Buttons
    const buttonRow = document.createElement("div");
    buttonRow.style.cssText = "display: flex; gap: 8px; justify-content: flex-end;";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.cssText = "padding: 6px 14px; border: 1px solid #ccc; border-radius: 6px; cursor: pointer; background: #fff; font-size: 13px;";
    cancelBtn.addEventListener("click", hideRatingWidget);

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.style.cssText = "padding: 6px 14px; border: none; border-radius: 6px; cursor: pointer; background: #4CAF50; color: #fff; font-weight: 600; font-size: 13px;";
    saveBtn.addEventListener("click", () => {
        if (selectedRating === 0) {
            label.style.color = "#cc0000";
            label.textContent = "Pick a star rating first";
            setTimeout(() => { label.style.color = "#222"; label.textContent = sel.text; }, 2000);
            return;
        }
        const msg: RatingMessage = {
            type: MessageType.Rating,
            url: document.location.href,
            rating: selectedRating,
            note: notes.value.trim()
        };
        chrome.runtime.sendMessage(msg, () => { void chrome.runtime.lastError; });
    });

    buttonRow.appendChild(cancelBtn);
    buttonRow.appendChild(saveBtn);
    widget.appendChild(buttonRow);

    document.body.appendChild(widget);
    ratingWidget = widget;

    // Focus the notes field so the user can start typing immediately after starring
    notes.addEventListener("click", (e) => e.stopPropagation());
}

function hideRatingWidget() {
    ratingWidget?.remove();
    ratingWidget = null;
}

// Close on outside click
document.addEventListener("mousedown", (e) => {
    if (ratingWidget && !ratingWidget.contains(e.target as Node)) {
        hideRatingWidget();
    }
});

// ── Inline rating badges ───────────────────────────────────────────────────

function addRatingBadge(element: Node, data: RatingData) {
    if (!(element instanceof HTMLElement)) return;

    // Don't double-wrap
    if (element.parentElement?.hasAttribute("rate-it-all")) return;

    const wrapper = document.createElement("span");
    wrapper.setAttribute("rate-it-all", "true");
    wrapper.style.cssText = "display: inline-block;";

    const badge = document.createElement("span");
    badge.style.cssText = "display: block; font-size: 11px; line-height: 1; margin-bottom: 2px; color: #555;";
    badge.textContent = "★".repeat(data.rating) + "☆".repeat(5 - data.rating);
    if (data.note) {
        badge.title = data.note;
        badge.style.cursor = "help";
    }

    element.parentElement?.insertBefore(wrapper, element);
    wrapper.appendChild(badge);
    wrapper.appendChild(element);
}

function addRatingWhenReady(xpath: string, data: RatingData) {
    let attempts = 0;
    const interval = setInterval(() => {
        if (++attempts >= MAX_RETRY_ATTEMPTS) {
            clearInterval(interval);
            return;
        }

        const result = document.evaluate(xpath, document.body, null, XPathResult.ANY_TYPE, null);

        switch (result.resultType) {
            case XPathResult.FIRST_ORDERED_NODE_TYPE:
                clearInterval(interval);
                if (result.singleNodeValue) addRatingBadge(result.singleNodeValue, data);
                break;
            case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
            case XPathResult.ORDERED_NODE_ITERATOR_TYPE: {
                let node: Node | null;
                while ((node = result.iterateNext())) {
                    clearInterval(interval);
                    addRatingBadge(node, data);
                }
                break;
            }
            case XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
            case XPathResult.ORDERED_NODE_SNAPSHOT_TYPE:
                for (let i = 0; i < result.snapshotLength; i++) {
                    clearInterval(interval);
                    const item = result.snapshotItem(i);
                    if (item) addRatingBadge(item, data);
                }
                break;
        }
    }, 500);
}

// On page load, restore all saved ratings for this URL
window.addEventListener('load', () => {
    chrome.runtime.sendMessage(
        { type: MessageType.RatingsQuery, url: document.location.href },
        (ratings: PageRatings | null) => {
            if (chrome.runtime.lastError) return; // extension not ready
            if (!ratings) return;
            Object.entries(ratings).forEach(([xpath, data]) => {
                addRatingWhenReady(xpath, data);
            });
        }
    );
});

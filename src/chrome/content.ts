import { ChromeMessage, MessageType, Sender } from "../types";

const messagesListener = (message: ChromeMessage, sender: any, response: any) => {
    console.log('[content.js]. Message received', {
        message,
        sender
    });
}

function getPathTo(element: HTMLElement): string | undefined {
    if (element.id !== '')
        return '//*[@id="' + element.id + '"]';
    if (element === document.body)
        return element.tagName;

    var ix = 0;
    if(element.parentNode !== null && element.parentNode.children !== null) {
        var siblings = element.parentNode.childNodes;
        for (var i = 0; i < siblings.length; i++) {
            var sibling = <HTMLElement>siblings[i];
            if (sibling === element)
                return getPathTo(<HTMLElement>element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
                ix++;
        }
    }
}

chrome.runtime.onMessage.addListener(messagesListener);

document.addEventListener("mouseup", (_) => {
    let selection = document.getSelection();
    if (selection === null) {
        return;
    }

    if (selection.focusNode !== null && selection.focusNode.parentElement !== null) {
        let path = getPathTo(selection.focusNode.parentElement)

        chrome.runtime.sendMessage(
            {
                from: Sender.Content,
                type: MessageType.Selection,
                messagage: {
                    url: document.location.href,
                    path: path,
                    text: selection.toString()
                }
            }
        )
    }
}, )
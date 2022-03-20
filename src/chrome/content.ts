import { AppMessage, MessageType } from "../types";

const messagesListener = (message: AppMessage, sender: any, response: any) => {
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
    if (element.hasAttribute("rate-it-all"))
        return getPathTo(<HTMLElement>element.parentNode);

    var ix = 0;
    if (element.parentNode !== null && element.parentNode.children !== null) {
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
                type: MessageType.Selection,
                url: document.location.href,
                path: path,
                text: selection.toString()
            }
        )
    }
})

let getResultsQueryMessage = {
    type: MessageType.RatingsQuery,
    url: document.location.href
};

browser.runtime.sendMessage(getResultsQueryMessage).then(r => {
    console.log("Results:", r);
    Object.keys(r).forEach(key => {
        let element = document.evaluate(key, document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (element !== null) {
            const div = document.createElement("div");
            div.setAttribute("rate-it-all", "true");
            element.parentElement?.appendChild(div);

            const span = document.createElement("span");
            span.innerText = r[key];
            div.appendChild(span);
            div.appendChild(element);
        }
    })
});

// document.evaluate('//*[@id="__next"]/MAIN[1]/DIV[2]/DIV[1]/DIV[1]/H1[1]', document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
import { PageRatings, AppMessage, MessageType, RatingType } from "./types";


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

chrome.runtime.onMessage.addListener((message: AppMessage, sender: any, response: any) => {
    console.debug('[content.js]. Message received', {
        message,
        sender
    });

    switch(message.type) {
        case MessageType.Selection:
            break;
        case MessageType.Rated:
            if(message.ratingType === RatingType.Added) {
                addRatingWhenReady(message.path, message.rating);
            }
            break;
        default:
            console.error("[content.js] Unknown message", message);
    }
});

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

function replaceSingleElement(element : Node | null, rating : number) {
    if (element !== null) {
        // const observer = new MutationObserver((mutations : MutationRecord[], observer:MutationObserver) => {
        //     for(const mutation of mutations) {
        //         console.debug("Mutation:", mutation);
        //     }
        // });

        // observer.observe(element);

        const div = document.createElement("div");
        div.setAttribute("rate-it-all", "true");
        div.className = "rate-it-all";

        const starsDiv = document.createElement("div");
        div.appendChild(starsDiv);
        for (var i = 0; i < 5; i++) {
            const star = document.createElement("img");
            if (rating > i) {
                star.setAttribute("src", browser.runtime.getURL("solid-star.svg"));
            } else {
                star.setAttribute("src", browser.runtime.getURL("star.svg"));
            }

            star.setAttribute("style", "display:inline;height:10px;width:10px;color:yellow");
            star.style.fill = "#fff";
            starsDiv.appendChild(star)
        }

        element.parentElement?.insertBefore(div, element);
        div.appendChild(element);
    } 
}

function addRatingWhenReady(xpath: string, rating: number) {
    const isReadyInterval = setInterval(() => {
        let xpathResult = document.evaluate(xpath, document.body, null, XPathResult.ANY_TYPE, null);
        console.debug(xpathResult);

        switch(xpathResult.resultType) {
            case XPathResult.FIRST_ORDERED_NODE_TYPE:
                clearInterval(isReadyInterval);
                replaceSingleElement(xpathResult.singleNodeValue, rating);
                break;
            case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
            case XPathResult.ORDERED_NODE_ITERATOR_TYPE:
                var node : Node | null = null;
                while(node = xpathResult.iterateNext()) {
                    console.debug("Node: ", node);
                    console.debug("Clearing Interval", isReadyInterval);
                    clearInterval(isReadyInterval);
                    replaceSingleElement(node, rating);
                }
                break;
            case xpathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
            case xpathResult.ORDERED_NODE_SNAPSHOT_TYPE:
                for(var i = 0;i<xpathResult.snapshotLength;i++) {
                    clearInterval(isReadyInterval);
                    replaceSingleElement(xpathResult.snapshotItem(i), rating);
                }
                break;
        default:
            console.error("Unhandled xpath result type", xpathResult.resultType);
        }
    }, 500);
    console.debug("Setting Interval", isReadyInterval);
}

window.addEventListener('load', async () => {
    let getResultsQueryMessage = {
        type: MessageType.RatingsQuery,
        url: document.location.href
    };

    let ratings : PageRatings = await browser.runtime.sendMessage(getResultsQueryMessage);
    console.log("Results:", ratings);

    if(ratings === undefined) return;
    Object.keys(ratings).forEach(xpath => {
        addRatingWhenReady(xpath, ratings[xpath])
    });
});

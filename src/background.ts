import { AppMessage, MessageType, PageRatings, RatedMessage, Ratings, RatingType, SelectElementMessage } from "./types";

console.log("[background.js] Loaded");

chrome.runtime.onMessage.addListener(async (m: AppMessage, sender: any, _) => {
    // console.debug(m);

    switch (m.type) {
        case MessageType.Rated:
            // ignore
            break;
        case MessageType.Selection:
            if (sender.envType === "addon_child") return;
            console.log("Selected: ", m.path);

            //TODO: Store this path in the storage API because this script gets reloaded all the time so can't maintain in-memory copy
            await browser.storage.local.set({ "currentSelection": m });
            break;
        case MessageType.Rating:
            {
                let currentSelectionStorage = await browser.storage.local.get("currentSelection");
                let currentSelection: SelectElementMessage = currentSelectionStorage.currentSelection;
                let url = currentSelection.url;

                // Upsert
                let allRatings: Ratings = await browser.storage.local.get(url);
                if (allRatings[url] === undefined) {
                    await browser.storage.local.set({ [url]: { [currentSelection.path]: m.rating } });

                    let responseMessage = 
                    {
                        type: MessageType.Rated,
                        ratingType: RatingType.Added,
                        url: url,
                        path: currentSelection.path,
                        rating: m.rating
                    };

                    browser.runtime.sendMessage(responseMessage);
                    return responseMessage;
                }

                console.log("Current: ", allRatings[url]);
                let updatedRatings: PageRatings = {
                    ...allRatings[url],
                    [currentSelection.path]: m.rating
                }

                console.log("Updated: ", updatedRatings);

                await browser.storage.local.set({ [url]: updatedRatings });

                let responseMessage =
                {
                    type: MessageType.Rated,
                    ratingType: allRatings[url][currentSelection.path] === undefined ? RatingType.Added : RatingType.Updated,
                    url: url,
                    path: currentSelection.path,
                    rating: m.rating
                };

                browser.runtime.sendMessage(responseMessage);
                return responseMessage;
            }
        case MessageType.RatingsQuery:
            {
                let url = m.url
                let savedRatings: Ratings = await browser.storage.local.get(url);
                console.log("Retrieved ratings: ", savedRatings[url]);
                return savedRatings[url];
            }
        default:
            console.error("Unknown message received");
    }
});
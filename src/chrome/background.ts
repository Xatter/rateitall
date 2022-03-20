import { AppMessage, MessageType } from "../types";

console.log("[background.js] Loaded");

chrome.runtime.onMessage.addListener( async (m:AppMessage, sender : any, response) => {
    // console.debug(m);

    if(m.type === MessageType.Selection) {
        if(sender.envType === "addon_child") return;
        console.log("Selected: ", m.path);

        //TODO: Store this path in the storage API because this script gets reloaded all the time so can't maintain in-memory copy
        await browser.storage.local.set({"currentSelection": m.path});
    } else if (m.type === MessageType.Rating) {
        const queryInfo = { active: true, lastFocusedWindow: true };

        let tabs = await browser.tabs.query(queryInfo);
        if (tabs[0] === undefined || tabs[0].url === undefined) {
            console.error("could not get URL when trying to set rating. Rating not saved");
            return;
        } else {
            let url = tabs[0].url;
            let currentSelectionStorage = await browser.storage.local.get("currentSelection");
            let currentSelection = currentSelectionStorage.currentSelection;

            // Upsert
            let allRatings = await browser.storage.local.get(url);
            if(allRatings[url] === undefined) {
                await browser.storage.local.set({[url]: {[currentSelection]:m.rating}});
                return;
            }

            allRatings[url][currentSelection] = m.rating;
            await browser.storage.local.set({[url]: allRatings[url][currentSelection]});
        }
    } else if (m.type === MessageType.RatingsQuery) {
        const queryInfo = { active: true, lastFocusedWindow: true };
        let tabs = await browser.tabs.query(queryInfo);
        if (tabs[0] === undefined || tabs[0].url === undefined) {
            console.error("could not get URL when trying to set rating. Rating not saved");
            return;
        } else {
            let url = tabs[0].url;
            let savedRatings = await browser.storage.local.get(url);
            console.log("Saved Ratings: ", savedRatings);
        }
    } else {
        console.error("Unknown message received");
    }
});
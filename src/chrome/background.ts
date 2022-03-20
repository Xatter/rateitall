import { AppMessage, MessageType } from "../types";

console.log("[background.js] Loaded");

// chrome.runtime.onMessage.addListener((m:ChromeMessage, sender : chrome.runtime.MessageSender, response) => {
chrome.runtime.onMessage.addListener((m:AppMessage, sender : any, response) => {
    console.debug(m);

    if(m.type === MessageType.Selection) {
        if(sender.envType === "addon_child") return;
        console.log("Selected: ", m.path);

        //TODO: Store this path in the storage API because this script gets reloaded all the time so can't maintain in-memory copy
    } else if (m.type === MessageType.Rating) {
        console.log('New Rating:', m.rating);
    } else {
        console.error("Unknown message received");
    }
});
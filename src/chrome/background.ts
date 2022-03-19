import { ChromeMessage, MessageType, RatingMessage, SelectElementMessage } from "../types";

var currentSelection = "";

console.log("[background.js] Loaded");

chrome.runtime.onMessage.addListener((m:ChromeMessage, _, response) => {
    console.debug(m);
    if(m.type === MessageType.Selection) {
        let message = <SelectElementMessage>m.message;
        currentSelection = message.path;
        console.log("Selected: ", message.path);
    } else if (m.type === MessageType.Rating) {
        let message = <RatingMessage>m.message;
        console.log('New Rating:', message.rating);
    }
});
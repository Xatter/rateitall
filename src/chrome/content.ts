import { ChromeMessage, Sender } from "../types";

const messagesFromReactAppListener = (message: ChromeMessage, sender:any, response : any) => {
    console.log('[content.js]. Message received', {
        message,
        sender
    });

    if(
        sender.id === chrome.runtime.id &&
        message.from === Sender.React &&
        message.message === 'Hello from React') {
            response('Hello from content.js');
        }
}

chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
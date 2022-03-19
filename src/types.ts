export enum Sender {
    React,
    Content
}

export enum MessageType {
    Selection,
    Rating
}

export interface SelectElementMessage {
    url : string,
    path : string,
    text : string
}

export interface RatingMessage {
    url : string,
    rating : Number
}

export interface ChromeMessage {
    from: Sender,
    type: MessageType,
    message: SelectElementMessage | RatingMessage
}
export enum MessageType {
    Selection,
    Rating,
    RatingsQuery
}

export type SelectElementMessage = {
    type : MessageType.Selection
    url : string
    path : string
    text : string
}

export type RatingMessage = {
    type: MessageType.Rating
    url : string
    rating : Number
}

export type RatingsQueryMessage = {
    type: MessageType.RatingsQuery
}

export type AppMessage = SelectElementMessage | RatingMessage | RatingsQueryMessage;
export type PageRatings = {[xpath: string]: number};
export type Ratings = {[url: string]: PageRatings};

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
    rating : number
}

export type RatingsQueryMessage = {
    type: MessageType.RatingsQuery
    url: string
}

export type AppMessage = SelectElementMessage | RatingMessage | RatingsQueryMessage;
export type RatingData = { rating: number; note: string; text: string };
export type PageRatings = { [xpath: string]: RatingData };
export type Ratings = { [url: string]: PageRatings };

export enum MessageType {
    Selection,
    Rating,
    RatingsQuery,
    Rated,
    ClearRatings,
    ShowRatingWidget
}

export enum RatingType {
    Added,
    Updated
}

export type SelectElementMessage = {
    type: MessageType.Selection;
    url: string;
    path: string;
    text: string;
};

export type RatingMessage = {
    type: MessageType.Rating;
    url: string;
    rating: number;
    note: string;
};

export type RatedMessage = {
    type: MessageType.Rated;
    ratingType: RatingType;
    url: string;
    path: string;
    data: RatingData;
};

export type RatingsQueryMessage = {
    type: MessageType.RatingsQuery;
    url: string;
};

export type ClearRatingsMessage = {
    type: MessageType.ClearRatings;
};

export type ShowRatingWidgetMessage = {
    type: MessageType.ShowRatingWidget;
};

export type AppMessage =
    | SelectElementMessage
    | RatingMessage
    | RatingsQueryMessage
    | RatedMessage
    | ClearRatingsMessage
    | ShowRatingWidgetMessage;

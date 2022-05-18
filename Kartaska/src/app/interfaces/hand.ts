import { Card } from "./card";

export interface Hand {
    userUUID: string,
    cards: Card[],
}

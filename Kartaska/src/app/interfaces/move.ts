import { Card } from "./card";

export interface Move {
    card: Card;
    userUUID: string;
    moveUUID?: string;
}

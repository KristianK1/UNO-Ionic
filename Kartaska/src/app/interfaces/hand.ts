import { Card } from "./card";
import { User } from "./user";

export interface Hand {
    cards: Card[],
    user: User,
}

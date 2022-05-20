import { Card } from "./card";

export interface AvailableMoves {
    validCards: Card[];
    
    drawN: number;
    fakeCard: Card;
    reverseOrder?: boolean;
    forceSkip?: boolean;
}

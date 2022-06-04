import { GameStat } from "./game-stat";
import { Hand } from "./hand";
import { Card } from "./card";
import { Move } from "./move";

export interface Game {
    moves: Move[],
    gameStat: GameStat,
    gameUUID: string,
    unUsedDeck: Card[],
    // usedDeck: Card[],
    playerCards: Hand[],
    direction: boolean;
}

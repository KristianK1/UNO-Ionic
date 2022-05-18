import { GameStat } from "./game-stat";
import { Hand } from "./hand";
import { Card } from "./card";

export interface Game {
    moves: Card[],
    gameStat: GameStat,
    gameUUID: string,
    cardOrder: Card[],
    playerCards: Hand[],
    direction: boolean;
}

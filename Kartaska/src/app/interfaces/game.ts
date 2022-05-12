import { GameStat } from "./game-stat";
import { Card } from "./card";
import { User } from "./user";

export interface Game {
    moves: Card[],
    gameStat: GameStat,
    gameUUID: string;
    cardOrder: number[];
}

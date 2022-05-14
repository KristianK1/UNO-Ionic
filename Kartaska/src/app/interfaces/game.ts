import { GameStat } from "./game-stat";
import { Hand } from "./hand";
import { StringFormat } from "@angular/fire/compat/storage/interfaces";

export interface Game {
    moves: number[],
    gameStat: GameStat,
    gameUUID: StringFormat,
    cardOrder: number[],
    playerCards: Hand[],
}

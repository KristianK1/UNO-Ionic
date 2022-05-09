import { GameStat } from "./game-stat";
import { Move } from "./move";
import { User } from "./user";

export interface Game {
    moves: Move[],
    activePlayers: User[],
    gameStat: GameStat,
}

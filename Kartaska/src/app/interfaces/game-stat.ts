import { User } from "./user";

export interface GameStat {
    gameUUID: string,
    gameStarted: string,
    gameEnded: string,
    reasonForEnd: string,
    winner: string,
    players: User[],
    gameAdmin: string,
}

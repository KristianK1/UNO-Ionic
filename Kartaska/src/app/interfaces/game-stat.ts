import { User } from "./user";

export interface GameStat {
    gameStarted?: string,
    gameEnded?: string,
    reasonForEnd?: string,
    winner: string,
    players?: User[],
    gameAdmin: string,
}

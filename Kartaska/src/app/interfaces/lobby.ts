import { GameStat } from "./game-stat";
import { Message } from "./message";
import { User } from "./user";

export interface Lobby {
    lobbyUUID: string,
    lobbyName: string,
    lobbyPassword: string,
    players: User[], 
    gameUUID: string,
    previusGameStat: GameStat[],
    adminUUID: string,
    chatUUID: string,
} 
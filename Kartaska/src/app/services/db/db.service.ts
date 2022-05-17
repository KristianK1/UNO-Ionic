import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';

import { getDatabase, ref, set, Database, onValue, child, get, Unsubscribe } from "firebase/database";
import { BehaviorSubject } from 'rxjs';
import { Game } from 'src/app/interfaces/game';
import { GameStat } from 'src/app/interfaces/game-stat';
import { Lobby } from 'src/app/interfaces/lobby';
import { User } from 'src/app/interfaces/user';
import { Hand } from 'src/app/interfaces/hand';
import { environment } from 'src/environments/environment.prod';
import { v4 as uuidv4 } from 'uuid';
import { CardService } from '../card/card.service';
@Injectable({
  providedIn: 'root'
})
export class DbService {

  allUsers: BehaviorSubject<Array<User>> = new BehaviorSubject<Array<User>>([]);
  allLobbys: BehaviorSubject<Array<Lobby>> = new BehaviorSubject<Array<Lobby>>([]);
  myLobby: BehaviorSubject<Lobby> = new BehaviorSubject<Lobby>(null);

  loginReqFailed: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  dbConnection: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  database: Database;
  app: any;
  refToAllUsers: Unsubscribe;
  refToLobbys: Unsubscribe;
  refToMyLobby: Unsubscribe;
  refToMyLoginRequests: Unsubscribe;
  myLoginRequestUUID: string = uuidv4();

  constructor(
    private cardService: CardService
  ) {
    this.app = initializeApp(environment.firebaseConfig);
    this.database = getDatabase();
    this.createReferenceToAllUsers();
  }


  async registerUser(user: User): Promise<boolean> {
    for (let i = 0; i < this.allUsers?.value?.length; i++) {
      console.log("tt" + i);

      if (this.allUsers.value[i].username === user.username) {
        console.log("Vec postoji");
        return false;
      }
    }
    await set(ref(this.database, 'users/' + user.userUUID), user);
    return true;
  }

  async deleteUser(user: User) {
    await set(ref(this.database, "users/" + user.userUUID), null);
    for (let lobby of this.allLobbys.value) {
      let n1 = lobby.players.length;
      let pCopy = JSON.parse(JSON.stringify(lobby.players));
      pCopy = pCopy.filter(o => o.userUUID != user.userUUID);
      if (n1 === 1) {
        set(ref(this.database, "lobbys/" + lobby.lobbyUUID), null);
      }
      else if (n1 != pCopy.length) {
        set(ref(this.database, "lobbys/" + lobby.lobbyUUID + "/players"), pCopy);
      }

    }
  }


  async removeLobby(lobbyUUID: string) {
    await set(ref(this.database, "lobbys/" + lobbyUUID), null);
  }


  async insertNewLobby(lobby: Lobby) {
    for (let i = 0; i < this.allLobbys?.value?.length; i++) {
      if (this.allLobbys.value[i].lobbyName === lobby.lobbyName) {
        console.log("Vec postoji lobby s tim imenom");
        return false;
      }
    }
    await set(ref(this.database, 'lobbys/' + lobby.lobbyUUID), lobby);
    this.createReferenceToLobby(lobby.lobbyUUID);
    return true;
  }

  async joinLobby(user: User, lobbyUUID: string) {
    user.password = null;
    let allLobbys = this.allLobbys.value;
    for (let i = 0; i < allLobbys.length; i++) {
      if (allLobbys[i].lobbyUUID === lobbyUUID) {
        let findPlayer: User = allLobbys[i].players.find(o => o.userUUID === user.userUUID);
        if (!findPlayer) {
          allLobbys[i].players.push(user);
          this.myLobby.next(JSON.parse(JSON.stringify(allLobbys[i])));
          await set(ref(this.database, 'lobbys/' + lobbyUUID + "/players"), allLobbys[i].players);
        }
        //await this.getLobbyManually(lobbyUUID);
        this.createReferenceToLobby(lobbyUUID);
        return;
      }
    }
  }

  createReferenceToAllUsers() {
    if (!!this.refToAllUsers) {
      this.refToAllUsers();
      console.log("duplic this.refToAllUsers");

    }
    this.refToAllUsers = onValue(ref(this.database, 'users'), (snapshot) => {
      const DataBase_Users_data = (snapshot.val());
      console.log("Novi podaci iz baze - USERI");
      console.log(DataBase_Users_data);

      if (!DataBase_Users_data) this.allUsers.next([]);
      try {
        let allUsers: User[] = [];
        let keys = Object.keys(DataBase_Users_data);
        for (let i: number = 0; i < keys.length; i++) {
          let temp: User = DataBase_Users_data[keys[i]];
          allUsers.push(temp);
        }
        this.allUsers.next(allUsers);
        this.dbConnection.next(true);
      }
      catch (error) {
        console.log("GREŠKA PRI ČITANJU IZ BAZE - createReferenceToAllUsers");
        this.allUsers.next([]);
        this.dbConnection.next(false); //TODO ????
      }
    },
      {
        onlyOnce: false
      }
    );
  }

  createReferenceToAllLobbys() {
    console.log("idem creatat ref na SVE lobbye");
    if (!!this.refToLobbys) {
      this.refToLobbys();
      console.log("duplic this.refToLobbys");
    }
    this.refToLobbys = onValue(ref(this.database, 'lobbys'), (snapshot) => {

      const DataBase_Lobbys_data = (snapshot.val());
      console.log("SVI LOBBYI - Novi podaci iz baze");
      console.log(DataBase_Lobbys_data);
      if (!DataBase_Lobbys_data) this.allLobbys.next([]);
      else
        try {
          let allLobbys: Lobby[] = [];
          let keys = Object.keys(DataBase_Lobbys_data);

          for (let i: number = 0; i < keys.length; i++) {
            let temp: Lobby = DataBase_Lobbys_data[keys[i]];
            if (!temp.players) temp.players = [];
            allLobbys.push(temp);
          }
          console.log(allLobbys);
          this.allLobbys.next(allLobbys);
          this.dbConnection.next(true);
        }
        catch (error) {
          console.log("GREŠKA PRI ČITANJU IZ BAZE");
          this.allLobbys.next([]);
          this.dbConnection.next(false); //TODO ????
        }
    },
      {
        onlyOnce: false
      });
  }

  removeReferenceFromAllLobbys() {
    console.log("idem DESTORAYAT ref na SVE lobbye");
    if (!!this.refToLobbys) {
      this.refToLobbys();
      this.refToLobbys = undefined;
    }
  }


  createReferenceToLobby(UUID: string) {
    console.log("stvaram referencu na moj lobby ", UUID);
    if (!!this.refToMyLobby) {
      this.refToMyLobby();
      console.log("duplic - single lobby");

    }
    this.refToMyLobby = onValue(ref(this.database, 'lobbys/' + UUID), async (snapshot) => {
      const data: Lobby = (snapshot.val());
      console.log("new data for my lobby - dbservice");
      console.log(data);

      if (!data) this.myLobby.next(null);
      else {
        if (!data.players) {
          data.players = [];
        }
        try {
          this.myLobby.next(data);
        }
        catch {
          console.log("single lobby update cast failed");
          this.myLobby.next(null);
        }
      }
    },
      {
        onlyOnce: false
      }
    );
  }

  removeReferenceFromLobby() {
    console.log("idem DESTORAYAT ref na SVE lobbye");
    if (!!this.refToMyLobby) {
      this.refToMyLobby();
      this.refToMyLobby = undefined;
    }
  }

  async getAllLobbysManually(pushToBehSub: boolean): Promise<Lobby[]> {
    let snapshot = await get(child(ref(this.database), `lobbys`));

    const DataBase_Lobbys_data = (snapshot.val());
    console.log("SVI LOBBYI - Novi podaci iz baze");
    console.log(DataBase_Lobbys_data);
    if (DataBase_Lobbys_data) {
      if (pushToBehSub) {
        //this.myLobby.next(null); TODO: sto s ovim
        this.allLobbys.next([]);
      }
      return [];
    }
    try {
      let allLobbys: Lobby[] = [];
      let keys = Object.keys(DataBase_Lobbys_data);

      for (let i: number = 0; i < keys.length; i++) {
        let temp: Lobby = DataBase_Lobbys_data[keys[i]];
        allLobbys.push(temp);
      }
      console.log(allLobbys);
      this.allLobbys.next(allLobbys);
      if (pushToBehSub)
        this.dbConnection.next(true);
      return allLobbys;
    }
    catch {
      console.log("GREŠKA PRI ČITANJU IZ BAZE");
      if (pushToBehSub)
        this.allLobbys.next([]);
      this.dbConnection.next(false); //TODO ????
      return [];
    }

  }


  async getLobbyManually(lobbyUUID: string, pushToBehSub: boolean): Promise<Lobby> {
    let snapshot = await get(child(ref(this.database), `lobbys/` + lobbyUUID));
    const DataBase_Lobby_data = (snapshot.val());

    if (!DataBase_Lobby_data) {
      if (pushToBehSub) this.myLobby.next(null);
      return null;
    }

    try {
      let temp: Lobby = DataBase_Lobby_data;
      if (pushToBehSub) this.myLobby.next(temp);
      this.dbConnection.next(true);
      return temp;
    }
    catch {
      console.log("GREŠKA PRI ČITANJU IZ BAZE");
      if (pushToBehSub) this.myLobby.next(null);
      this.dbConnection.next(false); //TODO ????
    }
    return null;
  }

  async removePlayerFromLobby(lobbyUUID: string, userUUID: string) {
    let lobby = await this.getLobbyManually(lobbyUUID, true);
    if (!lobby) return false;
    let players = lobby.players.filter(o => o.userUUID !== userUUID);
    await set(ref(this.database, "lobbys/" + lobbyUUID + "/players"), players);
    return true
  }

  async createGame(lobbyUUID: string) {
    let newGame: Game = <Game>{};
    newGame.gameUUID = uuidv4();
    newGame.gameStat = <GameStat>{};
    newGame.moves = [];
    newGame.cardOrder = [];
    for (let i = 0; i < 108; i++) {
      newGame.cardOrder.push(i);
    }
    newGame.cardOrder = this.cardService.randOrder(newGame.cardOrder);
    
    newGame.playerCards = [];
    for (let i = 0; i < this.myLobby.value.players.length; i++) {
      let hand: Hand = <Hand>{};
      hand.userUUID = this.myLobby.value.players[i].userUUID;

      let cards: number[] = [];
      for (let j = 0; j < 7; j++) {
        cards.push(newGame.cardOrder[7 * i + j]);
      }
      hand.cards = cards;
      newGame.playerCards.push(hand)
    }

    await set(ref(this.database, "lobbys/" + lobbyUUID + "/gameUUID"), newGame.gameUUID);
    await set(ref(this.database, "games/" + newGame.gameUUID), newGame);
  }

  whichLobbyDoIBelong(playerUUID: string): string {
    for (let lobby of this.allLobbys.value) {
      let findMe: User = lobby.players.find(o => o.userUUID === playerUUID);
      if (!!findMe) return lobby.lobbyUUID;
    }
    return null;
  }

  async alterLobbyAdmin(lobbyUUID: string, userUUID: string) {
    let lobby = await this.getLobbyManually(lobbyUUID, true);
    if (!lobby) return false;

    await set(ref(this.database, "lobbys/" + lobbyUUID + "/adminUUID"), userUUID);
  }


  async makeLoginRequest(userUUID: string, requestUUID: string) {
    await set(ref(this.database, "loginRequests/" + userUUID + "/" + this.myLoginRequestUUID), true);
  }

  async removeMyLoginRequest(userUUID: string) {
    //reqUUID se nalazi u database servisu
    await set(ref(this.database, "loginRequests/" + userUUID + "/" + this.myLoginRequestUUID), null);
  }

  async createRefrenceToMyUserLoginRequests(user: User) {
    if (!!this.refToMyLoginRequests) {
      this.refToMyLoginRequests();
      this.refToMyLoginRequests = undefined;
    }
    try {
      this.refToMyLoginRequests =
        onValue(ref(this.database, "loginRequests/" + user.userUUID), async (snapshot) => {

          const loginReqData = (snapshot.val());

          if (!loginReqData) {
            this.loginReqFailed.next(true);
            console.log("kickan sam");
          }
          else {
            console.log("New log req data");
            let keys = Object.keys(loginReqData);
            let haveBeenKicked = true;
            for (let i: number = 0; i < keys.length; i++) {
              //let temp: boolean = loginReqData[keys[i]];
              console.log("login REQ br " + i + " " + keys[i]);
              if (keys[i] === this.myLoginRequestUUID) haveBeenKicked = false;
              else {
                console.log("uklanjam request " + keys[i]);
                await set(ref(this.database, "loginRequests/" + user.userUUID + "/" + keys[i]), null);
              }
            }

            if (haveBeenKicked === true) {
              this.loginReqFailed.next(true);
              console.log("kickan sam");
            }
          }
        },
          {
            onlyOnce: false
          }
        );
    }
    catch (e) {
      console.log("DB error");
      console.log(e);
    }
  }

  async checkMyUserLoginRequestsManually(userUUID: string): Promise<string[]> {
    let snapshot = await get(child(ref(this.database), "loginRequests/" + userUUID));
    const loginReqData = snapshot.val();

    console.log("ovo vracam kao manualne requeste");
    console.log(loginReqData);
    let ret: string[];
    try {
      ret = Object.keys(loginReqData);
    } catch { }
    return ret || [];
  }

  async removeRefrenceToMyUserLoginRequests() {
    if (!!this.refToMyLoginRequests) this.refToMyLoginRequests();
  }





  async changeProfilePictureLink(user: User, link: string) {
    await set(ref(this.database, "users/" + user.username + "/userImageLink"), link);
  }

}

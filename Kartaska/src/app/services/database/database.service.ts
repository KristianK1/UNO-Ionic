import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';

import { getDatabase, ref, set, Database, onValue, child, get, Unsubscribe } from "firebase/database";
import { BehaviorSubject } from 'rxjs';
import { Game } from 'src/app/interfaces/game';
import { GameStat } from 'src/app/interfaces/game-stat';
import { Lobby } from 'src/app/interfaces/lobby';
import { Message } from 'src/app/interfaces/message';
import { User } from 'src/app/interfaces/user';
import { environment } from 'src/environments/environment.prod';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  allUsers: BehaviorSubject<Array<User>> = new BehaviorSubject<Array<User>>([]);
  allLobbys: BehaviorSubject<Array<Lobby>> = new BehaviorSubject<Array<Lobby>>([]);
  myLobby:  BehaviorSubject<Lobby> = new BehaviorSubject<Lobby>(null);

  dbConnection: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  database: Database;
  app: any;
  refToLobbys: Unsubscribe;
  refToMyLobby: Unsubscribe;

  constructor() {
    this.app = initializeApp(environment.firebaseConfig);
    this.database = getDatabase();
    this.createReferenceToAllUsers();
  }
  
  async registerUser(user: User): Promise<boolean> {
    for (let i = 0; i<this.allUsers?.value?.length; i++){
      console.log("tt" + i);
      
      if(this.allUsers.value[i].username === user.username){
        console.log("Vec postoji");
        return false;
      }
    }
    await set(ref(this.database, 'users/' + user.username), user);
    return true;
  }

  async deleteUser(user: User){
    await set(ref(this.database, "users/" + user.username), null);
    for(let lobby of this.allLobbys.value){
      let n1 = lobby.players.length;
      let pCopy = JSON.parse(JSON.stringify(lobby.players));
      pCopy = pCopy.filter( o => o.userUUID != user.userUUID);
      if(n1 === 1){
        set(ref(this.database, "lobbys/" + lobby.lobbyUUID), null);
      }
      else if(n1 != pCopy.length){
        set(ref(this.database, "lobbys/" + lobby.lobbyUUID + "/players"), pCopy);
      }
      
    }
  }

  async insertNewLobby(lobby: Lobby){
    await set(ref(this.database, 'lobbys/' + lobby.lobbyUUID), lobby);
    return true;
  }

  async joinLobby(user: User, lobbyUUID: string){
    user.password = null;
    let allLobbys = this.allLobbys.value;
    for(let i = 0; i<allLobbys.length; i++){
      if(allLobbys[i].lobbyUUID === lobbyUUID){
        let findPlayer: User = allLobbys[i].players.find(o => o.userUUID === user.userUUID);
        if(!findPlayer){
          allLobbys[i].players.push(user);
          this.myLobby.next(JSON.parse(JSON.stringify(allLobbys[i])));
          await set(ref(this.database, 'lobbys/' + lobbyUUID + "/players"), allLobbys[i].players);
        }
        //await this.getLobbyManually(lobbyUUID);
        await this.createReferenceToLobby(lobbyUUID);
        return;
      }
    }
  }

  async changeProfilePictureLink(user: User, link: string){
    await set(ref(this.database, "users/" + user.username + "/userImageLink"), link);
  }

  sendMessage(mess: Message, lobbyUUID: string){
    let currMessages: Message[] = this.myLobby?.value.messages;
    if(!currMessages) currMessages = [];
    currMessages.push(mess);

    set(ref(this.database, "lobbys/"+ lobbyUUID + "/messages"), currMessages);
  }

  createReferenceToAllUsers() {
    onValue(ref(this.database, 'users'), (snapshot) => {

      const DataBase_Users_data = (snapshot.val());

      console.log("Novi podaci iz baze - USERI");
      console.log(DataBase_Users_data);

      if (DataBase_Users_data) {
        try {
          let allUsers: User[] = [];
          let keys = Object.keys(DataBase_Users_data);

          for (let i: number = 0; i < keys.length; i++) {
            let temp: User = DataBase_Users_data[keys[i]];
            allUsers.push(temp);
          }
          console.log(allUsers);

          this.allUsers.next(allUsers);
          this.dbConnection.next(true);
        }
        catch (error) {
          console.log("GREŠKA PRI ČITANJU IZ BAZE");
          this.allUsers.next([]);
          this.dbConnection.next(false); //TODO ????
        }
      }
    },
      {
        onlyOnce: false
      }
    );
  }

  createReferenceToAllLobbys(){
    console.log("idem creatat ref na SVE lobbye");
    
    this.refToLobbys = onValue(ref(this.database, 'lobbys'), (snapshot) => {

      const DataBase_Lobbys_data = (snapshot.val());
      console.log("SVI LOBBYI - Novi podaci iz baze");
      console.log(DataBase_Lobbys_data);
      if (DataBase_Lobbys_data) {
        try {
          let allLobbys: Lobby[] = [];
          let keys = Object.keys(DataBase_Lobbys_data);

          for (let i: number = 0; i < keys.length; i++) {
            let temp: Lobby = DataBase_Lobbys_data[keys[i]];
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
      }
      else{
        this.allLobbys.next([]);
      }
    },
      {
        onlyOnce: false
      }
    );
  }

  removeReferenceFromAllLobbys(){
    console.log("idem DESTORAYAT ref na SVE lobbye");
    if(!!this.refToLobbys) {
      this.refToLobbys();
      this.refToLobbys = undefined;
    }
  }

  createReferenceToLobby(UUID: string){
    console.log("stvaram referencu na moj lobby ", UUID);
    
    this.refToMyLobby = onValue(ref(this.database, 'lobbys/'+ UUID), async (snapshot) => {
      const data = (snapshot.val());
      console.log("new data for my lobby");
      if(!data) return;

      try{
        this.myLobby.next(data);
      }
      catch{
        console.log("single lobby update cast failed");
      }
    },
    {
      onlyOnce: false
    }
    );
  }

  removeReferenceFromLobby(){
    console.log("idem DESTORAYAT ref na SVE lobbye");
    if(!!this.refToMyLobby) {
      this.refToMyLobby();
      this.refToMyLobby = undefined;
    }
  }

  async getAllLobbysManually() {
    let snapshot = await get(child(ref(this.database), `lobbys`));

    const DataBase_Lobbys_data = (snapshot.val());
    console.log("SVI LOBBYI - Novi podaci iz baze");
    console.log(DataBase_Lobbys_data);
    if (DataBase_Lobbys_data) {
      try {
        let allLobbys: Lobby[] = [];
        let keys = Object.keys(DataBase_Lobbys_data);

        for (let i: number = 0; i < keys.length; i++) {
          let temp: Lobby = DataBase_Lobbys_data[keys[i]];
          allLobbys.push(temp);
        }
        console.log(allLobbys);
        this.allLobbys.next(allLobbys);
        this.dbConnection.next(true);
      }
      catch{
        console.log("GREŠKA PRI ČITANJU IZ BAZE");
        this.allLobbys.next([]);
        this.dbConnection.next(false); //TODO ????
      }
    }
  }

  async getLobbyManually(lobbyUUID: string) {
    let snapshot = await get(child(ref(this.database), `lobbys/` + lobbyUUID));
    const DataBase_Lobby_data = (snapshot.val());

    if (DataBase_Lobby_data) {
      try {
        let temp: Lobby = DataBase_Lobby_data;
        this.myLobby.next(temp);
      }
      catch{
        console.log("GREŠKA PRI ČITANJU IZ BAZE");
        this.myLobby.next(null);
        this.dbConnection.next(false); //TODO ????
      }
    }
  }


  async removePlayerFromLobby(lobbyUUID: string, userUUID: string){
    //check jel lobby postoji

    let players = this.myLobby.value.players.filter( o => o.userUUID !== userUUID);
    await set(ref(this.database, "lobbys/" + lobbyUUID + "/players"), players);
  }
  
  createGame() {
    let newGame: Game;
    newGame.gameUUID = uuidv4();
    newGame.gameStat = <GameStat>{};
    //in progress
  }


  whichLobbyDoIBelong(playerUUID: string): string{
    for(let lobby of this.allLobbys.value){
      let findMe: User = lobby.players.find(o => o.userUUID === playerUUID);
      if(!!findMe) return lobby.lobbyUUID;
    }
    return null;
  }



}

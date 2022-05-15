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
import { UselessService } from '../useless/useless.service';

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
  refToMyLoginRequests: Unsubscribe;
  myLoginRequestUUID: string;

  canRemoveLoginRequests: boolean = false;

  constructor(
    private uselessService: UselessService,
  ) {
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

  async removeLobby(lobbyUUID: string){
    await set(ref(this.database, "lobbys/" + lobbyUUID), null);
  }

  async insertNewLobby(lobby: Lobby){
    await set(ref(this.database, 'lobbys/' + lobby.lobbyUUID), lobby);
    this.createReferenceToLobby(lobby.lobbyUUID);
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
        this.createReferenceToLobby(lobbyUUID);
        return;
      }
    }
  }

  async changeProfilePictureLink(user: User, link: string){
    await set(ref(this.database, "users/" + user.username + "/userImageLink"), link);
  }

  // sendMessage(mess: Message, lobbyUUID: string){
  //   let currMessages: Message[] = this.myLobby?.value.messages;
  //   if(!currMessages) currMessages = [];
  //   currMessages.push(mess);

  //   set(ref(this.database, "lobbys/"+ lobbyUUID + "/messages"), currMessages);
  // }

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
            if(!temp.players) temp.players = [];
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
      const data: Lobby = (snapshot.val());
      console.log("new data for my lobby");
      console.log(data);
      
      if(!data) return;

      if(!data.players) data.players = [];
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
    //TODO check jel lobby postoji
     let players = this.myLobby.value.players.filter( o => o.userUUID !== userUUID);
    await set(ref(this.database, "lobbys/" + lobbyUUID + "/players"), players);
  }
  
  async createGame(lobbyUUID: string) {
    let newGame: Game = <Game>{};
    newGame.gameUUID = uuidv4();
    newGame.gameStat = <GameStat>{};
    newGame.moves = [];
    newGame.cardOrder = [];
    for(let i = 0; i<108; i++){
      newGame.cardOrder.push(i);
    }
    newGame.playerCards = [];
    for(let i = 0; i<this.myLobby.value.players.length; i++){
      let hand: Hand = <Hand>{};
      hand.userUUID = this.myLobby.value.players[i].userUUID;
      
      let cards: number[] = [];
      for(let j = 0; j<7; j++){
        cards.push(newGame.cardOrder[7*i+j]);
      }
      hand.cards = cards;
      newGame.playerCards.push(hand)
    }

    await set(ref(this.database, "lobbys/" + lobbyUUID + "/gameUUID"), newGame.gameUUID);
    await set(ref(this.database, "games/" + newGame.gameUUID), newGame);
    

  }


  whichLobbyDoIBelong(playerUUID: string): string{
    for(let lobby of this.allLobbys.value){
      let findMe: User = lobby.players.find(o => o.userUUID === playerUUID);
      if(!!findMe) return lobby.lobbyUUID;
    }
    return null;
  }

  async alterLobbyAdmin(lobbyUUID: string, userUUID: string){
    //TODO add check does lobby exists
    await set(ref(this.database, "lobbys/" + lobbyUUID + "/adminUUID"), userUUID);
  }

  async makeLoginRequest(userUUID: string, requestUUID: string){
    this.myLoginRequestUUID = requestUUID;
    await set(ref(this.database, "loginRequests/"+userUUID + "/" + requestUUID), true);
  }

  async createRefrenceToMyUserLoginRequests(userUUID: string){
    if(!!this.refToMyLoginRequests) this.refToMyLoginRequests();
    try{
      this.refToMyLoginRequests = onValue(ref(this.database, "loginRequests/"+userUUID), async (snapshot) => {
        const loginReqData = (snapshot.val());

        if(loginReqData){
          console.log("New log req data");
          let keys = Object.keys(loginReqData);
          let haveBeenKicked = true;
          for (let i: number = 0; i < keys.length; i++) {
            let temp: boolean = loginReqData[keys[i]];
            console.log("login REQ br " + i + " " + keys[i]);
            if(keys[i] == this.myLoginRequestUUID) haveBeenKicked = false;
            else{
              if(this.canRemoveLoginRequests === true){
                console.log("uklanjam request " + keys[i]);
                await set(ref(this.database, "loginRequests/"+userUUID+"/" + keys[i]), null);
              }
            }
          }

          if(haveBeenKicked === true) {
            this.uselessService.loginReqFailed.next(true);
            console.log("kickan sam");
          }      
          
        }
        
      },
      {
        onlyOnce: false
      }
      );
    }
    catch(e){
      console.log("DB error");
      console.log(e);
    }
  }

  async checkMyUserLoginRequestsManually(userUUID: string){
      let snapshot = await get(child(ref(this.database), "loginRequests/"+userUUID));
      const loginReqData = snapshot.val();

      if(loginReqData){
        console.log("New log req data");
        let keys = Object.keys(loginReqData);
        let haveBeenKicked = true;
        for (let i: number = 0; i < keys.length; i++) {
          let temp: boolean = loginReqData[keys[i]];
          console.log("login REQ br " + i + " " + keys[i]);
          if(keys[i] == this.myLoginRequestUUID) haveBeenKicked = false;
          else{
            if(this.canRemoveLoginRequests === true){
              console.log("uklanjam request " + keys[i]);
              await set(ref(this.database, "loginRequests/"+userUUID+"/" + keys[i]), null);
            }
          }
        }

        if(haveBeenKicked === true) {
          this.uselessService.loginReqFailed.next(true);
          console.log("kickan sam");
        }      
        
      }
  }

  async removeMyLoginRequest(userUUID: string){
    //reqUUID se nalazi u database servisu
    await set(ref(this.database, "loginRequests/"+userUUID+"/" + this.myLoginRequestUUID), null);
  }
  async LoginReqsExist(userUUID: string){
    let snapshot = await get(child(ref(this.database), `loginRequests/` + userUUID));
    console.log("login reqs exist");
    console.log(snapshot.val());
    
    return !!snapshot.val();
  }

  async removeRefrenceToMyUserLoginRequests(){
    if(!!this.refToMyLoginRequests) this.refToMyLoginRequests();
  }
}

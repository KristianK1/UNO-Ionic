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
import { Card } from 'src/app/interfaces/card';
import { Move } from 'src/app/interfaces/move';
import { Message } from 'src/app/interfaces/message';
import { AlertController, IonGrid } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  allUsers: BehaviorSubject<Array<User>> = new BehaviorSubject<Array<User>>([]);
  allLobbys: BehaviorSubject<Array<Lobby>> = new BehaviorSubject<Array<Lobby>>([]);
  myLobby: BehaviorSubject<Lobby> = new BehaviorSubject<Lobby>(null);
  myGame: BehaviorSubject<Game> = new BehaviorSubject<Game>(null);
  myMessages: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);

  loginReqFailed: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  dbConnection: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  database: Database;
  app: any;

  myself: User;

  refToAllUsers: Unsubscribe;
  refToLobbys: Unsubscribe;
  refToMyLobby: Unsubscribe;
  refToMyLoginRequests: Unsubscribe;
  refToGame: Unsubscribe;
  refToMyMessages: Unsubscribe;

  myLoginRequestUUID: string = uuidv4();

  constructor(
    private cardService: CardService,
    private alertController: AlertController,
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

  async removeGame(gameUUID: string) {
    let myLobbyCopy = this.myLobby.value;
    myLobbyCopy.gameUUID = undefined;
    this.myLobby.next(myLobbyCopy);
    await set(ref(this.database, "games/" + gameUUID), null);
  }


  async insertNewLobby(lobby: Lobby) {
    for (let i = 0; i < this.allLobbys?.value?.length; i++) {
      if (this.allLobbys.value[i].lobbyName === lobby.lobbyName) {
        console.log("Vec postoji lobby s tim imenom");
        return false;
      }
    }
    await set(ref(this.database, 'lobbys/' + lobby.lobbyUUID), lobby);
    await set(ref(this.database, 'chats/' + lobby.chatUUID), []);
    this.createReferenceToLobby(lobby.lobbyUUID);
    this.createRefrenceToMyMessages(lobby.chatUUID);
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
        this.createRefrenceToMyMessages(this.myLobby.value.chatUUID);
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
    console.log("idem DESTORAYAT ref na moj lobbye");
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
    this.myLobby.next(null);
    return true;
  }

  async createGame(newGame: Game, lobbyUUID: string) {
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
    await set(ref(this.database, "users/" + user.userUUID + "/userImageLink"), link);
  }

  async createReferenceToGame(gameUUID: string) {
    if (!!this.refToGame) {
      this.refToGame();
      this.refToGame = undefined;
    }
    try {
      this.refToGame =
        onValue(ref(this.database, "games/" + gameUUID), async (snapshot) => {

          const gameData = (snapshot.val());

          console.log(gameData);

          if (!gameData) {
            console.log("nema game-a");
            this.myGame.next(null);
          }
          else {
            console.log("parsanje gameData (refToGame) u beh sub");
            console.log(gameData);

            try {
              let tempGame: Game = gameData;
              this.myGame.next(tempGame)
            } catch {
              console.log("fejalalo parsanje");
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

  async removeReferenceToGame() {
    if (!!this.refToGame) {
      this.refToGame();
      this.refToGame = undefined;
    }
  }

  async playCards(cards: Card[], moveUUID: string, gameUUID: string, userUUID: string) {
    let myGame: Game = JSON.parse(JSON.stringify(this.myGame.value));
    let moves: Move[] = myGame.moves;
    // let usedDeck: Card[] = myGame.usedDeck;
    let myHand: Hand = JSON.parse(JSON.stringify(myGame.playerCards.find(o => o.user.userUUID == userUUID)));
    for (let card of cards) {
      let move: Move = <Move>{};
      move.card = card;
      move.userUUID = userUUID;
      move.moveUUID = moveUUID;
      moves.push(move);
      // usedDeck.push(card);
      let wasRemoved = false;
      for (let i = 0; i < myHand.cards.length; i++) {
        if (myHand.cards[i].color === card.color && myHand.cards[i].value === card.value) {
          if (myHand.cards[i].value === "chDir") {
            myGame.direction = !myGame.direction;
          }
          myHand.cards.splice(i, 1);
          wasRemoved = true;
        }
      }
      if (wasRemoved === false) console.log("\n\n\n\n\n\n\n\n\n\nWASNT REMOVED");
      for (let i = 0; i < myGame.playerCards.length; i++) {
        if (myGame.playerCards[i].user.userUUID === userUUID) {
          myGame.playerCards[i] = myHand;
        }
      }
    }

    console.log("playerCards nakon bacanja");
    console.log(JSON.parse(JSON.stringify(myGame.playerCards)));
    for (let i = 0; i < myGame.playerCards.length; i++) {
      if (myGame.playerCards[i].user.userUUID === userUUID) {
        if (myGame.playerCards[i].cards.length === 0) {
          console.log("osto sam bez karata");

          /*
            end Game prikaz
          */

          
          // let Nlines: number = this.myGame.value?.gameEndString.match("\n").length;
          // let newText = Nlines + '  ' + this.myself.username + '\n';
          // let alert = await this.alertController.create({
          //   header: 'Kraj igre',
          //   subHeader: newText,
          // });
          // await alert.present();
          // await alert.onDidDismiss();
          // myGame.playerCards.splice(i, 1);
          // this.setGameString(myGame.gameUUID, newText);
        }
      }
    }

    myGame.moves = moves;
    // myGame.usedDeck = usedDeck;
    console.log("myGame - playCards");
    console.log(myGame);

    await set(ref(this.database, "games/" + gameUUID), myGame);
  }

  async playNothingCard(card: Card, gameUUID: string, userUUID: string) {
    let myGame = this.myGame.value;

    myGame.moves.push({ card: card, userUUID: userUUID, moveUUID: uuidv4() });

    await set(ref(this.database, "games/" + gameUUID), myGame);
  }

  drawCards(n: number, gameUUID: string, userUUID: string): Game {
    console.log("drawCards begin  - vucem " + n);




    let myGameCopy: Game = JSON.parse(JSON.stringify(this.myGame.value));
    console.log("myGame copy");
    console.log(JSON.parse(JSON.stringify(myGameCopy)));

    let recycledMoves = myGameCopy.moves;
    let recCards: Card[] = []

    let N = 0;
    if (recycledMoves[recycledMoves.length - 1].card.value === "+4") {
      for (let i = recycledMoves.length - 1; i >= 0; i--) {
        if (recycledMoves[i].card.value === "+4") N++;
        else break;
      }
    }
    else if (recycledMoves[recycledMoves.length - 1].card.value === "+2") {
      for (let i = recycledMoves.length - 1; i >= 0; i--) {
        if (recycledMoves[i].card.value === "+2") N++;
        else break;
      }
    }
    else if (recycledMoves[recycledMoves.length - 1].card.value === "theNothing") {
      N++; //jer eto
      for (let i = recycledMoves.length - 1; i >= 0; i--) {
        if (recycledMoves[i].card.value === "theNothing") N++;
        else break;
      }
    }
    else {
      N = 2;
      console.log("default");

    }

    console.log("mora se ostaviti zadnjih " + N);


    for (let i = 0; i < recycledMoves.length - N - 1; i++) {
      let card = recycledMoves[i].card;
      if (card.value !== "theNothing") {
        let cardCopy: Card = <Card>{};
        cardCopy.value = card.value;
        cardCopy.color = card.color; //maknio sam preferedNextColor ako ga ima
        recCards.push(card);
      }
    }
    for (let i = 0; i < recycledMoves.length - N; i++) {
      console.log("obrisao");
      console.log(myGameCopy.moves.splice(0, 1)[0]);
    }

    //if (lastCard.value)

    let unUsedCards: Card[] = this.myGame.value.unUsedDeck || [];
    unUsedCards = this.cardService.randOrder(unUsedCards);
    let chosenCards: Card[] = [];
    for (let i = 0; i < n; i++) {
      if (unUsedCards.length > 0) {
        chosenCards.push(unUsedCards.splice(0, 1)[0]);
      }
    }
    myGameCopy.unUsedDeck = unUsedCards.concat(recCards);

    for (let i = 0; i < myGameCopy.playerCards.length; i++) {
      if (myGameCopy.playerCards[i].user.userUUID === userUUID) {
        myGameCopy.playerCards[i].cards = myGameCopy.playerCards[i].cards.concat(chosenCards);
        console.log(myGameCopy.playerCards[i].cards);
      }
    }
    return myGameCopy;
  }

  async setGame(game: Game) {
    await set(ref(this.database, "games/" + game.gameUUID), game);
  }

  async createRefrenceToMyMessages(chatUUID: string) {
    if (!!this.refToMyMessages) {
      this.refToMyMessages();
      this.refToMyMessages = undefined;
    }
    try {
      this.refToMyMessages =
        onValue(ref(this.database, "chats/" + chatUUID), async (snapshot) => {

          const messData = (snapshot.val());
          let messages: Message[] = [];
          console.log("New mess data");
          if (!!messData) {
            let keys = Object.keys(messData);

            for (let i: number = 0; i < keys.length; i++) {
              messages.push(messData[keys[i]]);
            }

            console.log(JSON.parse(JSON.stringify(messages)));

            messages = messages.sort((a, b) => (b.timeStamp < a.timeStamp) ? -1 : 1);
            this.myMessages.next(messages);
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


  removeRefrenceToMyMessages() {
    if (!!this.refToMyMessages) {
      this.refToMyMessages();
      this.refToMyMessages = undefined;
    }

    this.myMessages.next(null);
  }


  async sendMessage(user: User, message: string, chatUUID: string) {
    let newMessageQ: Message = <Message>{};
    newMessageQ.text = message;
    newMessageQ.userUUID = user?.userUUID || "";
    newMessageQ.userName = user?.username || "System"
    newMessageQ.timeStamp = Date.now();
    await set(ref(this.database, "chats/" + chatUUID + "/" + uuidv4()), newMessageQ);
  }

  async removeMeFromGame(userUUID: string, gameUUID: string) {
    let myGameCopyy: Game = JSON.parse(JSON.stringify(this.myGame.value));
    myGameCopyy.playerCards.filter(o => o.user.userUUID !== userUUID);
    await this.setGame(myGameCopyy);
  }

  async setGameString(gameUUID: string, gameString: string) {
    await set(ref(this.database, "games/" + gameUUID + "/gameEndString"), gameString);
  }

}

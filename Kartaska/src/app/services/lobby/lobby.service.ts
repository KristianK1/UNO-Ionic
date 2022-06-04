import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from 'src/app/interfaces/game';
import { GameStat } from 'src/app/interfaces/game-stat';
import { Hand } from 'src/app/interfaces/hand';
import { Lobby } from 'src/app/interfaces/lobby';
import { User } from 'src/app/interfaces/user';
import { CardService } from '../card/card.service';
import { DbService } from '../db/db.service';
import { UserService } from '../user/user.service';
import { v4 as uuidv4 } from 'uuid';
import { LogRegPage } from 'src/app/pages/log-reg/log-reg.page';
import { Card } from 'src/app/interfaces/card';
import { Move } from 'src/app/interfaces/move';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  myLobby: Lobby;
  isAdmin: boolean = false;

  chosenColor: string;

  constructor(
    private userService: UserService,
    private dbService: DbService,
    private router: Router,
    private cardService: CardService,
  ) {
    this.dbService.myLobby.subscribe(lobby => {
      if (!lobby) {
        this.myLobby = null;
        this.dbService.removeReferenceFromLobby();
        this.dbService.removeRefrenceToMyMessages();
        this.router.navigate(["mainApp/home"]);
        return;
      }
      this.myLobby = lobby;

      let meInLobby = this.myLobby.players.find(o => o.userUUID === this.userService.user.value.userUUID);

      if (!meInLobby) {
        this.dbService.removeReferenceFromLobby();
        this.router.navigate(["mainApp/home"]);
      }

      this.isAdmin = meInLobby.userUUID === this.myLobby.adminUUID;

      if (!!this.myLobby.gameUUID) {
        if (!!this.dbService.myGame.value) {
          console.log("gameUUID u myLobbyu ali nista u myGame BehSub-u");
          this.dbService.createReferenceToGame(this.myLobby.gameUUID);
        }
        else if (this.myLobby.gameUUID !== this.dbService.myGame.value?.gameUUID) {
          console.log("game je promjenjen il tako nesto");
          this.dbService.createReferenceToGame(this.myLobby.gameUUID);
        }
      }
      else {
        console.log("ne igra se game");
      }
    });
  }

  async joinLobby(lobbyUUID: string) {
    console.log("joined lobby " + lobbyUUID);
    let me: User = this.userService.user.value;
    me = JSON.parse(JSON.stringify(me));
    me.password = null;
    await this.dbService.joinLobby(me, lobbyUUID);
    this.router.navigate(["mainApp/lobby"]);
  }

  async leaveLobby() {
    let lobbyUUID = this.dbService.myLobby.value?.lobbyUUID;
    if (!this.myLobby) return

    if (this.dbService.myLobby.value.players.length === 1) {
      //ja sam zadnji igrac da ode
      this.dbService.removeLobby(lobbyUUID);
      if(!!this.dbService.myLobby.value.gameUUID){
        this.dbService.removeGame(this.dbService.myLobby.value.gameUUID);
      }
    }
    else if (this.dbService.myLobby.value.adminUUID === this.userService.user.value.userUUID) {
      //ja sam admin
      this.dbService.alterLobbyAdmin(lobbyUUID, this.dbService.myLobby.value.players[1].userUUID);
      await this.dbService.removePlayerFromLobby(
        this.dbService.myLobby.value.lobbyUUID,
        this.userService.user.value.userUUID
      );
      await this.dbService.removeMeFromGame(this.userService.user.value.userUUID, this.myLobby.gameUUID);

    }



    this.dbService.removeRefrenceToMyMessages();
    this.dbService.removeReferenceToGame();
    this.dbService.myLobby.next(null);

    this.router.navigate(["mainApp/home"]);
  }

  async createGame(lobbyUUID: string) {
    let newGame: Game = <Game>{};
    newGame.gameUUID = uuidv4();
    newGame.gameStat = <GameStat>{};
    newGame.moves = [];
    newGame.direction = true;
    newGame.unUsedDeck = [];

    for (let i = 0; i < 108; i++) {
      newGame.unUsedDeck.push(this.cardService.numToCard(i));
    }
    console.log("NE  promjesan deck");

    console.log(newGame.unUsedDeck);
    newGame.unUsedDeck = this.cardService.randOrder(newGame.unUsedDeck);
    console.log("JEDANPUT promjesan deck");

    console.log(newGame.unUsedDeck);

    while (this.cardService.isValidStartCard(newGame.unUsedDeck[0]) === false) {
      newGame.unUsedDeck = this.cardService.randOrder(newGame.unUsedDeck);
    }
    console.log("promjesan deck");

    console.log(newGame.unUsedDeck);

    newGame.playerCards = [];

    let firstMove: Move = <Move>{};
    firstMove.card = newGame.unUsedDeck[0];
    firstMove.userUUID = "";

    // newGame.usedDeck.push(newGame.unUsedDeck[0]);
    newGame.unUsedDeck.splice(0, 1);

    console.log("midway");

    newGame.moves.push(firstMove);
    for (let i = 0; i < this.dbService.myLobby.value.players.length; i++) {
      let hand: Hand = <Hand>{};
      hand.user = this.dbService.myLobby.value.players[i];

      let cards: Card[] = [];
      for (let j = 0; j < 7; j++) {
        let takenCard = newGame.unUsedDeck[0];
        console.log(takenCard);

        cards.push(takenCard);
        newGame.unUsedDeck.splice(0, 1);
        // newGame.usedDeck.push(takenCard);
      }
      hand.cards = cards;
      newGame.playerCards.push(hand)
    }
    console.log("GAMEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");
    console.log(JSON.parse(JSON.stringify(newGame)));

    await this.dbService.createGame(newGame, lobbyUUID);
  }


}
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AvailableMoves } from 'src/app/interfaces/available-moves';
import { Card } from 'src/app/interfaces/card';
import { Game } from 'src/app/interfaces/game';
import { Hand } from 'src/app/interfaces/hand';
import { Lobby } from 'src/app/interfaces/lobby';
import { User } from 'src/app/interfaces/user';
import { CardService } from 'src/app/services/card/card.service';
import { DbService } from 'src/app/services/db/db.service';
import { LobbyService } from 'src/app/services/lobby/lobby.service';
import { UserService } from 'src/app/services/user/user.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.page.html',
  styleUrls: ['./lobby.page.scss'],
})
export class LobbyPage implements OnInit {

  myLobby: Lobby;
  myGame: Game;
  me: User;
  myCards: Card[];
  MyCardsPlayable: Card[] = [];
  MyAvailableMoves: AvailableMoves;

  isAdmin: boolean;

  newMessage: string;

  dispMyCards: string[] = [];

  mojRed: boolean;

  constructor(
    private dbService: DbService,
    private userService: UserService,
    private lobbyService: LobbyService,
    private cardService: CardService,
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit() {

    this.userService.user.subscribe(rez => {
      this.me = rez;
    });

    this.dbService.myLobby.subscribe(rez => {
      this.myLobby = rez;
      console.log("yo wtf");
      console.log(this.myLobby);

      if (!!this.myLobby) {
        console.log("ovo je moj lobby");
        console.log(this.myLobby);

        this.isAdmin = this.myLobby.adminUUID === this.userService.user.value.userUUID;

      }
    });

    this.dbService.myGame.subscribe(async rez => {
      if (!rez) this.myGame = null;
      else {
        this.myGame = rez;

        let mojI: number;
        let zadnjiIgraoUUID: string = this.myGame.moves[this.myGame.moves.length - 1].userUUID;
        let zadnjiI: number;
        let playerNumber = this.myLobby.players.length;
        for (let i = 0; i < playerNumber; i++) {
          if (this.me.userUUID === this.myLobby.players[i].userUUID) {
            mojI = i;
          }
          if (zadnjiIgraoUUID === this.myLobby.players[i].userUUID) {
            zadnjiI = i;
          }
        }


        if (this.myGame.moves.length === 1) {
          if (mojI === 0) {
            console.log("ovo se smije ispisati samo na pocetku partije");
            this.mojRed = true;
          }
          else {
            this.mojRed = false;
          }
        }
        else if (mojI - zadnjiI === 1 && this.myGame.direction === true) {
          this.mojRed = true;
        }
        else if (mojI - zadnjiI === -1 && this.myGame.direction === false) {
          this.mojRed = true;
        }
        else if (mojI === 0 && zadnjiI === playerNumber - 1 && this.myGame.direction === true) {
          this.mojRed = true;
        }
        else if (zadnjiI === 0 && mojI === playerNumber - 1 && this.myGame.direction === false) {
          this.mojRed = true;
        }
        else {
          this.mojRed = false;
        }
        console.log("moj Red = " + this.mojRed);


        if (this.mojRed === true) {
          let myHand: Hand = rez.playerCards.find(o => o.userUUID === this.me.userUUID);
          console.log("my Hand");
          console.log(myHand);
          this.myCards = myHand.cards;
          let stackedCards: Card[] = [];
          for (let move of this.myGame.moves) {
            stackedCards.push(move.card);
          }
          this.MyAvailableMoves = this.cardService.nextCards(stackedCards, this.myGame.playerCards[mojI].cards);
          console.log("avaialble moves");
          console.log(JSON.parse(JSON.stringify(this.MyAvailableMoves)));
          
          if (!!this.MyAvailableMoves.forceSkip) {
            this.dbService.playNothingCard(this.MyAvailableMoves.fakeCard, this.MyAvailableMoves.reverseOrder, this.myGame.gameUUID, this.me.userUUID);
          }
          else if (this.MyAvailableMoves.drawN > 1 && this.MyAvailableMoves.validCards.length === 0) {
            let myGameTemp: Game = this.dbService.drawCards(this.MyAvailableMoves.drawN, this.myGame.gameUUID, this.me.userUUID);
            myGameTemp.moves.push({ card: this.MyAvailableMoves.fakeCard, userUUID: this.me.userUUID});
            await this.dbService.setGame(myGameTemp);
          }
          else {
            let MyCardsPlayableTemp = this.MyAvailableMoves.validCards;
            // for ( let card of MyCardsPlayableTemp){
            //   card.uniqueUUID = uuidv4();
            // }
            this.MyCardsPlayable = MyCardsPlayableTemp;
            console.log(this.MyAvailableMoves);
            console.log("displayane karte");

            console.log(this.MyCardsPlayable);
            this.changeDetector.detectChanges();
          }
        }
      }
    });
  }

  onEnter() {
    /*console.log(this.newMessage);
    let message: Message = <Message>{};
    message.text = this.newMessage;
    message.userUUID = this.userService.user.value.userUUID;
    message.timeStamp = new Date().toISOString();
    this.databaseService.sendMessage(message, this.myLobby.lobbyUUID);*/
    this.newMessage = "";
  }

  async kickPlayer(userUUID: string) {
    this.dbService.removePlayerFromLobby(this.myLobby.lobbyUUID, userUUID);
  }

  async startGame() {
    await this.lobbyService.createGame(this.dbService.myLobby.value.lobbyUUID);
  }

  async cardClick(i: number) {
    //pokreni loading dok se ova funkcija izvrsava
    let card: Card = this.MyCardsPlayable[i];
    console.log(card);

    //ako ima vise takvih karata pitaj ga koliko ih zeli bacit - modal?

    let cardsToPlay = this.MyCardsPlayable.filter(o => o.color == card.color && o.value === card.value);

    await this.sendCards(cardsToPlay);
  }

  async sendCards(cards: Card[]) {
    if (this.mojRed === false) {
      console.log("nije moj red");
      return;
    }
    for (let card of cards) {
      if (card.color === "black") card.preferedNextColor = "blue"; //TODO modal?
      //ovo se mora pitati samo za "zadnju crnu kartu"
    }

    await this.dbService.playCards(cards, this.myGame.gameUUID, this.me.userUUID);
    this.MyCardsPlayable = [];
  }
}

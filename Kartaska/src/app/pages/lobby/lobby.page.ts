import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, Platform } from '@ionic/angular';
import { AvailableMoves } from 'src/app/interfaces/available-moves';
import { Card } from 'src/app/interfaces/card';
import { Game } from 'src/app/interfaces/game';
import { Hand } from 'src/app/interfaces/hand';
import { Lobby } from 'src/app/interfaces/lobby';
import { Move } from 'src/app/interfaces/move';
import { User } from 'src/app/interfaces/user';
import { CardService } from 'src/app/services/card/card.service';
import { DbService } from 'src/app/services/db/db.service';
import { LobbyService } from 'src/app/services/lobby/lobby.service';
import { UserService } from 'src/app/services/user/user.service';
import { v4 as uuidv4 } from 'uuid';
import { moveMessagePortToContext } from 'worker_threads';
import { LogRegPage } from '../log-reg/log-reg.page';
import { ColorChooserPage } from '../smallPages/color-chooser/color-chooser.page';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.page.html',
  styleUrls: ['./lobby.page.scss'],
})
export class LobbyPage implements OnInit {

  cardTakenAtMoveUUID: string;

  myLobby: Lobby;
  myGame: Game;
  me: User;
  myCards: Card[] = [];
  MyCardsPlayable: Card[] = [];
  MyAvailableMoves: AvailableMoves;

  mainCard: Card;

  isAdmin: boolean;

  dispMyCards: string[] = [];

  mojRed: boolean;
  chatMessages: string[] = [];

  isMobile: boolean = false;
  mobileView: boolean = false;
  constructor(
    private dbService: DbService,
    private userService: UserService,
    private lobbyService: LobbyService,
    private cardService: CardService,
    private changeDetector: ChangeDetectorRef,
    private loadingController: LoadingController,
    private platform: Platform,
    private modalController: ModalController,
  ) { }

  async ngOnInit() {
    console.log("lobby on init");

    await this.platform.ready();

    this.isMobile = this.platform.is('mobileweb') || this.platform.is('mobile');
    this.mobileView = this.isMobile;
    console.log("platform lobby");

    this.platform.resize.subscribe(rez => {
      console.log("platform sub");

      if (this.isMobile === false) {
        this.mobileView = this.platform.width() < 800;
        console.log("mobilni prikaz ", this.mobileView);

      }
    })


    this.userService.user.subscribe(async rez => {
      this.me = rez;
      if (!!this.me) {
        try {
          await this.loadingController.dismiss();
        }
        catch {

        }
      }
    });

    this.dbService.myLobby.subscribe(rez => {
      this.myLobby = rez;
      console.log(this.myLobby);

      if (!!this.myLobby) {
        console.log("ovo je moj lobby");
        console.log(this.myLobby);

        this.isAdmin = this.myLobby.adminUUID === this.userService.user.value.userUUID;
      }
    });

    this.dbService.myGame.subscribe(async rez => {
      if (!rez) {
        console.log("brisem sveeeeeeeeee");

        this.myGame = null;
        this.myCards = [];
        this.MyAvailableMoves = undefined;
        this.MyCardsPlayable = [];
        this.mainCard = null;
      }
      else {
        this.myGame = rez;
        console.log(this.myGame);

        let mojI: number;
        let zadnjiIgraoUUID: string = this.myGame.moves[this.myGame.moves.length - 1].userUUID;
        let zadnjiI: number;
        let playerNumber = this.myGame.playerCards.length;
        if (playerNumber === 1) {
          console.log("ostao sam sasvim sam");
          if (this.isAdmin === true) {
            this.dbService.removeGame(this.myGame.gameUUID);
            return;
          }

        }


        console.log("trazenje mojI");
        console.log(this.myGame.playerCards);
        console.log(this.me.userUUID);



        for (let i = 0; i < playerNumber; i++) {

          if (this.me.userUUID === this.myGame.playerCards[i].user.userUUID) {
            mojI = i;
          }
          if (zadnjiIgraoUUID === this.myGame.playerCards[i].user.userUUID) {
            zadnjiI = i;
          }

        }

        if (zadnjiI == undefined) { //ovo je ako je zadnja karta bacena od igraca koji vise nije u playerCards (imao nula karata)
          for (let i = this.myGame.moves.length - 1; i >= 0; i--) {
            for (let j = 0; j < playerNumber; j++) {
              if (this.myGame.moves[i].userUUID === this.myGame.playerCards[j].user.userUUID) {
                zadnjiI = j;
                break;
              }
            }
          }
        }
        if (zadnjiI == undefined) {
          zadnjiI = 0;
          console.log("totalna zbunjenost");

        }

        if (mojI == undefined) {
          console.log("ja ne igram visegsfgs");
          return false;
        }
        console.log("mojI " + JSON.parse(JSON.stringify(mojI)));
        console.log("zadnjiI " + JSON.parse(JSON.stringify(zadnjiI)));


        if (this.myGame.moves.length === 1) {
          if (mojI === 0) {
            console.log("ovo se smije ispisati samo na pocetku partije");
            this.mojRed = true;
          }
          else {
            console.log("mojRed SOL1");

            this.mojRed = false;
          }
        }
        else if (mojI - zadnjiI === 1 && this.myGame.direction === true) {
          this.mojRed = true;
          console.log("mojRed SOL 2");

        }
        else if (mojI - zadnjiI === -1 && this.myGame.direction === false) {
          this.mojRed = true;
          console.log("mojRed SOL 3");

        }
        else if (mojI === 0 && zadnjiI === playerNumber - 1 && this.myGame.direction === true) {
          this.mojRed = true;
          console.log("mojRed SOL 4");
        }
        else if (zadnjiI === 0 && mojI === playerNumber - 1 && this.myGame.direction === false) {
          this.mojRed = true;
          console.log("mojRed SOL 5");

        }
        else {
          console.log("mojRed SOL 6");

          this.mojRed = false;
        }
        console.log("moj Red = " + this.mojRed);



        let myHand: Hand = rez.playerCards.find(o => o.user.userUUID === this.me.userUUID);
        console.log("my Hand");
        console.log(myHand);
        this.myCards = myHand.cards;

        let lastCard: Card;

        for (let i = this.myGame.moves?.length - 1; i >= 0; i--) {
          lastCard = this.myGame.moves[i].card;
          if (lastCard?.value !== "theNothing")
            break;
        }
        this.mainCard = lastCard;


        if (this.mojRed === true) {
          let stackedCards: Card[] = [];
          for (let move of this.myGame.moves) {
            stackedCards.push(move.card);
          }
          this.MyAvailableMoves = this.cardService.nextCards(stackedCards, this.myGame.playerCards[mojI].cards);
          console.log("avaialble moves");
          console.log(JSON.parse(JSON.stringify(this.MyAvailableMoves)));

          if (!!this.MyAvailableMoves.forceSkip) {
            this.dbService.playNothingCard(this.MyAvailableMoves.fakeCard, this.myGame.gameUUID, this.me.userUUID);
          }
          else if (this.MyAvailableMoves.drawN > 1 && this.MyAvailableMoves.validCards.length === 0) {
            let myGameTemp: Game = this.dbService.drawCards(this.MyAvailableMoves.drawN, this.myGame.gameUUID, this.me.userUUID);
            myGameTemp.moves.push({ card: this.MyAvailableMoves.fakeCard, userUUID: this.me.userUUID });
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

  async kickPlayer(userUUID: string) {
    this.dbService.removePlayerFromLobby(this.myLobby.lobbyUUID, userUUID);
  }

  async startGame() {
    await this.lobbyService.createGame(this.dbService.myLobby.value.lobbyUUID);
  }

  async cardClick(i: any) {
    console.log(i);

    //pokreni loading dok se ova funkcija izvrsava
    let card: Card = this.MyCardsPlayable[i];
    console.log(card);


    let cardsToPlay = this.MyCardsPlayable.filter(o => o.color == card.color && o.value === card.value);

    await this.sendCards(cardsToPlay);
  }

  async sendCards(cards: Card[]) {
    if (this.mojRed === false) {
      console.log("nije moj red");
      return;
    }
    for (let card of cards) {
      if (card.color === "black") {
        card.preferedNextColor = "blue"; //TODO modal?

        for (; ;) {
          let modal = await this.modalController.create({
            component: ColorChooserPage,
          });
          await modal.present();
          await modal.onDidDismiss();
          if(!!this.lobbyService.chosenColor){
            if(this.lobbyService.chosenColor === "red")
              card.preferedNextColor = "red";
            else if(this.lobbyService.chosenColor === "green")
              card.preferedNextColor = "green";
            else if(this.lobbyService.chosenColor === "blue")
              card.preferedNextColor = "blue";
            else if(this.lobbyService.chosenColor === "yellow")
              card.preferedNextColor = "yellow";

            this.lobbyService.chosenColor = undefined;
            break;
          }
        }
      }
    }
    let moveUUID: string = uuidv4();
    await this.dbService.playCards(cards, moveUUID, this.myGame.gameUUID, this.me.userUUID);
    this.MyCardsPlayable = [];
  }

  async takeCardManually(event: any) {
    if (this.mojRed === true) {
      let lastMoveuuid: string = this.myGame.moves[this.myGame.moves.length - 1].moveUUID || "";
      if (lastMoveuuid !== this.cardTakenAtMoveUUID) {

        console.log("taking ONE card");

        let tempGame: Game = this.dbService.drawCards(1, this.myGame.gameUUID, this.me.userUUID);
        this.dbService.setGame(tempGame);
        this.cardTakenAtMoveUUID = lastMoveuuid;
      }
      else {
        console.log("cant take card");
      }
    }
    else {
      console.log("nije moj red");

    }

  }

  async playNothing() {
    if (this.mojRed === true) {
      let lastMoveuuid: string = this.myGame.moves[this.myGame.moves.length - 1].moveUUID || "";
      if (lastMoveuuid !== this.cardTakenAtMoveUUID) {
        let tempGame: Game = this.dbService.drawCards(1, this.myGame.gameUUID, this.me.userUUID);
        this.dbService.setGame(tempGame);
        this.cardTakenAtMoveUUID = lastMoveuuid;
        console.log("taking ONE card");
      }
      await this.sendCards([this.MyAvailableMoves.fakeCard]);
    }
  }
}



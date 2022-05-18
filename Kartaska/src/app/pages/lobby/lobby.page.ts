import { Component, OnInit } from '@angular/core';
import { Card } from 'src/app/interfaces/card';
import { Game } from 'src/app/interfaces/game';
import { Hand } from 'src/app/interfaces/hand';
import { Lobby } from 'src/app/interfaces/lobby';
import { User } from 'src/app/interfaces/user';
import { DbService } from 'src/app/services/db/db.service';
import { LobbyService } from 'src/app/services/lobby/lobby.service';
import { UserService } from 'src/app/services/user/user.service';

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
  MyCardsPlayable: Card[];

  isAdmin: boolean;

  newMessage: string;

  dispMyCards: string[] = []

  constructor(
    private dbService: DbService,
    private userService: UserService,
    private lobbyService: LobbyService,
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

    this.dbService.myGame.subscribe(rez => {
      if (!!rez) {
        this.myGame = rez;
        let myHand: Hand = rez.playerCards.find(o => o.userUUID === this.userService.user.value.userUUID);
        console.log("my Hand");
        console.log(myHand);
        this.myCards = myHand.cards;
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

  cardClick(i: number){
    let card: Card = this.myCards[i];
    console.log(card);
    
  }
  
  sendCard(card: Card){
    if(card.color==="black") card.preferedNextColor = "blue"; //TODO modal?
    
  }
}

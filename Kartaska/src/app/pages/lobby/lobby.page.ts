import { Component, OnInit } from '@angular/core';
import { Lobby } from 'src/app/interfaces/lobby';
import { User } from 'src/app/interfaces/user';
import { DbService } from 'src/app/services/db/db.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.page.html',
  styleUrls: ['./lobby.page.scss'],
})
export class LobbyPage implements OnInit {

  myLobby: Lobby;
  me: User;

  isAdmin: boolean;

  newMessage: string;

  constructor(
    private dbService: DbService,
    private userService: UserService,
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
    await this.dbService.createGame(this.dbService.myLobby.value.lobbyUUID);
  }
}

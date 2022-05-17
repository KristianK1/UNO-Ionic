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
    private databaseService: DbService,
    private userService: UserService,
  ) { }

  ngOnInit() {

    this.userService.user.subscribe( rez => {
      this.me = rez;
    });

    this.databaseService.myLobby.subscribe(rez => {
      console.log(rez);
      
      
      this.myLobby = rez;
      if(!this.myLobby) return;
      console.log("ovo je moj lobby");
      console.log(this.myLobby);
      
      if(this.myLobby.adminUUID === this.userService.user.value.userUUID){
        this.isAdmin = true;
      }
      else{
        this.isAdmin = false;
      }
    });
  }

  onEnter(){
    /*console.log(this.newMessage);
    let message: Message = <Message>{};
    message.text = this.newMessage;
    message.userUUID = this.userService.user.value.userUUID;
    message.timeStamp = new Date().toISOString();
    this.databaseService.sendMessage(message, this.myLobby.lobbyUUID);*/
    this.newMessage = "";
  }

  async kickPlayer(userUUID: string){
    this.databaseService.removePlayerFromLobby(this.myLobby.lobbyUUID, userUUID);
  }

  async startGame(){
    await this.databaseService.createGame(this.databaseService.myLobby.value.lobbyUUID);
  }
}

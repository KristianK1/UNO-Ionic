import { Component, OnInit } from '@angular/core';
import { Lobby } from 'src/app/interfaces/lobby';
import { Message } from 'src/app/interfaces/message';
import { User } from 'src/app/interfaces/user';
import { DatabaseService } from 'src/app/services/database/database.service';
import { LobbyService } from 'src/app/services/lobby/lobby.service';
import { UserService } from 'src/app/services/user/user.service';
import { LogRegPage } from '../log-reg/log-reg.page';

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
    private lobbyService: LobbyService,
    private databaseService: DatabaseService,
    private userService: UserService,
  ) { }

  ngOnInit() {

    this.userService.user.subscribe( rez => {
      this.me = rez;
    });

    this.databaseService.myLobby.subscribe(rez => {
      console.log("aaaaaaaa");
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
    console.log(this.newMessage);
    let message: Message = <Message>{};
    message.text = this.newMessage;
    message.userUUID = this.userService.user.value.userUUID;
    message.timeStamp = new Date().toISOString();
    this.databaseService.sendMessage(message, this.myLobby.lobbyUUID);
    this.newMessage = "";
  }

  async kickPlayer(userUUID: string){
    this.databaseService.removePlayerFromLobby(this.myLobby.lobbyUUID, userUUID);
  }

  startGame(){
    this.databaseService.createGame();
  }
}

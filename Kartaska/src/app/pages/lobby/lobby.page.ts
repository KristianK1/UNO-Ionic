import { Component, OnInit } from '@angular/core';
import { Lobby } from 'src/app/interfaces/lobby';
import { Message } from 'src/app/interfaces/message';
import { DatabaseService } from 'src/app/services/database/database.service';
import { LobbyService } from 'src/app/services/lobby/lobby.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.page.html',
  styleUrls: ['./lobby.page.scss'],
})
export class LobbyPage implements OnInit {

  currentLobbyUUID: string;
  myLobby: Lobby;

  isAdmin: boolean;

  newMessage: string;

  constructor(    
    private lobbyService: LobbyService,
    private databaseService: DatabaseService,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.lobbyService.currentLobbyUUID.subscribe(rez => {
      this.currentLobbyUUID = rez;
    })
    this.databaseService.allLobbys.subscribe(rez => {
      if(!this.currentLobbyUUID) return;
      this.myLobby = rez.find(o => o.lobbyUUID === this.currentLobbyUUID);
      if(!this.myLobby) return;

      this.currentLobbyUUID = this.myLobby.lobbyUUID;
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
    this.databaseService.sendMessage(message, this.currentLobbyUUID);
    this.newMessage = "";
  }

}

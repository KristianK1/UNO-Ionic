import { Component, OnInit } from '@angular/core';
import { Lobby } from 'src/app/interfaces/lobby';
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
    });
  }

}

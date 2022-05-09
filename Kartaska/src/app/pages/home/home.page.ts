import { Component } from '@angular/core';
import { Router, RouterState } from '@angular/router';
import { Lobby } from 'src/app/interfaces/lobby';
import { User } from 'src/app/interfaces/user';
import { DatabaseService } from 'src/app/services/database/database.service';
import { LobbyService } from 'src/app/services/lobby/lobby.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  allLobbys: Lobby[] = [];
  constructor(
    private userService: UserService,
    private databaseService: DatabaseService,
    private router: Router,
    private lobbyService: LobbyService,
  ) {}

  ngOnInit(){
    this.databaseService.allLobbys.subscribe(rez => {
      this.allLobbys = rez;
    })
  }

  joinLobby(lobbyUUID: string){
    console.log("joined lobby " + lobbyUUID);
    let me: User = this.userService.user.value;
    me = JSON.parse(JSON.stringify(me));
    me.password = null; 
    this.databaseService.joinLobby(me, lobbyUUID);
    this.lobbyService.currentLobbyUUID.next(lobbyUUID);
    this.router.navigate(["mainApp/lobby"]);
  }




}

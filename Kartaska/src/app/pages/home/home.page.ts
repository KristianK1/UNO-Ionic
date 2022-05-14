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
      console.log("novi lobby-i");
      let myLobbyUUID = this.databaseService.whichLobbyDoIBelong(this.userService.user.value?.userUUID);
      if(!!myLobbyUUID) this.joinLobby(myLobbyUUID);
      console.log(rez);
      this.allLobbys = rez || [];
    })
  }

  ionViewWillEnter(){
    console.log("on resume");
    this.databaseService.createReferenceToAllLobbys();
  }

  ionViewWillLeave(){
    console.log("on pause");
    this.databaseService.removeReferenceFromAllLobbys();
  }

  async joinLobby(lobbyUUID: string){
    await this.lobbyService.joinLobby(lobbyUUID);
  }




}

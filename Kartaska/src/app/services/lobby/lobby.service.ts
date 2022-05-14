import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Lobby } from 'src/app/interfaces/lobby';
import { User } from 'src/app/interfaces/user';
import { DatabaseService } from '../database/database.service';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  myLobby: Lobby;
  constructor(
    private userService: UserService,
    private databaseService: DatabaseService,
    private router: Router,
  ) {
    this.databaseService.myLobby.subscribe(lobby => {
      if(!lobby) {
        this.myLobby = null; 
        this.databaseService.removeReferenceFromLobby();
        this.router.navigate(["mainApp/home"]);
        return;
      }
      this.myLobby = lobby;

      let meInLobby = this.myLobby.players.find(o => o.userUUID === this.userService.user.value.userUUID);

      if(!meInLobby){
        this.databaseService.removeReferenceFromLobby();
        this.router.navigate(["mainApp/home"]);
      }

    });
  }

  async joinLobby(lobbyUUID: string){
    console.log("joined lobby " + lobbyUUID);
    let me: User = this.userService.user.value;
    me = JSON.parse(JSON.stringify(me));
    me.password = null; 
    await this.databaseService.joinLobby(me, lobbyUUID);
    this.router.navigate(["mainApp/lobby"]);
  }

  async leaveLobby(){
    let lobbyUUID = this.databaseService.myLobby.value.lobbyUUID;
    if(this.databaseService.myLobby.value.players.length === 1){
      //ja sam zadnji igrac da ode
      this.databaseService.removeLobby(lobbyUUID);
    }
    else if(this.databaseService.myLobby.value.adminUUID === this.userService.user.value.userUUID){
      //ja sam admin
      this.databaseService.alterLobbyAdmin(lobbyUUID, this.databaseService.myLobby.value.players[1].userUUID);
    }
    
    await this.databaseService.removePlayerFromLobby(
      this.databaseService.myLobby.value.lobbyUUID, 
      this.userService.user.value.userUUID
    );


    this.databaseService.myLobby.next(null);
    
    this.router.navigate(["mainApp/home"]);
  }


}
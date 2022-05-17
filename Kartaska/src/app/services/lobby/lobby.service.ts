import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Lobby } from 'src/app/interfaces/lobby';
import { User } from 'src/app/interfaces/user';
import { DbService } from '../db/db.service';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  myLobby: Lobby;
  constructor(
    private userService: UserService,
    private dbService: DbService,
    private router: Router,
  ) {
    this.dbService.myLobby.subscribe(lobby => {
      if (!lobby) {
        this.myLobby = null;
        this.dbService.removeReferenceFromLobby();
        this.router.navigate(["mainApp/home"]);
        return;
      }
      this.myLobby = lobby;

      let meInLobby = this.myLobby.players.find(o => o.userUUID === this.userService.user.value.userUUID);

      if (!meInLobby) {
        this.dbService.removeReferenceFromLobby();
        this.router.navigate(["mainApp/home"]);
      }

    });
  }

  async joinLobby(lobbyUUID: string) {
    console.log("joined lobby " + lobbyUUID);
    let me: User = this.userService.user.value;
    me = JSON.parse(JSON.stringify(me));
    me.password = null;
    await this.dbService.joinLobby(me, lobbyUUID);
    this.router.navigate(["mainApp/lobby"]);
  }

  async leaveLobby() {
    let lobbyUUID = this.dbService.myLobby.value?.lobbyUUID;
    if (!this.myLobby) return;
    if (this.dbService.myLobby.value.players.length === 1) {
      //ja sam zadnji igrac da ode
      this.dbService.removeLobby(lobbyUUID);
    }
    else if (this.dbService.myLobby.value.adminUUID === this.userService.user.value.userUUID) {
      //ja sam admin
      this.dbService.alterLobbyAdmin(lobbyUUID, this.dbService.myLobby.value.players[1].userUUID);
    }

    await this.dbService.removePlayerFromLobby(
      this.dbService.myLobby.value.lobbyUUID,
      this.userService.user.value.userUUID
    );


    this.dbService.myLobby.next(null);

    this.router.navigate(["mainApp/home"]);
  }


}
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { DatabaseService } from '../database/database.service';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  constructor(
    private userService: UserService,
    private databaseService: DatabaseService,
    private router: Router,
  ) {}


  async joinLobby(lobbyUUID: string){
    console.log("joined lobby " + lobbyUUID);
    let me: User = this.userService.user.value;
    me = JSON.parse(JSON.stringify(me));
    me.password = null; 
    await this.databaseService.joinLobby(me, lobbyUUID);
    this.router.navigate(["mainApp/lobby"]);
  }
}
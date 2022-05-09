import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Lobby } from 'src/app/interfaces/lobby';
import { User } from 'src/app/interfaces/user';
import { DatabaseService } from 'src/app/services/database/database.service';
import { LobbyService } from 'src/app/services/lobby/lobby.service';
import { UserService } from 'src/app/services/user/user.service';
import { v4 as uuidv4} from 'uuid';

@Component({
  selector: 'app-open-lobby',
  templateUrl: './open-lobby.page.html',
  styleUrls: ['./open-lobby.page.scss'],
})
export class OpenLobbyPage implements OnInit {

  lobbyName: string = "";

  constructor(
    private databaseService: DatabaseService,
    private userService: UserService,
    private router: Router,
    private lobbyService: LobbyService,
  ) { }

  ngOnInit() {
  }

  async makeLobby(){
    let newLobby: Lobby = <Lobby>{};
    newLobby.lobbyUUID = uuidv4();
    newLobby.lobbyName = this.lobbyName;
    newLobby.players = [];
    let me: User = this.userService.user;
    me.password = null;
    //me.userImageLink = null;
    //me.username = null;
    newLobby.players.push(me);
    newLobby.adminUUID = me.userUUID;

    let allLobbys: Lobby[] = this.databaseService.allLobbys.value;
    let copyLobby = allLobbys.find(o => o.lobbyName === newLobby.lobbyName);
    if(!!copyLobby){
      console.log("Postoji lobby sa istim imenom!");
      alert("Postoji lobby sa istim imenom!")
      return; 
    }
    await this.databaseService.insertNewLobby(newLobby);
    this
    this.lobbyName = "";
    this.lobbyService.currentLobbyUUID.next(newLobby.lobbyUUID);
    this.router.navigate(['mainApp/lobby']);
  }

}

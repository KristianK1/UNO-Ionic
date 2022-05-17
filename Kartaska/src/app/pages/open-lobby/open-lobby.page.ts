import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Lobby } from 'src/app/interfaces/lobby';
import { User } from 'src/app/interfaces/user';
import { DbService } from 'src/app/services/database/database.service';
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
  lobbyPassword: string = "";

  constructor(
    private databaseService: DbService,
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
    newLobby.lobbyPassword = this.lobbyPassword;
    newLobby.chatUUID = uuidv4();
    let me: User = this.userService.user.value;
    me = JSON.parse(JSON.stringify(me));
    me.password = null;
    newLobby.players = [];
    newLobby.players.push(me);
    //me.userImageLink = null;
    //me.username = null;
    newLobby.adminUUID = me.userUUID;

    await this.databaseService.getAllLobbysManually();

    let copyLobby = this.databaseService.allLobbys.value.find(o => o.lobbyName === newLobby.lobbyName);
    
    if(!!copyLobby){
      console.log("Postoji lobby sa istim imenom!");
      alert("Postoji lobby sa istim imenom!")
      return; 
    }

    await this.databaseService.insertNewLobby(newLobby);
    
    this.lobbyName = "";
    this.lobbyPassword = "";
    console.log("navigiraj na lobby");
    
    this.router.navigate(['mainApp/lobby']);
  }

}
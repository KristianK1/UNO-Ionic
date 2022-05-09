import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';

import { getDatabase, ref, set, Database, onValue, child, get } from "firebase/database";
import { BehaviorSubject } from 'rxjs';
import { Lobby } from 'src/app/interfaces/lobby';
import { User } from 'src/app/interfaces/user';
import { environment } from 'src/environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  allUsers: BehaviorSubject<Array<User>> = new BehaviorSubject<Array<User>>([]);
  allLobbys: BehaviorSubject<Array<Lobby>> = new BehaviorSubject<Array<Lobby>>([]);
  dbConnection: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  database: Database;
  app: any;

  constructor() {
    this.app = initializeApp(environment.firebaseConfig);
    this.database = getDatabase();
    this.createReferenceToUsers();
    this.createReferenceToLobbys();
  }
  
  async registerUser(user: User): Promise<boolean> {

    for (let i = 0; i<this.allUsers?.value?.length; i++){
      console.log("tt" + i);
      
      if(this.allUsers.value[i].username === user.username){
        console.log("Vec postoji");
        return false;
      }
    }
    await set(ref(this.database, 'users/' + user.username), user);
    return true;

  }

  async insertNewLobby(lobby: Lobby){
    await set(ref(this.database, 'lobbys/' + lobby.lobbyUUID), lobby);
    return true;
  }

  async joinLobby(user: User, lobbyUUID: string){
    user.password = null;

    let allLobbys = this.allLobbys.value;
    for(let i = 0; i<allLobbys.length; i++){
      if(allLobbys[i].lobbyUUID === lobbyUUID){
        let findPlayer: User = allLobbys[i].players.find(o => o.userUUID === user.userUUID);
        if(!findPlayer){
          allLobbys[i].players.push(user);
          set(ref(this.database, 'lobbys/' + lobbyUUID + "/players"), allLobbys[i].players);
        }
        return;
      }
    }
  }


  createReferenceToUsers() {
    onValue(ref(this.database, 'users'), (snapshot) => {

      const DataBase_Users_data = (snapshot.val());

      console.log("Novi podaci iz baze");
      console.log(DataBase_Users_data);

      if (DataBase_Users_data) {
        try {
          let allUsers: User[] = [];
          let keys = Object.keys(DataBase_Users_data);

          for (let i: number = 0; i < keys.length; i++) {
            console.log("citanje " + i);
            
            let temp: User = DataBase_Users_data[keys[i]];
            allUsers.push(temp);
          }
          console.log(allUsers);
          
          this.allUsers.next(allUsers);
          this.dbConnection.next(true);
        }
        catch (error) {
          console.log("GREŠKA PRI ČITANJU IZ BAZE");
          this.allUsers.next([]);
          this.dbConnection.next(false); //TODO ????
        }
      }
    },
      {
        onlyOnce: false
      }
    );
  }

  createReferenceToLobbys(){
    onValue(ref(this.database, 'lobbys'), (snapshot) => {

      const DataBase_Lobbys_data = (snapshot.val());

      console.log("Novi podaci iz baze");
      console.log(DataBase_Lobbys_data);

      if (DataBase_Lobbys_data) {
        try {
          let allLobbys: Lobby[] = [];
          let keys = Object.keys(DataBase_Lobbys_data);

          for (let i: number = 0; i < keys.length; i++) {
            console.log("citanje " + i);
            
            let temp: Lobby = DataBase_Lobbys_data[keys[i]];
            
            allLobbys.push(temp);
          }
          console.log(allLobbys);
          
          this.allLobbys.next(allLobbys);
          this.dbConnection.next(true);
        }
        catch (error) {
          console.log("GREŠKA PRI ČITANJU IZ BAZE");
          this.allUsers.next([]);
          this.dbConnection.next(false); //TODO ????
        }
      }
    },
      {
        onlyOnce: false
      }
    );
  }
}

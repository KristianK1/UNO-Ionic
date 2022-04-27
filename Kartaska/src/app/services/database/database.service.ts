import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';

import { getDatabase, ref, set, Database, onValue, child, get } from "firebase/database";
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  allUsers: BehaviorSubject<Array<User>> = new BehaviorSubject<Array<User>>(null);
  dbConnection: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  database: Database;
  app: any;

  constructor() {
    this.app = initializeApp(environment.firebaseConfig);
    this.database = getDatabase();
    this.createReferenceToUsers();
  }
  
  registerUser(name: string, pass: string): boolean {
    for (let i = 0; i<this.allUsers?.value?.length; i++){
      console.log("tt"  + i);
      
      if(this.allUsers.value[i].username === name){
        console.log("Vec postoji");
        return false;
      }
    }
    set(ref(this.database, 'users/' + name), {
      username: name,
      password: pass,
    });
    return true;

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
            
            let temp: User = {
              username: DataBase_Users_data[keys[i]].username,
              password: DataBase_Users_data[keys[i]].password
            }
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
}

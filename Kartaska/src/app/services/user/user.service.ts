import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { DatabaseService } from '../database/database.service';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  user: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  loginDataStorageKey: string = 'loginData';

  constructor(
    private dbService: DatabaseService,
    private router: Router,
    private storageService: StorageService,
  ) {

    dbService.allUsers.subscribe(allUsers => {
      if(!!this.user.value){
        let myself = allUsers.find( o => 
          o.username === this.user.value.username && 
          o.password === this.user.value.password &&
          o.userUUID === this.user.value.userUUID
        );
        console.log("ja u user servicu");
        console.log(this.user.value);
        console.log("ovo sam ja");
        console.log(myself);
        if(!myself){
          this.logout();
        }
      }
    });
  }

  login(name: string, pass: string): boolean {
    console.log("idem se logirat");
    console.log("svi korisnici");
    console.log(this.dbService.allUsers.value);
    
    
    if (!this.user.value) {
      let find: User = this.dbService.allUsers.value.find(
        (o) => o.username === name && o.password === pass
      );
      if (find) {
        console.log("nasao korisnika sa tim credsima");
        
        this.user.next(find);
        this.storageService.setData(this.loginDataStorageKey, JSON.stringify(find));
        this.router.navigate(['mainApp/home']);
        return true;
      }
    }
    return false;
  }

  async logout() {
    await this.storageService.removeData(this.loginDataStorageKey);
    this.user.next(null);
    this.router.navigate(["log-reg"]);
  }
}

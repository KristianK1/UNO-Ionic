import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { DatabaseService } from '../database/database.service';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  user: User;
  loginDataStorageKey: string = 'loginData';

  constructor(
    private dbService: DatabaseService,
    private router: Router,
    private storageService: StorageService,
  ) {

    dbService.allUsers.subscribe(allUsers => {
      if(!!this.user){
        let myself = allUsers.find( o => o.username === this.user.username && o.password === this.user.password);
        console.log("ovo sam ja");
        console.log(myself);
        if(!myself){
          this.logout();
        }
      }
    });

  }

  login(name: string, pass: string): boolean {
    if (!this.user) {
      let find: User = this.dbService.allUsers.value.find(
        (o) => o.username === name && o.password === pass
      );
      if (find) {
        this.user = find;
        this.storageService.setData(this.loginDataStorageKey, JSON.stringify(find));
        this.router.navigate(['mainApp/home']);
        return true;
      }
    }
    return false;
  }

  logout() {
    this.storageService.removeData(this.loginDataStorageKey);
    this.user = null;
    this.router.navigate(["log-reg"]);
  }
}

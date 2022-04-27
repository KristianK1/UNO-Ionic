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

  constructor(
    private dbService: DatabaseService,
    private router: Router,
    private storageService: StorageService
  ) {}

  login(name: string, pass: string, must?: boolean): boolean {
    if (!this.user) {
      let find: User = this.dbService.allUsers.value.find(
        (o) => o.username === name && o.password === pass
      );
      if (find) {
        this.user = find;
        this.storageService.setData('loginData', JSON.stringify(find));
        this.router.navigate(['mainApp/home']);
        return true;
      }
    }
    return false;
  }

  logout() {
    this.storageService.setData('loginData', '');
    this.user = null;
    this.router.navigate(["log-reg"]);
  }
}

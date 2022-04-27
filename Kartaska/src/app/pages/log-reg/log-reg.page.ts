import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { DatabaseService } from 'src/app/services/database/database.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-log-reg',
  templateUrl: './log-reg.page.html',
  styleUrls: ['./log-reg.page.scss'],
})
export class LogRegPage implements OnInit {
  constructor(
    private userService: UserService,
    private databaseService: DatabaseService,
    private storageService: StorageService
  ) {}

  mode: boolean = true;
  username_login: string = '';
  password_login: string = '';

  async ngOnInit() {
    this.databaseService.dbConnection.subscribe(async (rez) => {
      if (rez === true) {
        try {
          console.log('hello');

          let data: string = await this.storageService.getData('loginData');
          let possibleUser: User = JSON.parse(data);
          console.log(possibleUser);

          this.userService.login(
            possibleUser.username,
            possibleUser.password,
            true
          );
        } catch {}
      }
    });
  }

  login() {
    this.userService.login(this.username_login, this.password_login);
  }

  register() {
    if (this.username_login.length >= 5 && this.password_login.length >= 5) {
      this.databaseService.registerUser(
        this.username_login,
        this.password_login
      );
    } else {
      alert('Korisnicko ime i lozinka moraju imati najmanje 5 znakova');
    }
  }
}

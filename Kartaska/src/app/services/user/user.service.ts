import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { StorageService } from '../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';
import { DbService } from '../db/db.service';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  user: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  loginDataStorageKey: string = 'CardGame_loginData';
  loginRequestUUID: string;
  loginReqFailedVar: boolean;

  constructor(
    private dbService: DbService,
    private router: Router,
    private storageService: StorageService,
    private loadingController: LoadingController,
  ) {
    this.dbService.loginReqFailed.subscribe(rez => {
      if (rez === true) {
        this.loginReqFailed();
        this.loginReqFailedVar = true;
      }
    });

    this.loginRequestUUID = uuidv4();
    dbService.allUsers.subscribe(allUsers => {
      if (!!this.user.value) {
        let myself = allUsers.find(o =>
          o.username === this.user.value.username &&
          o.password === this.user.value.password &&
          o.userUUID === this.user.value.userUUID
        );
        console.log("ja u user servicu");
        console.log(this.user.value);
        console.log("ovo sam ja");
        if (!myself) {
          this.logout();
        }
        this.user.next(myself);

      }
    });
  }

  async login(name: string, pass: string): Promise<boolean> {
    console.log("idem se logirat");
    console.log("svi korisnici");
    console.log(this.dbService.allUsers.value);


    if (!this.user.value) {
      let find: User = this.dbService.allUsers.value.find(
        (o) => o.username === name && o.password === pass
      );
      if (!find) {
        console.log("nema takvog korisnika");
        return false;
      }

      let reqsToMyUser = await this.dbService.checkMyUserLoginRequestsManually(find.userUUID);

      if (reqsToMyUser.length === 0) {
        console.log("ne moram cekati");
        this.user.next(find);
        await this.storageService.setData(this.loginDataStorageKey, JSON.stringify(find));
        await this.dbService.makeLoginRequest(find.userUUID, this.dbService.myLoginRequestUUID);
        await this.dbService.createRefrenceToMyUserLoginRequests(find);
        return true;
      }

      await this.dbService.makeLoginRequest(find.userUUID, this.loginRequestUUID);

      for (let i = 0; i < 5; i++) {
        console.log("for " + i);
        let failedLogin = false;
        setTimeout(async () => {
          console.log("for nakon timeouta " + i);

          let reqs: string[] = await this.dbService.checkMyUserLoginRequestsManually(find.userUUID);
          let myReq: string = reqs.find(o => o === this.dbService.myLoginRequestUUID);
          if (!!myReq) {
            //nisam kickan još
          }
          else {
            failedLogin = true;
          }

        }, 200);
        await this.timeout(600);

        if (JSON.parse(JSON.stringify(failedLogin)) === true) {
          return true;
        }
      }

      console.log("ovdje sam");

      this.storageService.setData(this.loginDataStorageKey, JSON.stringify(find));
      this.dbService.createRefrenceToMyUserLoginRequests(find);
      this.user.next(find);
      try {
        await this.loadingController.dismiss();
        await this.loadingController.dismiss();
      }
      catch { }
      return true;


    }
    return false;
  }

  async logout() {
    await this.storageService.removeData(this.loginDataStorageKey);
    await this.dbService.removeRefrenceToMyUserLoginRequests();
    try {
      await this.dbService.removeMyLoginRequest(this.user.value.userUUID);
    } catch { }
    this.user.next(null);
    this.router.navigate(["log-reg"]);
  }

  async loginReqFailed() {
    console.log("loq req failed userService");

    await this.dbService.removeRefrenceToMyUserLoginRequests();
    this.user.next(null);
    this.router.navigate(["log-reg"]);
  }


  async timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

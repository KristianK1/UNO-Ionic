import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { StorageService } from '../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';
import { UselessService } from '../useless/useless.service';
import { DbService } from '../db/db.service';

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
    private uselessService: UselessService,
  ) {
    /*this.dbService.loginReqFailed.subscribe(rez => {
      if(rez === true){
        this.loginReqFailed();
        this.loginReqFailedVar = true;
      }
    });
    */
    this.loginRequestUUID = uuidv4();
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
          //this.logout();
        }
      }
    });
  }

  /*async login(name: string, pass: string): Promise<boolean> {
    console.log("idem se logirat");
    console.log("svi korisnici");
    console.log(this.dbService.allUsers.value);
    
    
    if (!this.user.value) {
      let find: User = this.dbService.allUsers.value.find(
        (o) => o.username === name && o.password === pass
      );
      if (find) {
        console.log("nasao korisnika sa tim credsima");

        //double login provjera
        let haveToWait: boolean = false;
        if(await this.dbService.LoginReqsExist(find.userUUID)){
          haveToWait = true;
          console.log("moram cekat");
        }
        else console.log("ne moram cekati");
        
        
        this.dbService.createRefrenceToMyUserLoginRequests(find);
        await this.dbService.makeLoginRequest(find.userUUID, this.loginRequestUUID);
        if(haveToWait === true){
          setTimeout(() =>{
            if(this.loginReqFailedVar){ 
              this.loginReqFailedVar = false;
              this.storageService.setData(this.loginDataStorageKey, JSON.stringify(find));
              this.dbService.checkMyUserLoginRequestsManually(find.userUUID);
              this.router.navigate(['mainApp/home']);
              this.dbService.canRemoveLoginRequests = true;
              this.logout();
              return false;
            }
            else{       
              this.storageService.setData(this.loginDataStorageKey, JSON.stringify(find));
              this.dbService.canRemoveLoginRequests = true;
              this.user.next(find);
              this.router.navigate(['mainApp/home']);   
            }
            return true;
          }, 2000);
        }
        else{
          this.user.next(find);
          this.storageService.setData(this.loginDataStorageKey, JSON.stringify(find));
          this.dbService.checkMyUserLoginRequestsManually(this.user.value.userUUID); // ovo ne treba
          this.router.navigate(['mainApp/home']);
          this.dbService.canRemoveLoginRequests = true;
          return true;
        }

      }
    }
    return false;
  }*/

  /*async logout() {
    await this.storageService.removeData(this.loginDataStorageKey);
    this.dbService.canRemoveLoginRequests = false;
    await this.dbService.removeRefrenceToMyUserLoginRequests();
    try{
      await this.dbService.removeMyLoginRequest(this.user.value.userUUID);
    } catch{}
    this.user.next(null);
    this.router.navigate(["log-reg"]);
  }*/

  /*async loginReqFailed(){
    console.log("loq req failed userService");
    await this.storageService.removeData(this.loginDataStorageKey);
    this.dbService.canRemoveLoginRequests = false;
    await this.dbService.removeRefrenceToMyUserLoginRequests();
    this.user.next(null);
    this.router.navigate(["log-reg"]);
  }*/
}

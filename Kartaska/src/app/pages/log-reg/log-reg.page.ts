import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { CameraService } from 'src/app/services/camera/camera.service';
import { DatabaseService } from 'src/app/services/database/database.service';
import { FireStorageService } from 'src/app/services/fireStorage/fire-storage.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { UserService } from 'src/app/services/user/user.service';
import { PassThrough } from 'stream';

import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-log-reg',
  templateUrl: './log-reg.page.html',
  styleUrls: ['./log-reg.page.scss'],
})
export class LogRegPage implements OnInit {

  mode: boolean = true;
  username_login: string = '';
  password_login: string = '';

  fileName: string;
  tempImg: string = "";
  tempImgPrefix: string; //TODO try to remove this variable

  basicImageUrl: string = 'https://firebasestorage.googleapis.com/v0/b/webprogprojekt.appspot.com/o/avatardefault_92824.png?alt=media&token=a3054da1-1d82-4490-80e7-85db058e8795';


  constructor(
    private userService: UserService,
    private databaseService: DatabaseService,
    private storageService: StorageService,
    private cameraService: CameraService,
    private fireStorageService: FireStorageService
  ) { }

  async ngOnInit() {
    this.databaseService.dbConnection.subscribe(async (rez) => {
      if (rez === true) {
        try {
          console.log('hello');

          let data: string = await this.storageService.getData(this.userService.loginDataStorageKey);

          let possibleUser: User = JSON.parse(data);
          console.log(possibleUser);

          this.userService.login(
            possibleUser.username,
            possibleUser.password
          );
        } catch { }
      }
    });
  }

  changeMode(newMode: boolean) {
    this.mode = newMode;
  }

  async login() {
    this.userService.login(this.username_login, this.password_login);
  }

  async insertImage() {
    //let perm = await Camera.checkPermissions();
    this.tempImg = await this.cameraService.takePhoto();
    this.tempImgPrefix = "data:image/jpeg;base64," + this.tempImg;
  }

  async register() {
    let newUUID = uuidv4();
    if (this.username_login.length >= 5 && this.password_login.length >= 5) {
      let imageUrl: string;
      if (this.tempImg === "") {
        imageUrl = this.basicImageUrl;
      }
      else {
        imageUrl = await this.fireStorageService.uploadImage(newUUID, this.tempImg);
      }
      console.log(imageUrl);



      let newUser: User = <User>{};

      newUser.username = this.username_login;
      newUser.password = this.password_login;
      newUser.userUUID = newUUID;
      newUser.userImageLink = imageUrl;
      console.log(newUser);
      let userrr: User = JSON.parse(JSON.stringify(newUser));
      await this.databaseService.registerUser(userrr);

      this.userService.login(userrr.username, userrr.password);

      this.username_login = "";
      this.password_login = "";
      this.tempImg = "";
      this.tempImgPrefix = "";


    } else {
      alert('Korisnicko ime i lozinka moraju imati najmanje 5 znakova');
    }
    this.userService.login(this.username_login, this.password_login);
  }
}


import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { CameraService } from 'src/app/services/camera/camera.service';
import { DbService } from 'src/app/services/db/db.service';
import { FireStorageService } from 'src/app/services/fireStorage/fire-storage.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { UserService } from 'src/app/services/user/user.service';
import { v4 as uuidv4 } from 'uuid';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-reg',
  templateUrl: './log-reg.page.html',
  styleUrls: ['./log-reg.page.scss'],
})
export class LogRegPage implements OnInit, OnDestroy {

  mode: boolean = true;
  username_login: string = '';
  password_login: string = '';

  fileName: string;
  tempImg: string = "";
  tempImgPrefix: string; //TODO try to remove this variable

  constructor(
    private userService: UserService,
    private databaseService: DbService,
    private storageService: StorageService,
    private cameraService: CameraService,
    private fireStorageService: FireStorageService,
    public loadingController: LoadingController,
    private router: Router,
  ) { }

  async ngOnInit() {

    let initLoad = await this.loadingController.create({
      message: 'Please wait...',
    });
    initLoad.present();

    this.databaseService.allUsers.subscribe(async (rez) => {
      if (!!rez) {
        try {
          console.log('hello');

          let data: string = await this.storageService.getData(this.userService.loginDataStorageKey);
          if (!!data) {
            let possibleUser: User = JSON.parse(data);
            let xx = rez.find(o => o.userUUID === possibleUser.userUUID);
            if (!!xx) {
              console.log(possibleUser);
              if (!this.userService.user.value) { //ako nisam ulogiran
                this.login(
                  possibleUser.username,
                  possibleUser.password
                );
              }
            }
          }
        } catch { }
      }
    });

    setTimeout(() => {
      initLoad.dismiss();
    }, 500);

  }
  async ngOnDestroy() {
    console.log("destroy login page");

    try {
      await this.loadingController.dismiss();
      await this.loadingController.dismiss();
    }
    catch { }
  }

  changeMode(newMode: boolean) {
    this.mode = newMode;
  }

  async login(username?: string, password?: string) {
    try {
      await this.loadingController.dismiss();
      await this.loadingController.dismiss();
    }
    catch { }

    let loadingContPopup = await this.loadingController.create({
      message: 'Please wait...',
    });
    await loadingContPopup.present();

    //pocinje proces logiranja
    let loggedIn = await this.userService.login(username || this.username_login, password || this.password_login);
    console.log("loggedIn = " + loggedIn);
    if (loggedIn) {
      this.router.navigate(["mainApp/home"]);
    }

    try {
      await this.loadingController.dismiss();
      await this.loadingController.dismiss();
    }
    catch { }
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

      imageUrl = await this.fireStorageService.uploadImage(newUUID, this.tempImg);
      console.log(imageUrl);



      let newUser: User = <User>{};

      newUser.username = this.username_login;
      newUser.password = this.password_login;
      newUser.userUUID = newUUID;
      newUser.userImageLink = imageUrl;
      console.log(newUser);
      let userrr: User = JSON.parse(JSON.stringify(newUser));
      await this.databaseService.registerUser(userrr);

      await this.login(userrr.username, userrr.password);

      this.username_login = "";
      this.password_login = "";
      this.tempImg = "";
      this.tempImgPrefix = "";


    } else {
      alert('Korisnicko ime i lozinka moraju imati najmanje 5 znakova');
    }
  }
}


import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { CameraService } from 'src/app/services/camera/camera.service';
import { DatabaseService } from 'src/app/services/database/database.service';
import { FireStorageService } from 'src/app/services/fireStorage/fire-storage.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { UserService } from 'src/app/services/user/user.service';
import { v4 as uuidv4 } from 'uuid';
import { LoadingController } from '@ionic/angular';
import { loadingController } from '@ionic/core';

@Component({
  selector: 'app-log-reg',
  templateUrl: './log-reg.page.html',
  styleUrls: ['./log-reg.page.scss'],
})
export class LogRegPage implements OnInit, OnDestroy {

  mode: boolean = true;
  username_login: string = 'sviki';
  password_login: string = 'sviki';

  fileName: string;
  tempImg: string = "";
  tempImgPrefix: string; //TODO try to remove this variable
  loadingContPopup: HTMLIonLoadingElement;

  constructor(
    private userService: UserService,
    private databaseService: DatabaseService,
    private storageService: StorageService,
    private cameraService: CameraService,
    private fireStorageService: FireStorageService,
    public loadingController: LoadingController,
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
          if(!!data){
            let possibleUser: User = JSON.parse(data);
            console.log(possibleUser);

            this.login(
              possibleUser.username,
              possibleUser.password
            );
          }
        } catch { }
      }
    });
    this.userService.user.subscribe(user => {
      console.log(user);
      setTimeout(() => {
        try{
          if(!!this.loadingContPopup){
            this.loadingContPopup.dismiss();  
            console.log("idem dismissat loading controller");
          }
        }catch{ console.log("WTF"); }
      }, 2000);
    })

    setTimeout(() => {
      initLoad.dismiss();
    }, 5000);
    
  }
  ngOnDestroy (){
    console.log("destroy login page");
    
    if(!!this.loadingContPopup)
      this.loadingContPopup.dismiss();
  }

  changeMode(newMode: boolean) {
    this.mode = newMode;
  }

  async login(username?: string, password?: string) {
    if(!!this.loadingContPopup){
      this.loadingContPopup.dismiss();
      console.log("also wtf");
      
    }
    this.loadingContPopup = await this.loadingController.create({
      message: 'Please wait...',
    });
    await this.loadingContPopup.present();
    console.log("PRESENTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT");
    
    if(!!username && !!password){
      console.log("storage login");
      this.userService.login(username, password);
    }
    else{
      console.log("normal login");
      this.userService.login(this.username_login, this.password_login);

    }
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


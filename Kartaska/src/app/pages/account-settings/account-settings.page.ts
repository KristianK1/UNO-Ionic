import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CameraService } from 'src/app/services/camera/camera.service';
import { DbService } from 'src/app/services/db/db.service';
import { FireStorageService } from 'src/app/services/fireStorage/fire-storage.service';
import { LobbyService } from 'src/app/services/lobby/lobby.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.page.html',
  styleUrls: ['./account-settings.page.scss'],
})
export class AccountSettingsPage implements OnInit {

  name: string;
  imageLink: string;

  showImg: boolean = true;

  constructor(
    private userService: UserService,
    private cameraService: CameraService,
    private dbService: DbService,
    private fireStorageService: FireStorageService,
    private changeDetector: ChangeDetectorRef,
    private lobbyService: LobbyService,
  ) { }

  async ngOnInit() {
    this.userService.user.subscribe(async user => {
      if(!user) return;
      console.log(user);
      this.name = user?.username || "";

      console.log("acc user sub");
      console.log(this.imageLink);
      console.log(user.userImageLink);
      
      
      if (this.imageLink !== user.userImageLink) {
        this.showImg = false;
        this.imageLink = "";
        console.log("start timeout");
        
        await this.timeout(100);
        this.changeDetector.detectChanges();
        await this.timeout(100);
        
        console.log("end timeout");
      }
      this.imageLink = user?.userImageLink || "";
      this.showImg = true;
      console.log("acc setting user update");
      this.changeDetector.detectChanges();
    })

  }


  async changePicture() {
    let img = await this.cameraService.takePhoto();
    try {
      await this.fireStorageService.deleteImage(this.userService.user.value.userImageLink);
    }
    catch (e) {
      console.log(e);
    }
    let newLink = await this.fireStorageService.uploadImage(this.userService.user.value.userUUID, img);
    await this.dbService.changeProfilePictureLink(this.userService.user.value, newLink);

  }

  async deleteAccount() {
    await this.lobbyService.leaveLobby();
    if (!!this.userService.user.value)
      await this.dbService.deleteUser(this.userService.user.value);
    if (!!this.userService.user.value?.userImageLink)
      await this.fireStorageService.deleteImage(this.userService.user.value?.userImageLink);
    await this.userService.logout();
  }

  async timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}

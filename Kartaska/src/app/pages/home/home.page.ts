import { Component } from '@angular/core';
import { MenuController, Platform } from '@ionic/angular';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  showMenu: boolean;
  showNewLobby: boolean;
  isMobile: boolean;

  constructor(
    private userService: UserService,
    private menuCtrl: MenuController,
    private platform: Platform,
  ) {}

    ngOnInit(){
      this.platform.resize.subscribe( x => {
        let width: number = this.platform.width();
        if(width < 1000){
          this.showMenu = false;
          this.closeMenu();
        }
        else{
          this.showMenu = true;
          this.openMenu();
        }
      });

      this.isMobile = this.platform.is('mobileweb') || this.platform.is('mobile');
      let width: number = this.platform.width();
      if(width < 1000){
        this.showMenu = false;
        this.closeMenu();
      }
      else{
        this.showMenu = true;
        this.openMenu();
      }
    }





  logout(){
    this.userService.logout();
  }

  openMenu(){
    this.menuCtrl.open(); //TODO platform - size of screen za pocetno (moze se updetad kad god) stanje menu-a
  }
  
  closeMenu(){
    this.menuCtrl.close();
  }
}

import { Component } from '@angular/core';
import { MenuController, Platform } from '@ionic/angular';
import { UserService } from './services/user/user.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  
  showMenu: boolean;
  showNewLobby: boolean;
  isMobile: boolean;
  logiran: boolean;

  constructor(
    private menuCtrl: MenuController,
    private platform: Platform,
    private userService: UserService,
    ) {}

  appInit(){
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

    this.userService.user.subscribe(user => {
      console.log("user update");
      
      this.logiran = !!user;
    })

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
    this.closeMenu();
    this.userService.logout();
    
  }

  openMenu(){
    this.menuCtrl.open(); //TODO platform - size of screen za pocetno (moze se updetad kad god) stanje menu-a
  }
  
  closeMenu(){
    this.menuCtrl.close();
  }
}

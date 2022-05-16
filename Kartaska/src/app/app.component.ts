import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, Platform } from '@ionic/angular';
import { User } from './interfaces/user';
import { DatabaseService } from './services/database/database.service';
import { LobbyService } from './services/lobby/lobby.service';
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

  user: User;
  img: string;
  
  allowHomePage: boolean = true;

  constructor(
    private menuCtrl: MenuController,
    private platform: Platform,
    private userService: UserService,
    private changeDetector: ChangeDetectorRef,
    private databaseService: DatabaseService,
    private router: Router,
    private lobbyService: LobbyService,
    ) {
      this.appInit();

      this.databaseService.myLobby.subscribe(rez => {
        //TODO mozda napravit boolean myLobbyExists da se ovo ne trigera stalno
          console.log("app comp bool change");
          console.log(rez);
          
          
          this.allowHomePage = !rez;
          console.log(this.allowHomePage);
          
      })
    }


  async appInit() {
    console.log("app init");
    await this.platform.ready();
    
    this.platform.resize.subscribe( x => {
      let width: number = this.platform.width();
      console.log("širina platforme je " + width);
      
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
      console.log(user);
      
      this.user = user;
      this.logiran = !!user;
      console.log("here");
      this.changeDetector.detectChanges();
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

  async leaveLobby(){
    this.lobbyService.leaveLobby();
  }
}

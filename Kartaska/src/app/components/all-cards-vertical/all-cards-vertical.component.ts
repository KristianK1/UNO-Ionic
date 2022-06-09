import { Component, OnInit } from '@angular/core';
import { Card } from 'src/app/interfaces/card';
import { DbService } from 'src/app/services/db/db.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-all-cards-vertical',
  templateUrl: './all-cards-vertical.component.html',
  styleUrls: ['./all-cards-vertical.component.scss'],
})
export class AllCardsVerticalComponent implements OnInit {

  allMyCards: Card[] = [];
  constructor(
    private dbService: DbService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.dbService.myGame.subscribe(rez => {
      if(!!rez){
        let pCards = rez.playerCards;
        let myUUID = this.userService.user.value.userUUID;
        let myCardsTemp = pCards.find( o=> o.user.userUUID === myUUID)?.cards;
        this.allMyCards = myCardsTemp || [];
      }
      else{
        this.allMyCards = [];
      }

      console.log("sve karte u ruci");
      console.log(this.allMyCards);
      
      
    });
  }

}

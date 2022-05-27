import { Component, OnInit } from '@angular/core';
import { Card } from 'src/app/interfaces/card';
import { DbService } from 'src/app/services/db/db.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-all-cards',
  templateUrl: './all-cards.component.html',
  styleUrls: ['./all-cards.component.scss'],
})
export class AllCardsComponent implements OnInit {


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
        myCardsTemp = myCardsTemp?.sort((a,b) => a.value===b.value? 1: -1);
        this.allMyCards = myCardsTemp || [];
      }
      else{
        this.allMyCards = [];
      }

      console.log("sve karte u ruci");
      console.log(this.allMyCards);
      
      
    })
  }

}

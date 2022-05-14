import { Injectable } from '@angular/core';
import { Card } from 'src/app/interfaces/card';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor() {
    for(let i = 0; i<108; i++){
      console.log(JSON.stringify(this.numToCard(i)));
    }
  }

  numToCard(num: number): Card{
    let card: Card = <Card>{};
    if(num >= 104){
      card.color = "black";
      card.value = "+4";
      return card;
    }
    else if(num >= 100){
      card.color = "black";
      card.value = "blank";  
      return card;
    }
    
    if(num<25)       card.color = "red";
    else if(num <50) card.color = "green";
    else if(num <75) card.color = "yellow";
    else if(num <100) card.color = "blue";
    
    while(num>=25) num = num - 25;

    if(num === 0) card.value = "0";
    else {
      num = ~~((num+1) / 2);
      if(num === 1){
        card.value = "1";
      }
      else if ( num === 2){
        card.value = "2";
      }
      else if ( num === 3){
        card.value = "3";
      }
      else if ( num === 4){
        card.value = "4";
      }
      else if ( num === 5){
        card.value = "5";
      }
      else if ( num === 6){
        card.value = "6";
      }
      else if ( num === 7){
        card.value = "7";
      }
      else if ( num === 8){
        card.value = "8";
      }
      else if ( num === 9){
        card.value = "9";
      }
      else if ( num === 10){
        card.value = "+2";
      }
      else if ( num === 11){
        card.value = "chDir";
      }
      else if ( num === 12){
        card.value = "skip";
      }
    }
    /*
      before u start laughing check out interfaces/card.ts
    */
    return card;
  }
}

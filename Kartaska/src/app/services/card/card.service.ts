import { Injectable } from '@angular/core';
import { Card } from 'src/app/interfaces/card';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor() {
    /*for (let i = 0; i < 108; i++) {
      console.log(JSON.stringify(this.numToCard(i)));
    }*/
    /*console.log(Date.now().toLocaleString());
    
    var fi = [];
    for (var i = 0; i < 200; i++) {
      fi.push(0);
    }
    for(let i = 0; i<100000; i++){
      let rand = this.betterRand();
      //console.log(rand);
      
      fi[rand] = fi[rand] + 1;
    }

    let matlabCode = "x = [";
    for (var i = 0; i < 199; i++) {
      matlabCode = matlabCode + fi[i] + ", "
    }
    matlabCode = matlabCode + fi[199] + "];"
    console.log(matlabCode);
    

    console.log(Date.now().toLocaleString());*/
  }
  
  betterRand(){
    let sum = 0;
    for(let i = 0; i<50; i++){
      sum = sum + this.rand();
    }
    sum = (sum - (~~(sum/200))*200);
    return sum;
  }
  rand(): number{
    let uuid = uuidv4();
    let sum: number = 0;
    let charValue: number;

    for(let i = 0; i<uuid.length; i++){
      charValue = uuid.charCodeAt(i);
      if(charValue === 45) continue; // "-"
      if(charValue>=48 && charValue<=57){
       charValue = charValue - 48; 
      }
      if(charValue>=97 && charValue<=122){
        charValue = charValue - 97; 
      }
      sum = sum + charValue;
    }
    return sum;
  }
  randOrder(max: number){
    //vrati polje numbera koji sadrže sve brojeve od 0 do max-1 u nasumicnom poredku
    
  }
  numToCard(num: number): Card {
    let card: Card = <Card>{};
    if (num >= 104) {
      card.color = "black";
      card.value = "+4";
      return card;
    }
    else if (num >= 100) {
      card.color = "black";
      card.value = "blank";
      return card;
    }

    if (num < 25) card.color = "red";
    else if (num < 50) card.color = "green";
    else if (num < 75) card.color = "yellow";
    else if (num < 100) card.color = "blue";

    while (num >= 25) num = num - 25;

    if (num === 0) card.value = "0";
    else {
      num = ~~((num + 1) / 2);
      if (num === 1) {
        card.value = "1";
      }
      else if (num === 2) {
        card.value = "2";
      }
      else if (num === 3) {
        card.value = "3";
      }
      else if (num === 4) {
        card.value = "4";
      }
      else if (num === 5) {
        card.value = "5";
      }
      else if (num === 6) {
        card.value = "6";
      }
      else if (num === 7) {
        card.value = "7";
      }
      else if (num === 8) {
        card.value = "8";
      }
      else if (num === 9) {
        card.value = "9";
      }
      else if (num === 10) {
        card.value = "+2";
      }
      else if (num === 11) {
        card.value = "chDir";
      }
      else if (num === 12) {
        card.value = "skip";
      }
    }
    /*
      before u start laughing check out interfaces/card.ts
    */
    return card;
  }
}

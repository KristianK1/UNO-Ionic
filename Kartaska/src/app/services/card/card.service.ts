import { Injectable } from '@angular/core';
import { ExceptionCode } from '@capacitor/core';
import { AvailableMoves } from 'src/app/interfaces/available-moves';
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

  betterRand() {
    let sum = 0;
    for (let i = 0; i < 50; i++) {
      sum = sum + this.rand();
    }
    sum = (sum - (~~(sum / 200)) * 200);
    return sum;
  }
  rand(): number {
    let uuid = uuidv4();
    let sum: number = 0;
    let charValue: number;

    for (let i = 0; i < uuid.length; i++) {
      charValue = uuid.charCodeAt(i);
      if (charValue === 45) continue; // "-"
      if (charValue >= 48 && charValue <= 57) {
        charValue = charValue - 48;
      }
      if (charValue >= 97 && charValue <= 122) {
        charValue = charValue - 97;
      }
      sum = sum + charValue;
    }
    return sum;
  }

  randOrder(polje: any[]): any[] {
    let poljeC: any[] = JSON.parse(JSON.stringify(polje));
    poljeC = poljeC.sort((a, b) => (this.betterRand() > this.betterRand()) ? 1 : -1);
    console.log("ovo returnam kao rand polje");
    console.log(JSON.parse(JSON.stringify(poljeC)));

    return poljeC;
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
      else /*(num === 12)*/ { //ako se skip pojavi odnikud to je to
        card.value = "skip";
      }
    }
    /*
      before u start laughing check out interfaces/card.ts
    */
    return card;
  }


  /*
    @param deck
      Polje svih karata odigranih do sada
    @param myCards
      Polje svih karata koje korisnik trenutno ima "u ruci"
    @returns type AvailableMoves{
      validCards: Card[] - podskup svih karata koje korisnik može odigrati

      drawN - ako korisnik nebude htio igrati niti jednu od karata iz validCards (ili je to polje prazno)
              onda je dužan vući ovoliko karata (ako ih toliko još ima u špilu)
      fakeCard - ako korisnik nebude htio igrati niti jednu od karata iz validCards (ili je to polje prazno)
              onda mora baciti ovu kartu fakeCard.value = "TheNothing" i fakeCard.color je ovisno o prethodnoj karti
      reverseOrder - mora li korisnik obrniti poredak igranja zbog prethodne karte
    }

  */
  nextCards(deck: Card[], myCards: Card[]): AvailableMoves {
    console.log("ulazni podaci u next cards");
    console.log(JSON.parse(JSON.stringify(deck)));
    console.log(JSON.parse(JSON.stringify(myCards)));


    if (!deck) {
      console.log("neispravni podaci u nextCards - deck");
      return null;
    }
    if (!myCards) {
      console.log("neispravni podaci u nextCards - myCards");
      return null;
    }



    if (myCards.length === 0) throw ("myCards length");

    if (deck.length === 0) throw ("deck length");

    let lastCard: Card = deck[deck.length - 1];

    let lastValidCard: Card;
    for (let i = deck.length - 1; i >= 0; i--) {
      lastValidCard = deck[i];
      if (lastValidCard.value !== "theNothing") break;
    }
    let validCards: Card[] = [];

    let fakeCard = <Card>{};
    fakeCard.value = "theNothing";
    fakeCard.color = lastCard.color;

    //black cards
    if (lastCard.value === "+4") {
      validCards = myCards.filter(o => o.color === "black" && o.value === "+4");

      let drawN = 0;
      for (let i = deck.length - 1; i >= 0; i--) {
        if (deck[i].value === "+4") drawN = drawN + 4;
        else break;
      }


      fakeCard.color = lastCard.preferedNextColor;
      return { validCards: validCards, drawN: drawN, fakeCard: fakeCard };
    }

    if (lastCard.value === "blank") {
      validCards = myCards.filter(o => (o.color === lastCard.preferedNextColor) || o.color === "black");
      fakeCard.color = lastCard.preferedNextColor;
      return { validCards: validCards, drawN: 1, fakeCard: fakeCard };
    }
    //end black cards


    //normal cards
    if (lastCard.value !== "+2" && lastCard.value !== "skip" && lastCard.value !== "chDir" && lastCard.value !== "theNothing") {
      validCards = myCards.filter(o => o.color === lastCard.color || o.value === lastCard.value || o.color === "black");
      return { validCards: validCards, drawN: 1, fakeCard: fakeCard };
    }
    //end normal cards

    //+2 cards
    if (lastCard.value === "+2") {
      validCards = myCards.filter(o => o.value === "+2");
      let drawN = 0;
      for (let i = deck.length - 1; i >= 0; i--) {
        if (deck[i].value === "+2") drawN = drawN + 2;
        else break;
      }
      return { validCards: validCards, drawN: drawN, fakeCard: fakeCard };
    }
    //end +2 cards

    //skip cards
    if (lastCard.value === "skip") {
      return { validCards: [], drawN: 0, fakeCard: fakeCard, forceSkip: true };
    }
    //end skip cards

    //reverse cards
    if (lastCard.value === "chDir") {
      validCards = myCards.filter(o => (o.color === lastCard.color) || o.color === "black");
      return { validCards: validCards, drawN: 1, fakeCard: fakeCard };
    }
    // end reverse cards

    //theNothing card
    if (lastCard.value === "theNothing") {
      validCards = myCards.filter(o => o.color === lastCard.color || o.color === "black" || o.value === lastValidCard.value);
      return { validCards: validCards, drawN: 1, fakeCard: fakeCard };
    }
    //end theNothing card


  }

  isEql(a: Card, b: Card): boolean {
    return a.color === b.color && a.value === b.value
  }

  isValidStartCard(card: Card): boolean {
    if (card.value !== "+2" && card.value !== "skip" && card.value !== "chDir" && card.value !== "theNothing" && card.color !== "black") {
      return true;
    }
    return false;
  }
}

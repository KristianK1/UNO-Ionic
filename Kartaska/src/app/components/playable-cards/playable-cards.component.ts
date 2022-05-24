import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Card } from 'src/app/interfaces/card';
import { CardService } from 'src/app/services/card/card.service';
import { DbService } from 'src/app/services/db/db.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-playable-cards',
  templateUrl: './playable-cards.component.html',
  styleUrls: ['./playable-cards.component.scss'],
})
export class PlayableCardsComponent implements OnInit {

  @Input() cards: Card[];
  @Output() cardClick = new EventEmitter();
  constructor() {}

  ngOnInit() {

    
  }


  async click(i: number) {
    console.log("JOOOOOOOOOOOOOOOOOOOOOOOOOOOO" + i);
    
    this.cardClick.emit(i);
  }

}

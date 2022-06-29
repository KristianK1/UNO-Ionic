import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Card } from 'src/app/interfaces/card';

@Component({
  selector: 'app-playable-cards',
  templateUrl: './playable-cards.component.html',
  styleUrls: ['./playable-cards.component.scss'],
})
export class PlayableCardsComponent implements OnInit {

  @Input() cards: Card[];
  @Output() cardClick = new EventEmitter();
  constructor() {}

  ngOnInit() {}

  async click(i: number) { 
    this.cardClick.emit(i);
  }

}

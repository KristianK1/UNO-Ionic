import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Card } from 'src/app/interfaces/card';

@Component({
  selector: 'app-playable-cards-vertical',
  templateUrl: './playable-cards-vertical.component.html',
  styleUrls: ['./playable-cards-vertical.component.scss'],
})
export class PlayableCardsVerticalComponent implements OnInit {

  @Input() cards: Card[];
  @Output() cardClick = new EventEmitter();
  
  constructor() { }

  ngOnInit() {}


  async click(i: number) {
    console.log("kliknio (vertikalno)");
    
    this.cardClick.emit(i);
  }

}

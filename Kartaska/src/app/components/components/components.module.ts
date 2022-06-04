import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatViewComponent } from 'src/app/components/chat-view/chat-view.component';
import { AllCardsComponent } from '../all-cards/all-cards.component';
import { PlayableCardsComponent } from '../playable-cards/playable-cards.component';
import { PlayerListComponent } from '../player-list/player-list.component';
import { AllCardsVerticalComponent } from '../all-cards-vertical/all-cards-vertical.component';
import { PlayableCardsVerticalComponent } from '../playable-cards-vertical/playable-cards-vertical.component';


@NgModule({
  imports:[
    CommonModule
  ],
  declarations: [
    ChatViewComponent,
    AllCardsComponent,
    PlayableCardsComponent,
    PlayerListComponent,
    AllCardsVerticalComponent,
    PlayableCardsVerticalComponent
  ],

  exports:[
    ChatViewComponent,
    AllCardsComponent,
    PlayableCardsComponent,
    PlayerListComponent,
    AllCardsVerticalComponent,
    PlayableCardsVerticalComponent,
  ],
  schemas:[
    CUSTOM_ELEMENTS_SCHEMA,
  ]
})
export class ComponentsModule { }

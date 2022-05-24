import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatViewComponent } from 'src/app/components/chat-view/chat-view.component';
import { AllCardsComponent } from '../all-cards/all-cards.component';
import { PlayableCardsComponent } from '../playable-cards/playable-cards.component';


@NgModule({
  imports:[
    CommonModule
  ],
  declarations: [
    ChatViewComponent,
    AllCardsComponent,
    PlayableCardsComponent,
  ],

  exports:[
    ChatViewComponent,
    AllCardsComponent,
    PlayableCardsComponent,
  ],
  schemas:[
    CUSTOM_ELEMENTS_SCHEMA,
  ]
})
export class ComponentsModule { }

import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatViewComponent } from 'src/app/components/chat-view/chat-view.component';


@NgModule({
  imports:[
    CommonModule
  ],
  declarations: [
    ChatViewComponent,
  ],

  exports:[
    ChatViewComponent,
  ],
  schemas:[
    CUSTOM_ELEMENTS_SCHEMA,
  ]
})
export class ComponentsModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OpenLobbyPageRoutingModule } from './open-lobby-routing.module';

import { OpenLobbyPage } from './open-lobby.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OpenLobbyPageRoutingModule
  ],
  declarations: [OpenLobbyPage]
})
export class OpenLobbyPageModule {}

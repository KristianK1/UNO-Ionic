import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OpenLobbyPage } from './open-lobby.page';

const routes: Routes = [
  {
    path: '',
    component: OpenLobbyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OpenLobbyPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LogRegPage } from './log-reg.page';

const routes: Routes = [
  {
    path: '',
    component: LogRegPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogRegPageRoutingModule {}

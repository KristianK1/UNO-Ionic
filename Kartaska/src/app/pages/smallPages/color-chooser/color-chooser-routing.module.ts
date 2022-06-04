import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ColorChooserPage } from './color-chooser.page';

const routes: Routes = [
  {
    path: '',
    component: ColorChooserPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ColorChooserPageRoutingModule {}

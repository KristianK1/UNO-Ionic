import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ColorChooserPageRoutingModule } from './color-chooser-routing.module';

import { ColorChooserPage } from './color-chooser.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ColorChooserPageRoutingModule
  ],
  declarations: [ColorChooserPage]
})
export class ColorChooserPageModule {}

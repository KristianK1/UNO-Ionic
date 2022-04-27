import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LogRegPageRoutingModule } from './log-reg-routing.module';

import { LogRegPage } from './log-reg.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LogRegPageRoutingModule
  ],
  declarations: [LogRegPage]
})
export class LogRegPageModule {}

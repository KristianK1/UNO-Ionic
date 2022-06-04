import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LobbyService } from 'src/app/services/lobby/lobby.service';

@Component({
  selector: 'app-color-chooser',
  templateUrl: './color-chooser.page.html',
  styleUrls: ['./color-chooser.page.scss'],
})
export class ColorChooserPage implements OnInit {

  constructor(
    private lobbyService: LobbyService,
    private modalController: ModalController
    ) { }

  ngOnInit() {
  }

  red(){
    this.lobbyService.chosenColor = "red";
    try{
      this.modalController.dismiss();
    } catch{}
  }

  blue(){
    this.lobbyService.chosenColor = "blue";
    try{
      this.modalController.dismiss();
    } catch{}
  }

  yellow(){
    this.lobbyService.chosenColor = "yellow";
    try{
      this.modalController.dismiss();
    } catch{}
  }

  green(){
    this.lobbyService.chosenColor = "green";
    try{
      this.modalController.dismiss();
    } catch{}
  }
}

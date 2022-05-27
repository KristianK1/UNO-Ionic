import { Component, OnInit } from '@angular/core';
import { Hand } from 'src/app/interfaces/hand';
import { DbService } from 'src/app/services/db/db.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent implements OnInit {

  display: Hand[] = [];

  constructor(
    private dbService: DbService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.dbService.myGame.subscribe(rez => {
      rez = JSON.parse(JSON.stringify(rez));
      if (!rez) {
        this.display = [];
      }
      else {
        let lastPlayer = rez.moves[rez.moves.length - 1].userUUID;
        if (lastPlayer.length > 0) {
          let hands = rez.playerCards;
          let dir = rez.direction;
          let tempDisplay: Hand[] = [];

          if (!dir) hands = hands.reverse();
          while (hands[hands.length - 1].user.userUUID !== lastPlayer) {
            hands.push(hands.shift());
          }

          this.display = hands;
        }
        else {
          this.display = rez.playerCards;
        }
      }
    });

    this.dbService.myLobby.subscribe(rez => {
      if (!rez) {
        this.display = [];
      }
      else if (!!rez.gameUUID) { }
      else {
        let tempD: Hand[] = [];
        for (let user of rez.players) {
          let temp: Hand = <Hand>{};
          temp.user = user;
          temp.cards = null;
          tempD.push(temp);
        }

        this.display = tempD;
        console.log(this.display);

      }
    })
  }

}

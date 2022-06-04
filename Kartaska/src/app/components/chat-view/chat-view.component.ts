import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DbService } from 'src/app/services/db/db.service';
import { Message } from 'src/app/interfaces/message';
import { UserService } from 'src/app/services/user/user.service';
import { LobbyPage } from 'src/app/pages/lobby/lobby.page';
import { LobbyService } from 'src/app/services/lobby/lobby.service';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss'],
})
export class ChatViewComponent implements OnInit {

  chatMessages: Message[] = [];

  newMessage: string = "TEST   STSTS";

  @Output() takecard = new EventEmitter<void>();
  @Output() skip = new EventEmitter<void>();
  @Input() mojRed: boolean;

  constructor(
    private dbService: DbService,
    private userService: UserService,
    private lobbyService: LobbyService,
    private changeDetector: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.dbService.myMessages.subscribe(rez => {
      this.chatMessages = rez || [];
      this.changeDetector.detectChanges();
    });
  }


  async onEnter() {
    if (this.newMessage.length > 3) {
      await this.dbService.sendMessage(this.userService.user.value, this.newMessage, this.lobbyService.myLobby.chatUUID);
    }
  }

  onInputTime(event: any) {

    this.newMessage = event.target.value;

  }

  takeCard_click() {
    console.log("emited take catd");

    this.takecard.emit();
  }

  skip_click() {
    this.skip.emit();
  }

}

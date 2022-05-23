import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DbService } from 'src/app/services/db/db.service';
import { Message } from 'src/app/interfaces/message';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss'],
})
export class ChatViewComponent implements OnInit {

  chatMessages: Message[] = [];

  constructor(
    private dbService: DbService,
    private changeDetector: ChangeDetectorRef
  ) {
    console.log("POCETAK CHATA");
  }

  ngOnInit() {

    console.log("POCETAK CHATA 2 ");
    this.dbService.myMessages.subscribe(rez => {

      console.log("displayam nestoooooooooo");
      this.chatMessages = rez || [];

      console.log(this.chatMessages);
      this.changeDetector.detectChanges();
    });
  }


}

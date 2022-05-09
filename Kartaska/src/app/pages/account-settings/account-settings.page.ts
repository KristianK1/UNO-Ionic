import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.page.html',
  styleUrls: ['./account-settings.page.scss'],
})
export class AccountSettingsPage implements OnInit {

  name: string;
  imagePrefix: string;
  constructor(
    private userService: UserService,
  ) { }

  ngOnInit() {

  }

}

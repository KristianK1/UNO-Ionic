import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Lobby } from 'src/app/interfaces/lobby';
import { DatabaseService } from '../database/database.service';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  currentLobbyUUID: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(
    private databaseService: DatabaseService,
  ) { }
}

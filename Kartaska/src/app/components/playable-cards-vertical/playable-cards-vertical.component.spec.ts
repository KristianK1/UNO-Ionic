import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PlayableCardsVerticalComponent } from './playable-cards-vertical.component';

describe('PlayableCardsVerticalComponent', () => {
  let component: PlayableCardsVerticalComponent;
  let fixture: ComponentFixture<PlayableCardsVerticalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayableCardsVerticalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayableCardsVerticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

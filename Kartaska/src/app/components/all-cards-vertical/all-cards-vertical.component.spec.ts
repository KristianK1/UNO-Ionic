import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AllCardsVerticalComponent } from './all-cards-vertical.component';

describe('AllCardsVerticalComponent', () => {
  let component: AllCardsVerticalComponent;
  let fixture: ComponentFixture<AllCardsVerticalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AllCardsVerticalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AllCardsVerticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

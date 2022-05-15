import { TestBed } from '@angular/core/testing';

import { UselessService } from './useless.service';

describe('UselessService', () => {
  let service: UselessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UselessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

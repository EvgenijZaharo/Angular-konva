import { TestBed } from '@angular/core/testing';

import { StickmanAnimation } from './stickman-animation';

describe('StickmanAnimation', () => {
  let service: StickmanAnimation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StickmanAnimation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

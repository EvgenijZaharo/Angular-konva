import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Stickman } from './stickman';

describe('Stickman', () => {
  let component: Stickman;
  let fixture: ComponentFixture<Stickman>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stickman]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Stickman);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

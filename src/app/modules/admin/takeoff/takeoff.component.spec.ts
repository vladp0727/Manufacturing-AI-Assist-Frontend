import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeoffComponent } from './takeoff.component';

describe('TakeoffComponent', () => {
  let component: TakeoffComponent;
  let fixture: ComponentFixture<TakeoffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TakeoffComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TakeoffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

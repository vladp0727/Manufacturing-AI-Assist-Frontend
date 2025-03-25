import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetScaleDialogComponent } from './set-scale-dialog.component';

describe('SetScaleDialogComponent', () => {
  let component: SetScaleDialogComponent;
  let fixture: ComponentFixture<SetScaleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetScaleDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SetScaleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

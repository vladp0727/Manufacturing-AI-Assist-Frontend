import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetColorDialogComponent } from './set-color-dialog.component';

describe('SetColorDialogComponent', () => {
  let component: SetColorDialogComponent;
  let fixture: ComponentFixture<SetColorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetColorDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SetColorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

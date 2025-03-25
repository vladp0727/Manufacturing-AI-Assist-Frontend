import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetLineWidthDialogComponent } from './set-line-width-dialog.component';

describe('SetLineWidthDialogComponent', () => {
  let component: SetLineWidthDialogComponent;
  let fixture: ComponentFixture<SetLineWidthDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetLineWidthDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SetLineWidthDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountDialogComponent } from './count-dialog.component';

describe('CountDialogComponent', () => {
  let component: CountDialogComponent;
  let fixture: ComponentFixture<CountDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CountDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

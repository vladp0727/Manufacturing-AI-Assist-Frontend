import { Component, EventEmitter, Input, numberAttribute, Output } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-set-line-width-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './set-line-width-dialog.component.html',
  styleUrls: ['./set-line-width-dialog.component.scss'],
})
export class SetLineWidthDialogComponent {
  @Input() selectedWidth: number | undefined;
  @Input() widthArray: number[] | undefined;
  @Output() widthSelected = new EventEmitter<number>();
  @Output() closeDialog = new EventEmitter<void>();

  lineWidths: number[] = [0.2, 0.5, 1, 2, 4]; // Define available line widths
  width: number;

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.width = this.selectedWidth ? this.selectedWidth : 1;
    if(this.widthArray) this.lineWidths = this.widthArray;
  }

  applyWidth() {
    this.widthSelected.emit(this.width);
    this.closeDialog.emit();
  }

  cancel() {
    this.closeDialog.emit();
  }
}

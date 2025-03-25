import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-set-scale-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatSelectModule,
    MatButtonModule,
    MatFormFieldModule
  ],
  templateUrl: './set-scale-dialog.component.html',
  styleUrls: ['./set-scale-dialog.component.scss']
})
export class SetScaleDialogComponent {

  @Input() selectedScale: number | undefined;  // Receive the selected scale from the parent component
  @Output() closeDialog = new EventEmitter<void>();
  @Output() scaleSelected = new EventEmitter<number>();  // Emit the scale as a number

  imperialScales = [
    { str: "3\" = 1'", scale: 33 * 3 },
    { str: "3/4\" = 1'", scale: 33 * 3 / 4 },
    { str: "1/2\" = 1'", scale: 33 / 2 },
    { str: "3/8\" = 1'", scale: 33 * 3 / 8 },
    { str: "1/4\" = 1'", scale: 33 / 4 },
    { str: "3/16\" = 1'", scale: 33 * 3 / 16 },
    { str: "3/2\" = 1'", scale: 33 * 3 / 2 },
    { str: "1/8\" = 1'", scale: 33 / 8 },
    { str: "1\" = 1'", scale: 33 },
    { str: "3/32\" = 1'", scale: 33 * 3 / 32 },
    { str: "1/16\" = 1'", scale: 33 / 16 },
    { str: "1/20\" = 1'", scale: 33 / 20 },
    { str: "1/32\" = 1'", scale: 33 / 32 },
    { str: "1/64\" = 1'", scale: 33 / 64 },
    { str: "1/28\" = 1'", scale: 33 / 28 }
  ];

  metricScales = [
    { str: "1m = 10m", scale: 10 },
    { str: "1m = 20m", scale: 20 }
  ];

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log('selectedScale', this.selectedScale);
  }

  onCancel() {
    this.closeDialog.emit();
  }

  onAddScale() {
    if (this.selectedScale !== undefined) {
      this.scaleSelected.emit(this.selectedScale);
    }
    this.closeDialog.emit();
  }
}

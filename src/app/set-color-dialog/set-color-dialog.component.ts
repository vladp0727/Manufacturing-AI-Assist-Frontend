import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-set-color-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './set-color-dialog.component.html',
  styleUrl: './set-color-dialog.component.scss'
})
export class SetColorDialogComponent {
  @Input() selectedColor: string | undefined;
  @Output() colorSelected = new EventEmitter<{ color: string, opacity: number }>();
  @Output() closeDialog = new EventEmitter<void>();

  color: string = '#000000';
  opacity: number = 1;

  showColorGrid: boolean = false;

  colors: string[] = [
    '#FFFF00', '#FFFF66', '#FFCC66', '#FF9966', '#FF6666', '#FF6666', '#FF66FF', '#FF00FF', // Row 1
    '#CCFF00', '#CCFF66', '#CCCC66', '#FFCC33', '#FF9933', '#FF6633', '#FF33FF', '#FF00CC', // Row 2
    '#99FF00', '#99FF66', '#99FF99', '#FFCC00', '#FF9900', '#FF6600', '#FF3399', '#FF0099', // Row 3
    '#66FF00', '#66FF66', '#66FF99', '#FFFF33', '#FF9933', '#FF6633', '#FF3399', '#FF0066', // Row 4
    '#33FF00', '#33FF66', '#33FF99', '#FF33FF', '#FF99FF', '#FF66FF', '#FF3399', '#FF0033', // Row 5
    '#00FF00', '#00FF66', '#00FF99', '#CCFFCC', '#FFCCCC', '#FF66CC', '#FF33CC', '#FF0000', // Row 6
    '#00CC00', '#00CC66', '#00CC99', '#99FF99', '#FF99CC', '#FF3399', '#FF6699', '#FF3300', // Row 7
    '#009900', '#009966', '#009999', '#66FF66', '#FF99FF', '#FF6699', '#FF3366', '#CC0000', // Row 8
    '#006600', '#006666', '#006699', '#33FF66', '#CCFFCC', '#FF3399', '#FF6633', '#990000', // Row 9
    '#003300', '#003366', '#003399', '#00FF00', '#00FFFF', '#00CCFF', '#0099FF', '#0000FF', // Row 10
    '#000000', // Black
  ];

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.color = this.rgbToHex(this.selectedColor);
    this.opacity = this.extractOpacity(this.selectedColor);
    console.log(this.selectedColor, this.color, this.opacity);
  }

  applyColor() {
    this.colorSelected.emit({ color: this.color, opacity: this.opacity });
    this.closeDialog.emit();
  }

  cancel() {
    this.closeDialog.emit();
  }

  toggleColorPicker() {
    this.showColorGrid = !this.showColorGrid;
  }

  selectColor(c: string) {
    this.color = c;
    this.showColorGrid = false; // Close the color picker after selection
  }

  extractOpacity(rgba: string): number {
    const match = rgba.match(/rgba\(\d+,\s*\d+,\s*\d+,\s*(\d*\.?\d+)\)/);
    return match ? parseFloat(match[1]) : 1;
  }

  rgbToHex(color: string): string {
    if (color.startsWith('#')) {
      return color;
    }

    const rgba = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/);
    if (rgba) {
      const r = parseInt(rgba[1], 10).toString(16).padStart(2, '0');
      const g = parseInt(rgba[2], 10).toString(16).padStart(2, '0');
      const b = parseInt(rgba[3], 10).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }

    return color; // Return the color as-is if it doesn't match the expected pattern
  }
}

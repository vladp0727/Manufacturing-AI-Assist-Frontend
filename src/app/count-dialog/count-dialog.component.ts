import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Import FormsModule

@Component({
  selector: 'app-count-dialog',
  templateUrl: './count-dialog.component.html',
  styleUrls: ['./count-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CountDialogComponent {
  countGroupName: string = '';
  category: string = '';
  selectedColor: string = '#000000';
  icon: string = 'circle';
  addToFavorites: boolean = false;
  lineSize: string = 'Medium'; // Default line size
  symbolSize: string = 'Medium';

  countGroupNameError: boolean = false;
  categoryError: boolean = false;
  
  showColorGrid: boolean = false;
  showIconDropdown: boolean = false;
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

  @Output() onCreateCount = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  toggleColorPicker() {
    this.showColorGrid = !this.showColorGrid;
  }

  selectColor(color: string) {
    this.selectedColor = color;
    this.showColorGrid = false; // Close the color picker after selection
  }
  toggleIconDropdown(): void {
    this.showIconDropdown = !this.showIconDropdown;
  }
  selectIcon(icon: string): void {
    this.icon = icon;
    this.showIconDropdown = false;
  }

  createCount() {
    // Reset error states
    this.countGroupNameError = false;
    this.categoryError = false;

    // Validate inputs
    if (!this.countGroupName.trim()) {
      this.countGroupNameError = true;
    }
    if (!this.category.trim()) {
      this.categoryError = true;
    }

    // If there are no errors, emit the create count event
    if (!this.countGroupNameError && !this.categoryError) {
      const countData = {
        countGroupName: this.countGroupName,
        category: this.category,
        color: this.selectedColor,
        icon: this.icon,
        addToFavorites: this.addToFavorites,
        lineSize: this.lineSize,  // Include the line size in the data
        symbolSize: this.symbolSize
      };
      this.onCreateCount.emit(countData);
    }
  }
}

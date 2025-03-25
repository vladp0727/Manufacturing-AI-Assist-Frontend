import { Component, Inject, Injectable, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Konva from 'konva';
import { WINDOW } from '@ng-web-apis/common';
import { Operations } from './operations';
import { FormsModule } from '@angular/forms';
import { CountDialogComponent } from 'app/count-dialog/count-dialog.component';
import { SetScaleDialogComponent } from 'app/set-scale-dialog/set-scale-dialog.component';
import { SetColorDialogComponent } from 'app/set-color-dialog/set-color-dialog.component';
import { SetLineWidthDialogComponent } from 'app/set-line-width-dialog/set-line-width-dialog.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatExpansionModule } from '@angular/material/expansion';

// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import axios from 'axios';
// import { saveAs } from 'file-saver';

@Component({
  selector: 'takeoff',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CountDialogComponent,
    SetScaleDialogComponent,
    SetColorDialogComponent,
    SetLineWidthDialogComponent,
    HttpClientModule,
    MatExpansionModule,
    CommonModule
  ],
  templateUrl: './takeoff.component.html',
  styleUrls: ['./takeoff.component.scss']
})
@Injectable({
  providedIn: 'root',
})
export class TakeoffComponent implements OnInit, OnDestroy {
  width: number;
  height: number;
  currentWidth: number;
  currentHeight: number;
  imageObj: any;
  imageURL: string;

  // Draw board
  stage: Konva.Stage;
  layer: Konva.Layer;

  // Drawing values
  transformer: Konva.Transformer;
  lineWidth: number = 1;
  lineWidths = [0.2, 0.5, 1, 2, 4]; // Define available line widths
  isDrawing: boolean = false;
  isDragging: boolean = false;
  x1: number;
  y1: number;
  action: string = '';
  isFill: boolean = false;
  isSelect: boolean = false;
  shape: Konva.Shape;
  imageNode: Konva.Image;
  color: string = 'rgba(0, 0, 0, 0.7)';
  opacity: number = 1; // Opacity value ranging from 0 to 1

  // Annotate properties
  showAnnotateArea: boolean = false;
  annotateText: string = '';
  annotateX: number = 0;
  annotateY: number = 0;
  adjustedAnnotateX: number = 0;
  adjustedAnnotateY: number = 0;
  activeAnnotation: Konva.Text | null = null;

  //rotate button
  isRotating: boolean = false;
  startRotation: number = 0;
  initialRotation: number = 0;

  // For Undo/Redo operation
  operations: Operations;

  //zoom level
  zoomLevel: number = 1;

  countTableData: { category: string; count: number; iconSrc: string }[] = [];
  selectedCountData: any = null;  // Store the count data when 'Create Count' is clicked

  // Polygon drawing properties
  polygonPoints: number[] = [];
  polygonLine: Konva.Line;
  isPolygonDrawing: boolean = false;
  polygon: Konva.Line;

  polylinePoints: number[] = [];
  polyLine: Konva.Line;
  polyLineShape: Konva.Line;
  isPolylineDrawing: boolean = false;
  angleArc: Konva.Arc;

  //count values
  counts: any[] = [];

  // Deduct values
  deductRectangle: Konva.Rect | null = null;

  // Boolearn that shows dialog or not
  showColorPicker: boolean = false;
  showCountDialog: boolean = false;
  showScaleDialog: boolean = false;
  showSetWidthDialog: boolean = false;
  showSidebar = false;

  backgroundLightened = false;  // State to check if background is lightened
  rectShape: Konva.Rect | null = null;  // Rectangle shape for cropping

  // Size or Length of line, rectangle, polygon square.
  feetText: Konva.Text; // Text element for displaying the length or size as feet

  //tableData: { name: string, size: string, sizeNum: number }[] = [];
  tableData: Array<any> = [];
  currentId: string = '';

  // scale values
  selectedScale: number = 33;
  currentScaleStr: string = "1\" = 1'";
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
  // Drawing Tools
  activeTool: string = '';
  tools = [
    { name: 'select', label: 'Select and manipulate shapes.', title: 'Select (🖱)', icon: 'assets/icons/select.svg', disabled: false, hasSubtools: false },
    {
      disabled: false, hasSubtools: true, default: 0,
      subtools: [
        { name: 'rectangle', label: 'Draw a rectangle shape.', title: 'Rectangle (⬛)', icon: 'assets/icons/rectangle.svg' },
        { name: 'polygon', label: 'Draw a polygon shape.', title: 'Polygon (🔺)', icon: 'assets/icons/polygon.svg' },
        { name: 'deduct', label: 'Deduct an area from an existing shape.', title: 'Deduct (➖)', icon: 'assets/icons/deduct.svg' },
      ]
    },
    {
      // name: 'length', label: 'Measure the distance between two points.', title: 'Length (📏)', icon: 'assets/icons/length.svg', disabled: false, hasSubtools: true,
      disabled: false, hasSubtools: true, default: 0,
      subtools: [
        { name: 'line', label: 'Measure a straight line.', title: 'Length (📏)', icon: 'assets/icons/line.svg' },
        { name: 'polyline', label: 'Measure multiple segments.', title: 'Polyline (📏)', icon: 'assets/icons/polyline.svg' },
        { name: 'linewidth', label: 'Adjust the line width for drawing.', title: 'Line Width (➖➖)', icon: 'assets/icons/linewidth.svg' },
      ]
    },
    { name: 'count', label: 'Count and mark specific items.', title: 'Count (🔢)', icon: 'assets/icons/count.svg', disabled: false },
    { name: 'annotate', label: 'Add annotations to the canvas.', title: 'Annotate (📝)', icon: 'assets/icons/annotate.svg', disabled: false },
    { name: 'undo', label: 'Undo the previous action.', title: 'Undo (↩️)', icon: 'assets/icons/undo.svg', disabled: false },
    // { name: 'colorselect', label: 'Select a color for drawing and filling.', title: 'Color (🎨)', icon: 'assets/icons/colorselect.svg', disabled: false },
    { name: 'delete', label: 'Delete the selected shape.', title: 'Delete (🗑️)', icon: 'assets/icons/delete.svg', disabled: false },
    {
      disabled: false, hasSubtools: true, default: 0,
      subtools: [
        { name: 'aimeasure', label: 'Automatically detect rooms and measure their size.', title: 'AI Measure (✨)', icon: 'assets/icons/magic.svg' },
        { name: 'wallmeasure', label: 'Automatically detect walls and total length.', title: 'Wall Measure (✨)', icon: 'assets/icons/magic.svg' },
      ],
      isLoading: false
    },
  ];

  dropdownOpen: boolean = false;
  dropdownIndex: number = -1;
  selectedTool: any = this.tools[0];

  selectedSubTool: string = 'line';
  hoveredTool: any = null;

  angleText: Konva.Text | null = null;

  uploadRoomURL: string = 'http://localhost:5000/room';
  uploadWallURL: string = 'http://localhost:5000/wall';
  predictions = [];

  orgWidth: number = 0;
  orgHeight: number = 0;

  label_info = [
    { "class_id": 1, "class_name": "Balcony", "color": "rgba(0, 255, 0, 0.3)" },
    { "class_id": 2, "class_name": "Bathroom", "color": "rgba(0, 0, 255, 0.3)" },
    { "class_id": 3, "class_name": "Bedroom", "color": "rgba(255, 255, 0, 0.3)" },
    { "class_id": 4, "class_name": "Closet", "color": "rgba(255, 165, 0, 0.3)" },
    { "class_id": 5, "class_name": "Diningroom", "color": "rgba(75, 0, 130, 0.3)" },
    { "class_id": 6, "class_name": "Elevator", "color": "rgba(238, 130, 238, 0.3)" },
    { "class_id": 7, "class_name": "Garage", "color": "rgba(0, 255, 255, 0.3)" },
    { "class_id": 8, "class_name": "Hall", "color": "rgba(255, 20, 147, 0.3)" },
    { "class_id": 9, "class_name": "Kitchen", "color": "rgba(255, 0, 255, 0.3)" },
    { "class_id": 10, "class_name": "Livingroom", "color": "rgba(0, 128, 0, 0.3)" },
    { "class_id": 11, "class_name": "Mech", "color": "rgba(128, 0, 0, 0.3)" },
    { "class_id": 12, "class_name": "Office", "color": "rgba(128, 128, 0, 0.3)" },
    { "class_id": 13, "class_name": "Other", "color": "rgba(0, 128, 128, 0.3)" },
    { "class_id": 14, "class_name": "Staircase", "color": "rgba(128, 0, 128, 0.3)" },
    { "class_id": 15, "class_name": "Toilet", "color": "rgba(255, 192, 203, 0.3)" },
    { "class_id": 16, "class_name": "WD", "color": "rgba(255, 105, 180, 0.3)" },
    { "class_id": 17, "class_name": "Patio", "color": "rgba(255, 55, 180, 0.3)" },

    // for Shapes
    { "class_id": 17, "class_name": "rectangle", "color": "rgba(0, 255, 0, 0.3)" },
    { "class_id": 18, "class_name": "polygon", "color": "rgba(0, 255, 0, 0.3)" },
    { "class_id": 19, "class_name": "line", "color": "rgba(0, 255, 0, 0.3)" },
    { "class_id": 20, "class_name": "polyline", "color": "rgba(0, 255, 0, 0.3)" },
  ];

  confidence_threshold: number = 0.5;

  aiMeasureClicked: boolean = false;

  tempDisplayName: string;

  // for context
  showContextMenu = false;
  menuPosition = { x: 0, y: 0 };
  currentContextShape: Konva.Shape;
  contextColorDialog = false;
  lineColorDialog = false;

  // for modify menu
  showModifyMenu = false;
  modifyMenuPosition = { x: 0, y: 0 };

  // line style editing
  lineStroke = 2;

  isPointDelete = false;

  alignType: string = 'top';

  currentMousePosition = { x: 0, y: 0 };

  constructor(
    @Inject(WINDOW) private windowRef: Window,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.imageURL = "https://i.imgur.com/KMakjE3.jpeg";
    this.imageObj = new Image();

    this.imageObj.onload = () => {
      this.orgWidth = this.imageObj.naturalWidth;
      this.orgHeight = this.imageObj.naturalHeight;

      const newWidth = 1200;
      const newHeight = newWidth * this.orgHeight / this.orgWidth;

      this.width = this.currentWidth = this.windowRef.innerWidth;
      this.height = this.currentHeight = this.windowRef.innerHeight;

      this.stage = new Konva.Stage({
        width: Math.max(this.width, newWidth),
        height: Math.max(this.height, newHeight),
        container: 'container'
      });

      this.layer = new Konva.Layer();
      this.transformer = new Konva.Transformer();
      this.layer.add(this.transformer);
      this.stage.add(this.layer);

      this.imageNode = new Konva.Image({
        x: 20,
        y: 20,
        image: this.imageObj,
        width: newWidth,
        height: newHeight,
      });

      this.layer.add(this.imageNode);

      this.layer.draw();

      this.operations = new Operations(this.layer);
      this.initStageEvents();
    };
    this.imageObj.src = this.imageURL;
  }

  ngOnDestroy(): void { }

  initStageEvents(): void {
    this.stage.on('click tap', (e: Konva.KonvaPointerEvent) => {
      if (this.activeTool === 'select') {
        this.selectShape(e);
      } else if (this.activeTool === 'count' && this.selectedCountData) {
        this.handleImageClick(e);
      }
    });
    this.stage.on('mousedown', this.startDrawing.bind(this));
    this.stage.on('mouseup', this.stopDrawing.bind(this));
    this.stage.on('mousemove', this.draw.bind(this));
    this.stage.on('mousemove', this.trackMousePosition.bind(this));

    this.stage.on('mousemove', this.handleMouseMove.bind(this));
    this.stage.on('click', this.handlePolygonClick.bind(this));
    this.stage.on('mousemove', this.updatePolygonLine.bind(this));

    this.stage.on('click', this.handlePolylineClick.bind(this));
    this.stage.on('mousemove', this.updatePolylineLine.bind(this));

    // Add event  listener for color select
    this.stage.on('mousedown', this.hideUnnecessaryItems.bind(this));

    this.stage.on('click', this.handleAnnotationClick.bind(this));
  }

  startDrawing(e: Konva.KonvaPointerEvent): void {
    console.log('startDrawing', this.activeTool);
    if (
      this.activeTool !== 'select' &&
      this.activeTool !== 'delete' &&
      (this.activeTool === 'rectangle' || this.activeTool === 'deduct' || this.activeTool === 'pointalign')
    ) {
      const transformedPointerPosition = this.layer.getRelativePointerPosition();
      this.x1 = transformedPointerPosition.x;
      this.y1 = transformedPointerPosition.y;
      this.isDrawing = true;
      this.isDragging = false;

      console.log('start drawing', this.x1, this.y1);

      if (this.activeTool === 'deduct' || this.activeTool === 'pointalign') {
        this.shape = new Konva.Rect({
          x: this.x1,
          y: this.y1,
          width: 0,
          height: 0,
          // fill: ,
          stroke: 'orange',
          strokeWidth: 2,
          dash: [10, 5],
        });

        this.layer.add(this.shape);
      }
    }
    if (this.activeTool === 'polyline' ||
      this.activeTool === 'line' ||
      this.activeTool === 'rectangle' ||
      this.activeTool === 'deduct' ||
      this.activeTool === 'pointalign'
    ) {
      const transformedPointerPosition = this.layer.getRelativePointerPosition();
      this.x1 = transformedPointerPosition.x;
      this.y1 = transformedPointerPosition.y;
      this.isDrawing = true;
      this.isDragging = false;

      // Initialize the length text element
      if (!this.feetText) {
        this.feetText = new Konva.Text({
          x: 0,
          y: 0,
          text: '',
          fontSize: 16,
          fontFamily: 'Calibri',
          fill: 'orange',
          listening: false // Ensure it doesn't interfere with other elements
        });
        this.layer.add(this.feetText);
      }
    }
    if (
      this.activeTool === 'rectangle' ||
      this.activeTool === 'line' ||
      this.activeTool === 'polygon' ||
      this.activeTool === 'polyline'
    ) {
      const pos = this.stage.getPointerPosition();
      console.log(pos.x, pos.y);
      if (pos) {
        // this.x1 = pos.x;
        // this.y1 = pos.y;
        this.isDrawing = true;
        let toolName = this.activeTool;
        // if (this.activeTool === 'line') {
        //   toolName = this.selectedSubTool;
        // }
        const currentid = this.getNumberOfSameCategory(toolName) + 1;
        this.currentId = `${toolName} ${currentid}`;
      }
    }
  }

  draw(): void {
    if (this.isDrawing) {
      // Transform the pointer position to the layer's coordinate system
      const transformedPointerPosition = this.layer.getRelativePointerPosition();

      // Use the transformed coordinates for drawing
      const x2 = transformedPointerPosition.x;
      const y2 = transformedPointerPosition.y;

      const width = x2 - this.x1;
      const height = y2 - this.y1;

      switch (this.activeTool) {
        case 'rectangle':
          // Draw Rectangle
          this.drawRectangle(this.x1, this.y1, width, height);

          // Calculate the size of the rectangle and convert as feet
          let sizeInFeet = Math.abs(width * height / (this.selectedScale * this.selectedScale)).toFixed(2);

          // Update the size text content and position
          this.feetText.text(`${sizeInFeet} ft²`);
          this.feetText.position({ x: x2 + 10, y: y2 + 10 });

          this.layer.moveToTop();
          break;
        case 'line':
          // if (this.selectedSubTool === 'line') {
          // Draw the line
          this.drawLine(this.x1, this.y1, x2, y2);

          // Calculate the length of the line and convert as feet
          const lengthInPixels = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
          const lengthInFeet = (lengthInPixels / this.selectedScale); // Replace 0.1 with your actual conversion factor

          let lengthStr = this.convertToFeetAndInches(lengthInFeet);

          // Update the length text content and position
          this.feetText.text(lengthStr);
          this.feetText.position({ x: x2 + 10, y: y2 + 10 });

          this.layer.moveToTop();
          // }
          break;
        case 'deduct':
          this.shape.width(width);
          this.shape.height(height);
          // Calculate the size of the rectangle and convert as feet
          const deductionSizeInFeet = Math.abs(width * height / (this.selectedScale * this.selectedScale)).toFixed(2);

          // Update the size text content and position
          this.feetText.text(`${deductionSizeInFeet} ft²`);
          this.feetText.position({ x: x2 + 10, y: y2 + 10 });
          break;
        case 'pointalign':
          // Draw Rectangle to select points
          this.shape.width(width);
          this.shape.height(height);
          break;
      }
      this.layer.batchDraw();
    }
  }

  stopDrawing(): void {
    if (this.isDrawing) {
      this.isDrawing = false;

      switch (this.activeTool) {
        case 'deduct':
          if (this.shape) {
            this.deductShape(this.shape as Konva.Rect); // Cast to Konva.Rect
            this.shape.destroy(); // Remove the temporary deduct rectangle
            this.shape = null;
            this.feetText.destroy();
            this.feetText = null;
          }
          break;
        case 'pointalign':
          if (this.shape) {
            // function to align the selected points
            this.alignSelectedPoints(this.shape as Konva.Rect);
            this.shape.destroy();
            this.shape = null;
          }
        case 'line':
        // if (this.activeTool === 'polyline') break;
        case 'rectangle':
          if (this.shape) {
            if (this.feetText.text().startsWith('0.00') || this.feetText.text() === '0\' 0"') {
              this.shape.destroy();
              this.feetText.destroy();
              this.feetText = null;
            } else {
              console.log('operation pushed - Create');
              this.operations.push('Create', this.shape, this.tableData.slice(), this.countTableData.slice());
            }
          }
          if (this.feetText || this.feetText.text()) {
            this.createTable(this.activeTool, this.feetText.text());
            this.feetText.destroy();
            this.feetText = null;
          }
          break;
        default:
          if (this.isDragging) {
            this.isDragging = false;
            this.addShapeListeners(this.shape);
          }
          break;
      }
      this.layer.batchDraw();
    }
  }

  selectShape(e: Konva.KonvaPointerEvent): void {
    // Reset all shapes and icons to their original state
    this.deselectAllShapes();

    // Ensure the active tool is "select" and the clicked target is not the stage or the image
    if (this.activeTool === 'select' && e.target !== this.stage && e.target !== this.imageNode) {
      const targetShape = e.target as Konva.Shape;

      // Highlight the selected shape or icon
      this.transformer.nodes([targetShape]);

      if (!targetShape.getAttr('isIcon')) {
        this.currentId = targetShape.id();
        if (!targetShape.getAttr('originalStroke')) {
          targetShape.setAttr('originalStroke', targetShape.stroke());
        }

        targetShape.stroke('orange');
        console.log(targetShape.strokeWidth());
        targetShape.strokeWidth(targetShape.strokeWidth() + 1);
      } else {
        if (!targetShape.getAttr('originalStroke')) {
          targetShape.setAttr('originalStroke', targetShape.stroke());
        }
        if (!targetShape.getAttr('originalStrokeWidth')) {
          targetShape.setAttr('originalStrokeWidth', targetShape.strokeWidth());
        }

        targetShape.stroke('orange'); // Add a orange border
        targetShape.strokeWidth(targetShape.strokeWidth()); // Keep the original stroke width
      }

      const editShape = e.target;
      if (editShape instanceof Konva.Line) {

        this.createPointCircles(editShape);
      }

      // Make the selected shape or icon draggable
      if (!targetShape.attrs.locked) {
        targetShape.draggable(true);
      }

      this.addShapeListeners(targetShape);

      this.layer.draw();
    }
  }

  createPointCircles(editShape: Konva.Line): void {
    const targetShape = editShape as Konva.Shape;
    const points = editShape.points(); // Get the points of the shape

    for (let i = 0; i < points.length - 1; i += 2) {
      const point_x = points[i];
      const point_y = points[i + 1];

      if (point_x === points[0] && point_y === points[1] && i === points.length - 2) {
        break;
      }

      console.log('targetShape', targetShape.position());

      const circle = new Konva.Circle({
        x: point_x + targetShape.position().x, // Set the x coordinate
        y: point_y + targetShape.position().y, // Set the y coordinate
        radius: 3, // Radius of the circle
        fill: 'orange', // Highlight color
        // stroke: 'black',
        strokeWidth: 1,
        name: 'point_circle'
      });

      // Change cursor on hover
      circle.on('mouseover', () => {
        this.stage.container().style.cursor = 'pointer';
      });

      circle.on('mouseout', () => {
        this.stage.container().style.cursor = 'default'; // Reset cursor
      });

      circle.draggable(true);

      // Update the shape points when the circle is dragged
      circle.on('dragmove', () => {
        const newPos = circle.position();
        const index = i / 2; // Calculate the index for the original points array
        editShape.points()[index * 2] = newPos.x - targetShape.position().x; // Update x
        editShape.points()[index * 2 + 1] = newPos.y - targetShape.position().y; // Update y
        editShape.points(editShape.points()); // Refresh points

        var currentEntry = this.tableData.find(entry => entry.name === editShape.id());
        if (currentEntry.size.includes('ft')) {
          let updatedSize = this.calculatePolygonArea(editShape.points());
          let convertedSize = this.convertToSquareFeet(updatedSize);
          this.tableData.forEach(entry => {
            if (entry.name === editShape.id()) {
              entry.size = `${convertedSize.toFixed(2)} ft²`;
              entry.sizeNum = convertedSize;
              console.log('Updated:', editShape.id());
            }
          });
        } else {
          let updatedLength = this.calculatePolylineLength(editShape.points());
          this.tableData.forEach(entry => {
            if (entry.name === editShape.id()) {
              entry.size = this.convertToFeetAndInches(updatedLength);
              entry.sizeNum = updatedLength;
            }
          });
        }

        this.layer.batchDraw(); // Optimize drawing
      });

      circle.on('click', () => {
        if (this.isPointDelete) {
          const index = i / 2;
          editShape.points().splice(index * 2, 2);
          editShape.points(editShape.points());
          this.isPointDelete = false;

          var currentEntry = this.tableData.find(entry => entry.name === editShape.id());
          if (currentEntry.size.includes('ft')) {
            let updatedSize = this.calculatePolygonArea(editShape.points());
            let convertedSize = this.convertToSquareFeet(updatedSize);
            this.tableData.forEach(entry => {
              if (entry.name === editShape.id()) {
                entry.size = `${convertedSize.toFixed(2)} ft²`;
                entry.sizeNum = convertedSize;
                console.log('Updated:', editShape.id());
              }
            });
          } else {
            let updatedLength = this.calculatePolylineLength(editShape.points());
            this.tableData.forEach(entry => {
              if (entry.name === editShape.id()) {
                entry.size = this.convertToFeetAndInches(updatedLength);
                entry.sizeNum = updatedLength;
              }
            });
          }
        }
      })

      this.layer.add(circle);
    }

    // Update point circles position when the target shape is dragged
    targetShape.on('dragmove', () => {
      const shapePosition = targetShape.position();
      console.log('!!!! editShape', editShape.points());
      console.log('!!!! shapePosition', shapePosition);
      const circles = this.layer.find('.point_circle');

      circles.forEach((circle, index) => {
        const pointIndex = index * 2;
        const updatedX = shapePosition.x + editShape.points()[pointIndex];
        const updatedY = shapePosition.y + editShape.points()[pointIndex + 1];
        circle.position({ x: updatedX, y: updatedY });
      });

      this.layer.batchDraw(); // Optimize drawing
    });

  }

  deselectAllShapes(): void {
    this.layer.find('.point_circle').forEach(circle => circle.destroy());
    this.layer.children.forEach((child) => {
      if (child instanceof Konva.Shape) {
        const konvaShape = child as Konva.Shape;

        if (!konvaShape.getAttr('isIcon')) {
          konvaShape.stroke(konvaShape.getAttr('originalStroke'));
          konvaShape.strokeWidth(konvaShape.getAttr('originalStrokeWidth'));
          // Reset stroke and strokeWidth for non-icon shapes
          this.currentId = '';
        }
        else {
          // For icons, reset the stroke and strokeWidth to their original state
          const originalStroke = konvaShape.getAttr('originalStroke');
          const originalStrokeWidth = konvaShape.getAttr('originalStrokeWidth');

          // Restore the original stroke and stroke width
          if (originalStroke !== undefined) {
            konvaShape.stroke(originalStroke);
          }

          if (originalStrokeWidth !== undefined) {
            konvaShape.strokeWidth(originalStrokeWidth);
          }
        }

        // Reset scale to 1 (original size) for all shapes and icons
        konvaShape.scale({ x: 1, y: 1 });

        // Make the shape or icon non-draggable
        konvaShape.draggable(false);
      }
    });

    // Deselect all nodes in the transformer
    this.transformer.nodes([]);
    this.layer.draw();
  }

  drawRectangle(x: number, y: number, width: number, height: number): void {
    if (this.isDragging) {
      this.shape.setAttr('width', width);
      this.shape.setAttr('height', height);
    } else {
      this.isDragging = true;
      this.shape = new Konva.Rect({
        x,
        y,
        width,
        height,
        // stroke: this.color, // Use the selected color
        // strokeWidth: this.lineWidth, // Border width
        fill: this.color, // Fill color
        name: 'outer-rect', // Assign a class name for easy selection
        id: this.currentId,
        locked: false,
      });
      this.shape.on('contextmenu', (event) => {
        this.showCustomContextMenu(event.evt);
      });

      this.layer.add(this.shape);
    }
  }

  drawLine(x1: number, y1: number, x2: number, y2: number) {
    if (this.isDragging) {

      this.shape.setAttr('points', [x1, y1, x2, y2]);
    } else {
      this.isDragging = true;
      this.shape = new Konva.Line({
        points: [x1, y1, x2, y2],
        stroke: this.color,
        strokeWidth: this.lineWidth,
        name: 'line-length',
        id: this.currentId
      });

      this.shape.on('contextmenu', (event) => {
        this.showCustomContextMenu(event.evt);
      });

      this.shape.setAttr('originalStroke', this.color);
      this.shape.setAttr('originalStrokeWidth', this.lineWidth);

      this.layer.add(this.shape);
    }
  }

  deleteShape(): void {
    if (this.transformer.nodes().length > 0) {
      const node = this.transformer.nodes()[0];

      console.log('operation pushed - Delete');
      this.operations.push('Delete', node.clone(), this.tableData.slice(), this.countTableData.slice());

      // Remove node from table data
      const node_id = node.id();
      this.tableData = this.tableData.filter(entry => entry.name !== node_id);
      this.updateToolStatus();

      const iconSrc = node.getAttr('iconSrc');
      const category = node.getAttr('category');
      if (iconSrc && category) {
        let existingEntry = this.countTableData.find(entry => entry.category === category && entry.iconSrc === iconSrc);
        if (existingEntry) {
          existingEntry.count -= 1; // Decrease the count by one

          if (existingEntry.count <= 0) {
            this.countTableData = this.countTableData.filter(entry => entry !== existingEntry);
          }
        }
      }

      node.remove();
      this.deselectAllShapes();
      this.transformer.nodes([]); // Clear the transformer nodes to avoid issues

      this.layer.draw();
    }
  }

  addShapeListeners(shape: Konva.Shape): void {
    shape.on('dragstart', () => {
      console.log('dragstart');
      // Clone the shape before dragging starts to store the initial state
      this.shape = shape.clone();
    });

    shape.on('dragend', () => {
      console.log('operation pushed - Update dragend');
      // Push the updated state after dragging ends
      this.operations.push('Update', this.shape, this.tableData.slice(), this.countTableData.slice());
    });

    shape.on('transformstart', () => {
      console.log('transformstart');
      // Clone the shape before transformation starts to store the initial state
      this.shape = shape.clone();
    });

    shape.on('transformend', () => {
      console.log('operation pushed - Update transformend');
      // Push the updated state after transformation ends
      this.operations.push('Update', this.shape, this.tableData.slice(), this.countTableData.slice());
    });
  }

  selectTool(toolName: string): void {
    if (toolName !== 'count') {
      this.selectedCountData = null;
    } else {
      this.showCountDialog = true;
    }

    if (toolName === 'setscale') {
      this.showScaleDialog = true;
    } else {
      this.showScaleDialog = false;
    }

    if (toolName === 'rotate') {
      this.rotateImage(90);
    }

    if (toolName === 'linewidth') {
      this.showSetWidthDialog = true;
      return;
    } else {
      this.showSetWidthDialog = false;
    }

    if (toolName === 'aimeasure') {
      this.aiMeasure();
    } else if (toolName === 'wallmeasure') {
      this.wallMeasure();
    }

    this.clearAnnotation();

    if (toolName === 'delete') {
      this.deleteShape();
    } else if (toolName === 'undo') {
      this.undo();
      this.deselectAllShapes();
      if (this.activeTool === 'polygon') {
        this.closePolygon();
        this.startPolygonDrawing();
      }
      if (this.activeTool === 'polyline') {
        this.closePolyline();
        this.startPolylineDrawing();
      }
    } else if (toolName === 'zoomin') {
      this.zoomIn();
    } else if (toolName === 'zoomout') {
      this.zoomOut();
    } else if (toolName === 'colorselect') {
      this.showColorPicker = true;
      // this.activeTool = toolName;
    } else {
      if (toolName !== 'pointalign') {
        this.deselectAllShapes();
      }
      this.activeTool = toolName;
      if (
        toolName === 'rectangle' ||
        toolName === 'polygon' ||
        toolName === 'line' ||
        toolName === 'polyline' ||
        toolName === 'deduct' ||
        toolName === 'pointalign'
      ) {
        this.stage.container().style.cursor = 'crosshair';
      } else {
        this.stage.container().style.cursor = 'auto';
      }

      if (toolName === 'polygon') {
        this.startPolygonDrawing();
      } else {
        this.endPolygonDrawing(true);
      }

      if (toolName === 'polyline') {
        this.startPolylineDrawing();
      } else {
        this.endPolylineDrawing();
      }
    }

    // if (this.tools.find(item => item.name === toolName)?.hasSubtools === true) {
    //   this.dropdownOpen = true;
    // } else {
    //   this.dropdownOpen = false;
    // }

    this.selectedTool = this.tools.find(tool => tool.name === toolName) ||
      this.tools
        .filter(tool => tool.hasSubtools)
        .flatMap(tool => tool.subtools)
        .find(subtool => subtool.name === toolName);

    console.log('selectedTool:', this.selectedTool);
  }

  rotateImage(degrees: number): void {
    const originX = this.imageNode.x();
    const originY = this.imageNode.y();

    var startX = 0;
    var startY = 0;

    // Rotate the image around the center of the stage
    if (this.imageNode) {

      // Update image position
      const currentRotation = this.imageNode.rotation();
      const imageWidth = this.imageNode.width(), imageHeight = this.imageNode.height();
      switch (currentRotation) {
        case 0:
          startX += imageHeight;
          break;
        case 90:
          startY += imageHeight;
          startX = startX + imageWidth - imageHeight;
          break;
        case 180:
          startX -= imageWidth;
          startY = startY - imageHeight + imageWidth;
          break;
        case 270:
          startY -= imageWidth;
          break;
      }

      this.imageNode.x(originX + startX);
      this.imageNode.y(originY + startY);

      console.log(startX, startY);

      // Apply the rotation
      this.imageNode.rotation((currentRotation + degrees) % 360);
    }

    // Rotate all shapes in the layer around the center of the stage
    this.layer.children.forEach((child) => {
      if (child !== this.imageNode && child !== this.transformer) {
        // Calculate the distance from the center of the stage to the shape's current position
        const dx = child.x() - originX;
        const dy = child.y() - originY;

        const distance = Math.sqrt(dx * dx + dy * dy);
        const currentAngle = Math.atan2(dy, dx);
        const newAngle = currentAngle + degrees * Math.PI / 180;

        // Update shape position
        child.x(originX + distance * Math.cos(newAngle) + startX);
        child.y(originY + distance * Math.sin(newAngle) + startY);

        // Apply the rotation
        const currentShapeRotation = child.rotation();
        child.rotation((currentShapeRotation + degrees) % 360);
      }
    });

    const newHeight = this.currentWidth;
    const newWidth = this.currentHeight;

    this.currentWidth = newWidth;
    this.currentHeight = newHeight;

    let temp = this.width;
    this.width = this.height;
    this.height = temp;

    console.log('rotateImage', newWidth, newHeight);

    this.stage.size({ width: newWidth, height: newHeight });
    const container = this.stage.container();
    container.style.overflow = 'scroll';
    container.style.width = `${newWidth} px`;
    container.style.height = `${newHeight} px`;

    // Redraw the layer to apply changes
    this.layer.batchDraw();
  }

  startPolygonDrawing(): void {
    if (this.activeTool !== 'polygon') {
      return;
    }
    console.log('startPolygonDrawing');
    this.isPolygonDrawing = true;
    this.polygonPoints = [];
    this.polygonLine = new Konva.Line({
      points: [],
      stroke: this.color,
      strokeWidth: this.lineWidth,
      lineCap: 'round',
      lineJoin: 'round',
    });
    this.polygonLine.on('contextmenu', (event) => {
      this.showCustomContextMenu(event.evt);
    });

    this.layer.add(this.polygonLine);

    // Event listener for double click to close the polygon
    console.log('polygon points', this.polygonPoints.length);
    this.stage.on('dblclick', this.closePolygon.bind(this));
  }

  handlePolygonClick(e: Konva.KonvaPointerEvent): void {
    if (this.activeTool !== 'polygon' || !this.isPolygonDrawing) {
      return;
    }

    const pointerPosition = this.layer.getRelativePointerPosition();
    let lastIndex = this.polygonPoints.length;
    if (pointerPosition.x === this.polygonPoints[lastIndex - 2] && pointerPosition.y === this.polygonPoints[lastIndex - 1]) {
      return;
    }

    this.polygonPoints.push(pointerPosition.x, pointerPosition.y);
    console.log('handlePolygonClick pushed', this.polygonPoints);

    this.polygonLine.points(this.polygonPoints);
    this.layer.batchDraw();


  }

  closePolygon(): void {
    if (this.isPolygonDrawing && this.polygonPoints.length > 4) {
      // Close the polygon by connecting the last point to the first
      console.log('closePolygon', this.polygonPoints);

      // this.polygonPoints.push(this.polygonPoints[0], this.polygonPoints[1]);

      this.endPolygonDrawing(true);

      this.startPolygonDrawing(); // Restart polygon drawing after finishing one
    }
  }

  updatePolygonLine(): void {
    if (this.activeTool !== 'polygon' || !this.isPolygonDrawing) return;

    const pointerPosition = this.layer.getRelativePointerPosition();
    const points = [...this.polygonPoints, pointerPosition.x, pointerPosition.y];

    // Update the length text content and position
    if (this.polygonPoints.length > 1) {
      // Calculate and display the polygon area
      const polygonArea = this.calculatePolygonArea(points);
      const areaInSquareFeet = this.convertToSquareFeet(polygonArea);

      if (!this.feetText) {
        this.feetText = new Konva.Text({
          x: 0,
          y: 0,
          text: '',
          fontSize: 16,
          fontFamily: 'Calibri',
          fill: 'orange',
          // visible: false, // Initially invisible
          listening: false // Ensure it doesn't interfere with other elements
        });
        this.layer.add(this.feetText);
      }

      this.feetText.text(`${areaInSquareFeet.toFixed(2)} ft²`);
      this.feetText.position({ x: pointerPosition.x + 10, y: pointerPosition.y + 10 });

      // Calculate and display the angle if there are at least three points
    }

    this.polygonLine.points(points);
    this.layer.batchDraw();
  }

  endPolygonDrawing(closePolygon: boolean = false): void {
    if (this.activeTool === 'polygon' && this.isPolygonDrawing) {
      if (this.polygonPoints.length <= 4) {
        this.layer.batchDraw();
        return; // A polygon cannot be formed with fewer than 3 points
      }

      // this.polygonPoints.push(this.polygonPoints[0], this.polygonPoints[1]);

      this.polygon = new Konva.Line({
        points: this.polygonPoints,
        stroke: this.color,
        strokeWidth: this.lineWidth,
        fill: this.color,
        closed: true,
        lineCap: 'round',
        lineJoin: 'round',
        name: 'polygon-shape', // deduct polygon
        id: this.currentId
      });
      this.polygon.on('contextmenu', (event) => {
        this.showCustomContextMenu(event.evt);
      });

      this.layer.add(this.polygon);
      this.polygonLine.destroy(); // Remove the temporary line
      this.layer.batchDraw();

      // Remove the double-click event listener after the polygon is completed
      this.stage.off('dblclick', this.closePolygon);

      console.log('operation pushed - Create');
      this.operations.push('Create', this.polygon, this.tableData.slice(), this.countTableData.slice());

      this.createTable('polygon', this.feetText.text());
      this.feetText.destroy();
      this.feetText = null;

      // Remove the angle text when done
      if (this.angleText) {
        this.angleText.destroy();
        this.angleText = null;
      }
    }

    // Reset polygon drawing state
    this.isPolygonDrawing = false;
    this.polygonPoints = [];
    this.polygonLine = null;
  }

  isActive(toolName: string): boolean {
    return this.selectedTool?.name === toolName;
  }

  zoomIn(): void {
    if (this.zoomLevel < 10) {
      this.zoomLevel += 1;
      this.updateZoom();
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 1) {
      this.zoomLevel -= 1;
      this.updateZoom();
    }
  }

  updateZoom(): void {
    const scale = this.zoomLevel;
    this.stage.scale({ x: scale, y: scale });

    const container = this.stage.container();
    // const containerRect = container.getBoundingClientRect();

    // Adjust the position of the stage so that it stays within view
    this.currentWidth = this.width * scale;
    this.currentHeight = this.height * scale;

    console.log('update zoom:', this.currentWidth, this.currentHeight);

    // Update the stage size to match the new scale
    this.stage.size({ width: this.currentWidth, height: this.currentHeight });

    // Update the scrollbars based on the new scale and position
    container.style.overflow = 'scroll';
    container.style.width = `${this.currentWidth} px`;
    container.style.height = `${this.currentHeight} px`;

    // Update the zoom percentage display
    const zoomPercentageElement = document.getElementById('zoomPercentage');
    if (zoomPercentageElement) {
      zoomPercentageElement.innerText = `${Math.round(scale * 100)}%`;
    }

    this.stage.batchDraw();
  }

  // Method to handle the mouse movement during rotation
  handleMouseMove(e: Konva.KonvaPointerEvent): void {
    if (this.isRotating) {
      const pointerPosition = this.stage.getPointerPosition();

      // Get the center of the layer in the stage's coordinate space
      const rotationCenter = {
        x: this.layer.x() + this.layer.width() / 2,
        y: this.layer.y() + this.layer.height() / 2,
      };

      // Calculate the current angle between the pointer and the center of the layer
      const angle = Math.atan2(pointerPosition.y - rotationCenter.y, pointerPosition.x - rotationCenter.x);
      const currentRotation = angle * (180 / Math.PI); // Convert radians to degrees
      const rotationDifference = currentRotation - this.startRotation;

      // Apply the rotation difference to the layer's initial rotation
      this.layer.rotation(this.initialRotation + rotationDifference);

      this.layer.batchDraw();
    }
  }

  // Methods to hide color picker
  hideUnnecessaryItems(): void {
    this.showColorPicker = false;
    this.showAnnotateArea = false;
    this.showScaleDialog = false;
    this.showSetWidthDialog = false;
    this.dropdownOpen = false;
  }

  handleColorSelected(colorData: { color: string, opacity: number }): void {
    console.log('colorData', colorData, this.contextColorDialog, this.lineColorDialog);

    if (this.contextColorDialog && this.currentContextShape) {
      this.contextColorDialog = false;
      this.currentContextShape.fill(this.hexToRgba(colorData.color, colorData.opacity));
    } else if (this.lineColorDialog) {
      this.lineColorDialog = false;
      console.log('lineColor', this.currentContextShape);
      const rgbColor = this.hexToRgba(colorData.color, colorData.opacity);
      this.currentContextShape.stroke(rgbColor);
      this.currentContextShape.setAttr('originalStroke', colorData.color);
    } else {
      this.color = this.hexToRgba(colorData.color, colorData.opacity);
    }
  }

  closeColorDialog(): void {
    this.showColorPicker = false;
  }

  // Convert HEX color to RGBA
  hexToRgba(hex: string, opacity: number): string {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Extract opacity from an RGBA color string
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

  handleAnnotationClick(e: Konva.KonvaPointerEvent): void {
    if (this.activeTool === 'annotate') {
      // If there's already an active annotation, save it
      if (this.activeAnnotation) {
        this.saveAnnotation();
      }

      const scale = this.stage.scaleX();

      // Get the pointer position relative to the stage considering scaling and panning
      const pointerPosition = this.stage.getPointerPosition();

      // Calculate the correct position for annotation considering scale and stage position
      this.annotateX = pointerPosition.x / scale;
      this.annotateY = pointerPosition.y / scale;

      // Adjust the annotation picker position
      this.adjustedAnnotateX = e.evt.clientX;
      this.adjustedAnnotateY = e.evt.clientY - 80;

      this.showAnnotateArea = true;

      // Create a new annotation text element at the clicked position
      this.activeAnnotation = new Konva.Text({
        x: this.annotateX,
        y: this.annotateY,
        text: this.annotateText,
        fontSize: 14,
        fontFamily: 'Calibri',
        fontStyle: '300',
        fill: 'black',
        draggable: true,
        id: `annotate ${this.getNumberOfAnnotate() + 1}`
      });

      this.layer.add(this.activeAnnotation);
      this.layer.draw();

      // Automatically focus on the newly created annotation
      setTimeout(() => {
        const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
        }
      }, 0);
    }
  }

  saveAnnotation(): void {
    if (this.activeAnnotation) {
      this.activeAnnotation.text(this.annotateText); // Update the text of the annotation
      console.log('Operations pushed - Create', this.activeAnnotation.text());
      this.operations.push('Create', this.activeAnnotation, this.tableData.slice(), this.countTableData.slice());

      this.activeAnnotation = null; // Clear the active annotation
    }
    this.showAnnotateArea = false;
    this.annotateText = '';
    this.layer.draw();
  }

  cancelAnnotation(): void {
    this.annotateText = '';
    this.showAnnotateArea = false;
  }

  clearAnnotation(): void {
    this.showAnnotateArea = false;
    this.activeAnnotation = null;
    this.annotateText = '';
  }

  handleCancelCount() {
    this.showCountDialog = false;
  }

  handleImageClick(e: Konva.KonvaPointerEvent): void {
    if (this.selectedCountData) {
      const pointerPosition = this.layer.getRelativePointerPosition();
      this.addCountMarker(pointerPosition.x, pointerPosition.y, this.selectedCountData);

      // Check if the combination of category and icon already exists in the table
      let existingEntry = this.countTableData.find(entry => entry.category === this.selectedCountData.category && entry.iconSrc === this.selectedCountData.iconSrc);

      if (existingEntry) {
        existingEntry.count += 1;  // Increment the count for the existing entry
      } else {
        // Add a new entry if it doesn't exist (this case should be rare since we handle it during creation)
        this.countTableData.push({
          category: this.selectedCountData.category,
          count: 1,  // Start with count 1
          iconSrc: this.selectedCountData.iconSrc,
        });
        console.log('handleImageClick, countTableData = ', this.countTableData);
      }
    }
  }

  // Method to add the icon marker
  addCountMarker(x: number, y: number, data: any) {
    let marker: Konva.Shape;

    let strokeWidth = 4; // Default
    let size = 8; // Default

    const markerId = `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    switch (data.lineSize) {
      case 'Thin':
        strokeWidth = 2;
        break;
      case 'Medium':
        strokeWidth = 6;
        break;
      case 'Thick':
        strokeWidth = 8;
        break;
      case 'Very Thick':
        strokeWidth = 10;
        break;
    }

    switch (data.symbolSize) {
      case 'Small':
        size = 4;
        break;
      case 'Medium':
        size = 8;
        break;
      case 'Big':
        size = 12;
        break;
    }

    switch (data.icon) {
      case 'circle':
        marker = new Konva.Circle({
          x,
          y,
          radius: size,
          fill: data.color,
          stroke: data.color,
          strokeWidth: strokeWidth,
          id: markerId,
          isIcon: true,
        });
        break;
      case 'square':
        marker = new Konva.Rect({
          x: x - size, // Adjust position for centering
          y: y - size, // Adjust position for centering
          width: size * 2,
          height: size * 2,
          fill: data.color,
          stroke: data.color,
          strokeWidth: strokeWidth,
          id: markerId,
          isIcon: true,
        });
        break;
      case 'triangle':
        marker = new Konva.Line({
          points: [x, y - size, x + size, y + size, x - size, y + size], // Triangle vertices
          fill: data.color,
          stroke: data.color,
          strokeWidth: strokeWidth,
          closed: true,
          id: markerId,
          isIcon: true,
        });
        break;
      case 'checkmark':
        marker = new Konva.Line({
          points: [x - size, y, x, y + size, x + size, y - size], // Checkmark shape
          stroke: data.color,
          strokeWidth: strokeWidth,
          lineCap: 'round',
          lineJoin: 'round',
          id: markerId,
          isIcon: true,
        });
        break;
      case 'upward':
        marker = new Konva.Line({
          points: [x, y - size, x - size, y + size, x, y, x + size, y + size], // upward shape
          stroke: data.color, // Ensure the stroke color remains the selected color
          strokeWidth: strokeWidth,
          lineCap: 'round',
          lineJoin: 'round',
          closed: true,
          id: markerId,
          isIcon: true,
        });
        break;
    }

    marker.setAttr('category', data.category);
    marker.setAttr('iconSrc', data.iconSrc);
    // Push to operations
    console.log('operation pushed - Create', this.countTableData);
    this.operations.push('Create', marker.clone(), this.tableData.slice(), this.countTableData.slice());

    this.layer.add(marker);
    this.layer.draw();
  }

  // Updated handler for creating a count
  handleCreateCount(data: any) {
    console.log('New Count:', data);
    this.selectedCountData = data; // Store the count data for later use
    this.showCountDialog = false;

    // Generate the icon based on selected shape, color, and size
    const iconCanvas = document.createElement('canvas');
    const ctx = iconCanvas.getContext('2d');
    const fixedSize = 16; // Fixed size for table display
    iconCanvas.width = fixedSize;
    iconCanvas.height = fixedSize;

    // Ensure the icon is drawn proportionally within the fixed size
    const drawSize = fixedSize - 4; // Leave some padding for consistent appearance
    const halfSize = drawSize / 2;

    ctx.fillStyle = data.color;
    ctx.strokeStyle = data.color;
    ctx.lineWidth = 2; // Fixed line width for consistent appearance

    switch (data.icon) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(fixedSize / 2, fixedSize / 2, halfSize, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(2, 2, drawSize, drawSize); // Add padding for consistent size
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(fixedSize / 2, 2);
        ctx.lineTo(fixedSize - 2, fixedSize - 2);
        ctx.lineTo(2, fixedSize - 2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'checkmark':
        ctx.beginPath();
        ctx.moveTo(2, halfSize);
        ctx.lineTo(halfSize, fixedSize - 2);
        ctx.lineTo(fixedSize - 2, 2);
        ctx.stroke();
        break;
      case 'upward':
        ctx.beginPath();
        ctx.moveTo(fixedSize / 2, 0);
        ctx.lineTo(0, fixedSize - 2);
        ctx.lineTo(fixedSize / 2, fixedSize / 2);
        ctx.lineTo(fixedSize, fixedSize - 2);
        ctx.closePath();
        ctx.fill();
        break;
    }

    const iconSrc = iconCanvas.toDataURL(); // Generate image data URL

    this.selectedCountData.iconSrc = iconSrc;

    // Check if the category is already in the table
    let existingEntry = this.countTableData.find(entry => entry.category === data.category && entry.iconSrc === iconSrc);

    if (!existingEntry) {
      // Add a new entry to the table if the category is not yet listed
      this.countTableData.push({
        category: data.category,
        count: 0,  // Initial count is 0, it will increase when the icons are drawn
        iconSrc: iconSrc,  // Use the generated icon data URL
      });
      console.log('handleCreateCount, countTableData = ', this.countTableData);
    } else {
      existingEntry.iconSrc = iconSrc; // Update the icon in case the same category is used
    }
  }

  deductShape(innerRect: Konva.Rect): void {
    const scale = this.stage.scaleX(); // Assuming uniform scaling (same scale for X and Y)
    // Find all shapes to deduct from (rectangles, polygons, or images)
    const shapesToDeduct = this.layer.find<Konva.Shape>('.outer-rect, .polygon-shape, .deductible-image');

    shapesToDeduct.forEach((shapeToDeduct) => {
      // If the shape is a rectangle or polygon, convert it to an image first
      if (shapeToDeduct instanceof Konva.Rect || shapeToDeduct instanceof Konva.Line) {
        shapeToDeduct = this.convertShapeToImage(shapeToDeduct);
      }

      // Get the bounds of the shape to deduct and the inner rectangle
      const shapeBounds = shapeToDeduct.getClientRect();
      const deductBounds = innerRect.getClientRect();

      const scaledShapeBounds = {
        x: shapeBounds.x / scale,
        y: shapeBounds.y / scale,
        width: shapeBounds.width / scale,
        height: shapeBounds.height / scale
      };

      const scaledDeductBounds = {
        x: deductBounds.x / scale,
        y: deductBounds.y / scale,
        width: deductBounds.width / scale,
        height: deductBounds.height / scale
      };

      // Calculate the intersection rectangle
      const intersection = {
        x: Math.max(scaledShapeBounds.x, scaledDeductBounds.x),
        y: Math.max(scaledShapeBounds.y, scaledDeductBounds.y),
        width: Math.min(scaledShapeBounds.x + scaledShapeBounds.width, scaledDeductBounds.x + scaledDeductBounds.width) - Math.max(scaledShapeBounds.x, scaledDeductBounds.x),
        height: Math.min(scaledShapeBounds.y + scaledShapeBounds.height, scaledDeductBounds.y + scaledDeductBounds.height) - Math.max(scaledShapeBounds.y, scaledDeductBounds.y)
      };

      // Check if there's an actual intersection
      if (intersection.width > 0 && intersection.height > 0) {
        const intersectionAreaSize = intersection.width * intersection.height / (this.selectedScale * this.selectedScale);
        const intersectionAreaInFeet = intersectionAreaSize.toFixed(2); // Adjust 10 for your pixel-to-feet conversion factor

        // Create an offscreen canvas with the size of the shape to deduct
        const canvas = document.createElement('canvas');
        canvas.width = scaledShapeBounds.width * scale;
        canvas.height = scaledShapeBounds.height * scale;
        const context = canvas.getContext('2d');

        if (context) {
          // Translate the canvas to align with the shape's position
          context.translate(-scaledShapeBounds.x * scale, -scaledShapeBounds.y * scale);

          // Redraw the existing shape on the canvas
          if (shapeToDeduct instanceof Konva.Image) {
            // Draw the existing image onto the canvas
            context.drawImage(shapeToDeduct.image(), shapeToDeduct.x() * scale, shapeToDeduct.y() * scale);
          } else {
            context.fillStyle = shapeToDeduct.fill();

            if (shapeToDeduct instanceof Konva.Rect) {
              context.fillRect(shapeToDeduct.x() * scale, shapeToDeduct.y() * scale, shapeToDeduct.width() * scale, shapeToDeduct.height() * scale);
            } else if (shapeToDeduct instanceof Konva.Line) {
              context.beginPath();
              const points = shapeToDeduct.points().map(p => p * scale);
              context.moveTo(points[0], points[1]);
              for (let i = 2; i < points.length; i += 2) {
                context.lineTo(points[i], points[i + 1]);
              }
              context.closePath();
              context.fill();
            }
          }

          console.log('innerRect =', innerRect.x(), innerRect.y(), innerRect.width(), innerRect.height());

          // Apply the deduction using destination-out
          context.globalCompositeOperation = 'destination-out';
          context.globalAlpha = 1;
          context.fillRect(scaledDeductBounds.x * scale, scaledDeductBounds.y * scale, scaledDeductBounds.width * scale, scaledDeductBounds.height * scale);

          // Create a new Konva image using the resulting canvas
          const image = new Konva.Image({
            x: scaledShapeBounds.x,
            y: scaledShapeBounds.y,
            image: canvas,
            width: scaledShapeBounds.width,
            height: scaledShapeBounds.height,
            name: 'deductible-image',
            id: shapeToDeduct.id(),
            // opacity: this.extractOpacity(shapeToDeduct.fill().toString()), // Preserve the original opacity
          });
          image.on('contextmenu', (event) => {
            this.showCustomContextMenu(event.evt);
          });

          console.log('operation pushed - Update');
          this.operations.push('Update', shapeToDeduct, this.tableData.slice(), this.countTableData.slice()); // Save the new state

          // Remove the original shape
          shapeToDeduct.destroy();

          // Update the shape's table entry with the deducted area
          const shapeId = shapeToDeduct.id();
          const originalSizeEntry = this.tableData.find(entry => entry.name === shapeId);

          if (originalSizeEntry) {
            // Calculate the number of non-transparent pixels before the deduction
            const originalCanvas = document.createElement('canvas');
            originalCanvas.width = scaledShapeBounds.width * scale;
            originalCanvas.height = scaledShapeBounds.height * scale;
            const originalContext = originalCanvas.getContext('2d');

            if (originalContext) {
              // Draw the original shape
              originalContext.drawImage((shapeToDeduct as Konva.Image).image(), 0, 0);

              // Get image data to count non-transparent pixels
              const originalImageData = originalContext.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
              const originalPixels = originalImageData.data;
              let originalNonTransparentPixels = 0;

              for (let i = 3; i < originalPixels.length; i += 4) {
                if (originalPixels[i] > 0) { // Alpha channel is not transparent
                  originalNonTransparentPixels++;
                }
              }

              // Perform deduction (destination-out operation)
              context.globalCompositeOperation = 'destination-out';
              context.globalAlpha = 1;
              context.fillRect(scaledDeductBounds.x * scale, scaledDeductBounds.y * scale, scaledDeductBounds.width * scale, scaledDeductBounds.height * scale);

              // Get the number of non-transparent pixels after deduction
              const deductedImageData = context.getImageData(0, 0, canvas.width, canvas.height);
              const deductedPixels = deductedImageData.data;
              let remainingNonTransparentPixels = 0;

              for (let i = 3; i < deductedPixels.length; i += 4) {
                if (deductedPixels[i] > 0) { // Alpha channel is not transparent
                  remainingNonTransparentPixels++;
                }
              }

              // Convert pixel count to area in feet
              const totalPixels = originalCanvas.width * originalCanvas.height;
              const originalArea = originalSizeEntry.sizeNum;
              const remainingArea = (remainingNonTransparentPixels / originalNonTransparentPixels) * originalArea;

              if (remainingArea >= 0.01) {
                originalSizeEntry.size = `${remainingArea.toFixed(2)} ft²`;
                originalSizeEntry.sizeNum = remainingArea;
              } else {
                this.tableData = this.tableData.filter(item => item.name !== originalSizeEntry.name);
                this.updateToolStatus();
                return;
              }
            }
          }

          console.log(`Deducted area for ${shapeId}: ${intersectionAreaInFeet} ft²`);

          // Add the resulting image to the layer
          this.layer.add(image);
        }
      }
    });

    // Redraw the layer to reflect all changes
    this.layer.draw();
  }

  convertShapeToImage(shape: Konva.Rect | Konva.Line): Konva.Image {
    const scale = this.stage.scaleX(); // Assuming uniform scaling (same scale for X and Y)

    // Get the bounds of the shape
    const shapeBounds = shape.getClientRect();
    const scaledShapeBounds = {
      x: shapeBounds.x / scale,
      y: shapeBounds.y / scale,
      width: shapeBounds.width / scale,
      height: shapeBounds.height / scale
    };

    // Create an offscreen canvas with the size of the shape
    const canvas = document.createElement('canvas');
    canvas.width = scaledShapeBounds.width * scale;
    canvas.height = scaledShapeBounds.height * scale;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Failed to get canvas context');
      return;
    }

    // Translate the canvas to align with the shape's position
    context.translate(-scaledShapeBounds.x * scale, -scaledShapeBounds.y * scale);

    // Draw the shape onto the canvas
    if (shape instanceof Konva.Rect) {
      context.fillStyle = shape.fill();
      context.fillRect(shape.x() * scale, shape.y() * scale, shape.width() * scale, shape.height() * scale);
    } else if (shape instanceof Konva.Line) {
      context.fillStyle = shape.fill();
      context.beginPath();
      const points = shape.points().map(p => p * scale);
      context.moveTo(points[0], points[1]);
      for (let i = 2; i < points.length; i += 2) {
        context.lineTo(points[i], points[i + 1]);
      }
      context.closePath();
      context.fill();
    } else {
      console.error('Unsupported shape type');
      return;
    }

    // Create a new Konva image using the resulting canvas
    const image = new Konva.Image({
      x: scaledShapeBounds.x,
      y: scaledShapeBounds.y,
      image: canvas,
      width: scaledShapeBounds.width,
      height: scaledShapeBounds.height,
      name: 'deductible-image',
      id: shape.id() // Preserving the original ID
    });
    image.on('contextmenu', (event) => {
      this.showCustomContextMenu(event.evt);
    });

    // Add the resulting image to the layer
    this.layer.add(image);

    // Remove the original shape from the layer
    shape.destroy();

    // Redraw the layer to reflect the changes
    this.layer.draw();

    return image;
  }


  closeScaleDialog() {
    this.showScaleDialog = false;
  }

  selectLineWidth(width: number): void {
    this.lineWidth = width;
    this.showSetWidthDialog = false;
    console.log('showSetWidthDialog', this.showSetWidthDialog, this.lineWidth);
  }

  calculatePolygonArea(points: number[]): number {
    let area = 0;
    const n = points.length / 2;

    for (let i = 0; i < n - 1; i++) {
      const x1 = points[2 * i];
      const y1 = points[2 * i + 1];
      const x2 = points[2 * (i + 1)];
      const y2 = points[2 * (i + 1) + 1];

      area += (x1 * y2 - y1 * x2);
    }

    // Add the last vertex to the first
    const xN = points[2 * (n - 1)];
    const yN = points[2 * (n - 1) + 1];
    const x0 = points[0];
    const y0 = points[1];

    area += (xN * y0 - yN * x0);

    return Math.abs(area / 2);
  }

  convertToSquareFeet(polygonArea: number): number {
    const conversionFactor = this.selectedScale * this.selectedScale; // Area conversion
    return polygonArea / conversionFactor;
  }

  createTable(_category: string, size: string) {
    if (!size) return;
    const sizeArr = size.split(' ');

    var sizeNum = 0;
    if (sizeArr[1].includes('ft')) {
      sizeNum = parseFloat(sizeArr[0]);
    } else {
      const feetNum = parseInt(sizeArr[0].replace("'", ''));
      const inchNum = parseInt(sizeArr[1].replace('"', ''));
      sizeNum = parseFloat((feetNum + inchNum / 12).toFixed(2));
    }
    this.tableData.push({ name: this.currentId, displayName: this.currentId, size, sizeNum });
    this.updateToolStatus();
    this.currentId = '';
  }

  updateTable(name: string, size: string) {
    // Check if the category already exists in the table data
    const existingEntry = this.tableData.find(entry => entry.name === name);
    const sizeNum = parseFloat(size.split(' ')[0]);
    if (existingEntry) {
      existingEntry.size = size; // Update the existing entry
      existingEntry.sizeNum = sizeNum;
    } else {
      this.tableData.push({ name, displayName: name, size, sizeNum }); // Add a new entry
      this.updateToolStatus();
    }
  }

  enableEdit(entry: any): void {
    // Disable editing for other rows
    this.tableData.forEach(e => e.editing = false);
    entry.editing = true;
    this.tempDisplayName = entry.displayName;
  }

  disableEdit(entry: any): void {
    entry.editing = false;
  }

  saveEdit(entry: any): void {
    entry.editing = false;
    if (this.tempDisplayName !== entry.displayName) {
      entry.displayName = this.tempDisplayName;
      this.updateShapeId(entry);
      this.updateTableEntry(entry);
    }
  }

  updateShapeId(entry: any): void {
    const oldId = entry.name; // Store old name for reference
    const newId = entry.name; // New name entered by the user

    // Find the shape with the old ID
    const shape = this.layer.find<Konva.Shape>('.outer-rect, .polygon-shape, .polyline-shape, .line-length, .deductible-image').find(s => s.id() === oldId);

    if (shape) {
      shape.id(newId);  // Update the shape's ID to the new name
      this.currentId = newId;  // Update the currentId with the new value
    }

    this.layer.draw(); // Redraw the layer to reflect changes
  }

  // Update table entry logic (you can modify this as needed)
  updateTableEntry(entry: any): void {
    const existingEntry = this.tableData.find(e => e.name === entry.name);
    if (existingEntry) {
      existingEntry.name = entry.name;
    }
  }

  onTableEntrySelect(id: string): void {
    this.deselectAllShapes();

    const pointCircles = this.layer.find<Konva.Shape>('.point_circle');
    pointCircles.forEach(circle => circle.destroy());

    const tableShapes = this.layer.find<Konva.Shape>('.outer-rect, .polygon-shape, .polyline-shape, .line-length, .deductible-image');
    const shape = tableShapes.find(shape => shape.id() === id);
    if (shape) {
      // Highlight the selected shape or icon
      this.transformer.nodes([shape]);

      // For non-icon shapes, change stroke color and stroke width
      shape.stroke('orange');
      shape.strokeWidth(2);

      if (shape instanceof Konva.Line) {
        this.createPointCircles(shape as Konva.Line);
      }

      shape.draggable(true);

      this.currentId = id; // Update the currentId to the selected shape ID
    }

    this.layer.draw();
  }

  getNumberOfSameCategory(category: string) {
    const value = this.tableData.filter(entry => entry.name.includes(category))?.length;
    return value ? value : 0;
  }

  getNumberOfAnnotate() {
    const value = this.layer.children.filter(entry => entry.id().startsWith('annotate'))?.length;
    return value ? value : 0;
  }

  handleScaleSelected(scale: number): void {
    this.updateShapeSize(this.selectedScale, scale);
    this.selectedScale = scale;
    console.log('Selected scale:', this.selectedScale);
    const str = this.imperialScales.find(entry => entry.scale === scale)?.str;
    this.currentScaleStr = str ? str : this.currentScaleStr;

    if (this.aiMeasureClicked) {
      this.aiMeasureClicked = false;
      this.getAiMeasureResult();
    }
  }

  handleWidthSelected(width: number) {
    this.lineWidth = width;
  }

  closeWidthDialog() {
    this.showSetWidthDialog = false;
  }

  updateShapeSize(prevScale: number, currentScale: number): void {
    this.tableData.forEach(entry => {
      let size = entry.sizeNum;
      let unitOfSize = entry.size.split(' ')[1];

      if (unitOfSize === 'ft') {
        size = size * prevScale / currentScale;
      } else if (unitOfSize === 'ft²') {
        size = size * prevScale * prevScale / (currentScale * currentScale);
      } else if (unitOfSize.includes('"')) {
        let curSize = size * prevScale / currentScale;
        entry.sizeNum = currentScale;
        let curFeet = Math.floor(curSize);
        let curInch = Math.round(curSize / 12);
        entry.size = `${curFeet}' ${curInch}"`;
        return;
      }

      entry.sizeNum = size;
      entry.size = `${size.toFixed(2)} ${unitOfSize}`;
    });
  }

  undo(): void {
    const lastOperation = this.operations.undo();
    if (lastOperation) {
      const { action, node, tableDataSnapshot, countTableDataSnapshot } = lastOperation;

      if (action === 'Delete') {
        this.layer.add(node as Konva.Shape);
      } else if (action === 'Create') {
        // this.layer.findOne(`#${node.id()}`)?.destroy();
        const originShape = this.layer.children.find(entry => entry.id() === node.id());
        originShape?.destroy();
        this.tableData = tableDataSnapshot.slice();
        this.countTableData = tableDataSnapshot.slice();
      } else if (action === 'Update') {
        const originShape = this.layer.children.find(entry => entry.id() === node.id());
        originShape?.destroy();
        this.layer.add(node as Konva.Shape);
      }

      // Restore the table data and count table data if they were modified during the operation
      if (tableDataSnapshot) {
        this.tableData = tableDataSnapshot;
        this.updateToolStatus();
      }
      if (countTableDataSnapshot) {
        this.countTableData = countTableDataSnapshot;
      }

      // Ensure the count table data is accurate
      this.countTableData = this.countTableData.filter(entry => entry.count > 0);

      // Redraw the layer and reset the transformer
      this.layer.draw();
      this.transformer.nodes([]); // Reset transformer
    }
  }

  showTooltip(tool: any) {
    console.log('showtooltip');
    this.hoveredTool = tool;
  }

  hideTooltip() {
    this.hoveredTool = null;
  }

  convertToFeetAndInches(value: number) {
    const feet = Math.floor(value);
    const inches = Math.round((value - feet) * 12);
    return `${feet}' ${inches}"`;
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  updateToolStatus(): void {
    const deductTool = this.tools.find(tool => tool.name === 'deduct');
    if (deductTool) {
      const shapes = this.tableData.filter(item => item.name.includes('polygon') || item.name.includes('rectangle'));

      deductTool.disabled = shapes.length === 0;
      if (deductTool.disabled && this.activeTool === 'deduct') {
        this.activeTool = '';
      }
    }
  }

  selectSubTool(subToolName: string): void {
    this.selectedSubTool = subToolName;

    setTimeout(() => {
      this.dropdownOpen = false;
    }, 0);

    const tool = this.tools[this.dropdownIndex];
    tool.default = tool.subtools.findIndex(item => item.name === subToolName)

    this.activeTool = subToolName;

    if (subToolName === 'polyline') {
      this.startPolylineDrawing();
    } else {
      this.endPolylineDrawing(true);
    }

    if (subToolName === 'polygon') {
      this.startPolygonDrawing();
    } else {
      this.endPolygonDrawing(true);
    }

    this.selectedTool = this.tools[this.dropdownIndex].subtools.find(item => item.name === subToolName);
    console.log('Subtool selected:', this.selectedSubTool, this.selectedTool);
  }

  toggleDropdown(index: number): void {
    this.dropdownIndex = index;
    this.dropdownOpen = !this.dropdownOpen;
  }

  startPolylineDrawing(): void {
    if (this.activeTool !== 'polyline') {
      return;
    }
    console.log('startPolylineDrawing', this.color, this.lineWidth);

    let lineWidth = this.lineWidth >= 2 ? this.lineWidth : 2;

    this.isPolylineDrawing = true;
    this.polylinePoints = [];
    this.polyLine = new Konva.Line({
      points: [],
      stroke: this.color,
      strokeWidth: lineWidth,
      lineCap: 'round',
      lineJoin: 'round',
    });
    this.polyLine.on('contextmenu', (event) => {
      this.showCustomContextMenu(event.evt);
    });

    this.polyLine.setAttr('originalStroke', this.color);
    this.polyLine.setAttr('originalStrokeWidth', lineWidth);
    this.layer.add(this.polyLine);

    // Event listener for double click to end the polyline
    console.log('polyline points', this.polylinePoints.length);
    this.stage.on('dblclick', this.closePolyline.bind(this));
  }

  handlePolylineClick(e: Konva.KonvaPointerEvent): void {
    if (this.activeTool !== 'polyline' || !this.isPolylineDrawing) {
      return;
    }

    const pointerPosition = this.layer.getRelativePointerPosition();
    let lastIndex = this.polylinePoints.length;
    if (pointerPosition.x === this.polylinePoints[lastIndex - 2] && pointerPosition.y === this.polylinePoints[lastIndex - 1]) {
      return;
    }

    this.polylinePoints.push(pointerPosition.x, pointerPosition.y);
    console.log('handlePolylineClick pushed', this.polylinePoints, this.polyLine);

    this.polyLine.points(this.polylinePoints);
    this.layer.batchDraw();
  }

  updatePolylineLine(): void {
    if (this.activeTool !== 'polyline' || !this.isPolylineDrawing) return;

    const pointerPosition = this.layer.getRelativePointerPosition();
    const points = [...this.polylinePoints, pointerPosition.x, pointerPosition.y];

    // Calculate the total length of the polyline
    if (this.polylinePoints.length > 1) {
      // const segmentLength = this.calculatePolylineLength(points);
      const polylineLength = this.calculatePolylineLength(points.slice(-4));

      if (!this.feetText) {
        this.feetText = new Konva.Text({
          x: 0,
          y: 0,
          text: '',
          fontSize: 16,
          fontFamily: 'Calibri',
          fill: 'orange',
          listening: false,
        });
        this.layer.add(this.feetText);
      }

      let polyLineLengthFeedAndInch = this.convertToFeetAndInches(polylineLength);
      this.feetText.text(polyLineLengthFeedAndInch);
      // this.feetText.position({ x: pointerPosition.x + 10, y: pointerPosition.y + 10 });

      // Position the text in the middle of the segment
      const middleX = (this.polylinePoints[this.polylinePoints.length - 2] + pointerPosition.x) / 2;
      const middleY = (this.polylinePoints[this.polylinePoints.length - 1] + pointerPosition.y) / 2;
      this.feetText.position({ x: middleX + 10, y: middleY + 10 });

      if (this.polylinePoints.length >= 4) {
        const angle = this.calculateAngle(
          this.polylinePoints.slice(-4, -2),
          this.polylinePoints.slice(-2),
          [pointerPosition.x, pointerPosition.y]
        );

        if (!this.angleText) {
          this.angleText = new Konva.Text({
            x: 0,
            y: 0,
            text: '',
            fontSize: 16,
            fontFamily: 'Calibri',
            fill: 'purple', // Set to purple to match the color in the image
            listening: false, // Ensure it doesn't interfere with other elements
            padding: 5, // Add padding to create a background around the text
            cornerRadius: 5, // Add rounded corners
            backgroundColor: 'rgba(128, 0, 128, 0.2)', // Light purple background
          });
          this.layer.add(this.angleText);
        }

        // Set the position at the intersection point of the two segments
        const beforeX = this.polylinePoints[this.polylinePoints.length - 4];
        const beforeY = this.polylinePoints[this.polylinePoints.length - 3];
        const intersectionX = this.polylinePoints[this.polylinePoints.length - 2];
        const intersectionY = this.polylinePoints[this.polylinePoints.length - 1];
        const afterX = pointerPosition.x;
        const afterY = pointerPosition.y;

        // Calculate position1
        const vec1X = beforeX - intersectionX;
        const vec1Y = beforeY - intersectionY;
        const length1 = Math.sqrt(vec1X * vec1X + vec1Y * vec1Y);
        const normVec1X = vec1X / length1;
        const normVec1Y = vec1Y / length1;
        const position1X = intersectionX + normVec1X * 60;
        const position1Y = intersectionY + normVec1Y * 60;


        // Calculate position2
        const vec2X = afterX - intersectionX;
        const vec2Y = afterY - intersectionY;
        const length2 = Math.sqrt(vec2X * vec2X + vec2Y * vec2Y);
        const normVec2X = vec2X / length2;
        const normVec2Y = vec2Y / length2;
        const position2X = intersectionX + normVec2X * 60;
        const position2Y = intersectionY + normVec2Y * 60;

        // Draw the arc
        let angle1 = Math.atan2(position1Y - intersectionY, position1X - intersectionX);
        let angle2 = Math.atan2(position2Y - intersectionY, position2X - intersectionX);

        // Normalize angles
        if (angle2 < angle1) {
          [angle1, angle2] = [angle2, angle1]; // Swap if angle2 is less than angle1
        }

        let arcAngle = angle2 - angle1;

        // Ensure arcAngle is less than 180 degrees
        if (arcAngle > Math.PI) {
          arcAngle = 2 * Math.PI - arcAngle; // Reverse the arc if the angle is more than 180
          [angle1, angle2] = [angle2, angle1]; // Swap back
        }

        if (this.angleArc) {
          this.angleArc.destroy();
        }

        this.angleArc = new Konva.Arc({
          x: intersectionX,
          y: intersectionY,
          innerRadius: 20,
          outerRadius: 22,
          angle: arcAngle * (180 / Math.PI), // Convert radians to degrees
          rotation: angle1 * (180 / Math.PI), // Convert radians to degrees
          fill: 'transparent',
          stroke: 'purple',
          strokeWidth: 2,
        });

        this.layer.add(this.angleArc);

        this.angleText.text(`${angle.toFixed(1)}°`);
        this.angleText.position({ x: (position1X + position2X) / 2.0 - 20, y: (position1Y + position2Y) / 2.0 - 20 });
      }
    }

    this.polyLine.points(points);
    this.layer.batchDraw();
  }

  calculateAngle(point1: number[], point2: number[], point3: number[]): number {
    const angle1 = Math.atan2(point2[1] - point1[1], point2[0] - point1[0]);
    const angle2 = Math.atan2(point3[1] - point2[1], point3[0] - point2[0]);

    let angle = (angle2 - angle1) * (180 / Math.PI);

    if (angle < 0) {
      angle += 360;
    }
    if (angle > 180) {
      angle = 360 - angle;
    }

    return 180 - angle;
  }


  calculatePolylineLength(points: number[]): number {
    let totalLength = 0;

    for (let i = 0; i < points.length - 2; i += 2) {
      const x1 = points[i];
      const y1 = points[i + 1];
      const x2 = points[i + 2];
      const y2 = points[i + 3];

      const segmentLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      totalLength += segmentLength;
    }

    const lengthInFeet = totalLength / this.selectedScale;
    return lengthInFeet;
  }


  closePolyline(): void {
    if (this.isPolylineDrawing && this.polylinePoints.length > 0) {
      // Close the polygon by connecting the last point to the first
      console.log('closePolyline', this.polylinePoints);

      this.endPolylineDrawing(true);
      this.startPolylineDrawing(); // Restart polygon drawing after finishing one
    }
  }

  endPolylineDrawing(closePolyline: boolean = false): void {
    if (this.activeTool === 'polyline' && this.isPolylineDrawing) {
      if (this.polylinePoints.length <= 2) {
        this.layer.batchDraw();
        return; // A polyline cannot be formed with fewer than 2 points
      }

      console.log('endPolylineDrawing', this.polylinePoints, this.feetText);

      let lineWidth = this.lineWidth >= 2 ? this.lineWidth : 2;

      this.polyLineShape = new Konva.Line({
        points: this.polylinePoints,
        stroke: this.color,
        strokeWidth: lineWidth,
        lineCap: 'round',
        lineJoin: 'round',
        closed: false, // Polyline is open, not closed
        name: 'polyline-shape',
        id: this.currentId,
      });
      this.polyLineShape.on('contextmenu', (event) => {
        this.showCustomContextMenu(event.evt);
      });

      this.polyLineShape.setAttr('originalStroke', this.color);
      this.polyLineShape.setAttr('originalStrokeWidth', lineWidth);

      this.layer.add(this.polyLineShape);
      this.polyLine.destroy(); // Remove the temporary line
      this.layer.batchDraw();

      // Remove the double-click event listener after the polyline is completed
      this.stage.off('dblclick', this.closePolyline);

      console.log('operation pushed - Create');
      this.operations.push('Create', this.polyLineShape, this.tableData.slice(), this.countTableData.slice());

      let polylineLength = this.calculatePolylineLength(this.polylinePoints);
      let feedandInchText = this.convertToFeetAndInches(polylineLength);
      this.createTable('polyline', feedandInchText);

      if (this.feetText) {
        this.feetText.destroy();
        this.feetText = null;
      }

      if (this.angleText) {
        this.angleText.destroy();
        this.angleText = null;
      }

      if (this.angleArc) {
        this.angleArc.destroy();
        this.angleArc = null;
      }
    }

    // Reset polyline drawing state
    this.isPolylineDrawing = false;
    this.polylinePoints = [];
    this.polyLine = null;
  }

  aiMeasure(): void {
    this.showScaleDialog = true;
    this.aiMeasureClicked = true;
  }

  async getAiMeasureResult(): Promise<void> {
    try {
      this.tools[7].isLoading = true;
      document.body.classList.add('loading-cursor');


      const response = await this.uploadImage(this.imageURL);
      console.log('Upload successful:', response);
      this.predictions = response.predictions || [];
      this.drawPredictions();

    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      this.tools[7].isLoading = false;
      document.body.classList.remove('loading-cursor');
    }
  }

  private async uploadImage(imageURL: string, type: string = 'room'): Promise<any> {
    const blob = await this.fetchImage(imageURL);
    const formData = new FormData();
    formData.append('image', blob, 'image.jpg');
    if (type === 'wall') {
      return this.http.post(this.uploadWallURL, formData).toPromise();
    }
    return this.http.post(this.uploadRoomURL, formData).toPromise();
  }

  private fetchImage(url: string): Promise<Blob> {
    return this.http.get(url, { responseType: 'blob' }).toPromise();
  }

  showSlider = false;

  private drawPredictions(): void {
    this.predictions.forEach(pred => {
      const divider = this.orgWidth / 1200;
      const bbox = pred.bbox;
      const minx = bbox[0] / divider + 20, miny = bbox[1] / divider + 20, maxx = bbox[2] / divider + 20, maxy = bbox[3] / divider + 20;
      const label = pred.category;
      const confidence_value = pred.confidence;

      // Check if the confidence meets the current threshold
      if (confidence_value >= this.confidence_threshold) {
        const pred_points = [minx, miny, maxx, miny, maxx, maxy, minx, maxy];
        const entry_id = this.getNumberOfSameCategory(label);
        const shape_id = `${label} ${entry_id}`;

        const predict_color = this.label_info.find(cl => cl.class_name === label)?.color || this.color;

        const pred_polygon = new Konva.Line({
          points: pred_points,
          // stroke: predict_color,
          strokeWidth: this.lineWidth,
          fill: predict_color,
          closed: true,
          lineCap: 'round',
          lineJoin: 'round',
          name: 'polygon-shape',
          id: shape_id
        });
        pred_polygon.on('contextmenu', (event) => {
          this.showCustomContextMenu(event.evt);
        });

        const sizeNum = Math.abs((maxx - minx) * (maxy - miny) / (this.selectedScale * this.selectedScale));

        this.tableData.push({ name: shape_id, displayName: shape_id, size: `${sizeNum.toFixed(2)} ft²`, sizeNum });

        this.layer.add(pred_polygon);
      }
    });
    this.layer.batchDraw();
  }

  // Function to clear existing predictions from the layer
  private clearPredictions(): void {
    this.layer.find('.polygon-shape').forEach((shape) => shape.destroy());
    this.tableData = []; // Clear the table data
    this.layer.batchDraw();
  }

  onConfidenceChange(): void {
    this.clearPredictions(); // Clear existing shapes
    this.drawPredictions(); // Redraw predictions based on updated threshold
  }

  getMatchingEntries(labelClassName: string) {
    if (labelClassName === "Other") {
      return this.tableData.filter(entry =>
        !this.label_info.some(label => entry.displayName.startsWith(label.class_name))
      );
    } else {
      // Return entries that belong to the specific label
      return this.tableData.filter(entry => entry.displayName.startsWith(labelClassName));
    }
  }

  // for context
  showCustomContextMenu(event: MouseEvent) {
    event.preventDefault();
    // Set the position of the context menu to the mouse position
    this.menuPosition = { x: event.clientX, y: event.clientY - 80 };
    const mousePosition = this.stage?.getPointerPosition();

    this.deselectAllShapes();
    this.activeTool = 'select';
    this.stage.container().style.cursor = 'auto';

    const targetShape = this.stage?.getIntersection(mousePosition);
    console.log('targetShape = ', targetShape);

    if (targetShape) {
      this.currentContextShape = targetShape;
      this.transformer.nodes([targetShape]);
      if (!targetShape.getAttr('originalStroke')) {
        targetShape.setAttr('originalStroke', targetShape.stroke());
      }
      if (!targetShape.getAttr('originalStrokeWidth')) {
        targetShape.setAttr('originalStrokeWidth', targetShape.strokeWidth());
      }

      targetShape.stroke('orange');
      targetShape.strokeWidth(targetShape.strokeWidth());

      this.lineStroke = targetShape.strokeWidth();
      console.log('lineStroke', this.lineStroke);

      if (targetShape instanceof Konva.Line) {
        this.createPointCircles(targetShape);
      }
    } else {
      console.log('No shape under the cursor');
    }

    this.showContextMenu = true;

    // Close the context menu when clicking anywhere outside
    window.addEventListener('click', this.closeMenuListener);
  }

  onAction(action: string) {
    console.log(`${action} clicked`);
    const node = this.transformer.nodes()[0];

    switch (action) {
      case 'modify':
        if (this.transformer.nodes().length) {

          if (node instanceof Konva.Rect) {
            const replacedPolygon = new Konva.Line({
              points: [node.attrs.x, node.attrs.y, node.attrs.x + node.attrs.width, node.attrs.y, node.attrs.x + node.attrs.width, node.attrs.y + node.attrs.height, node.attrs.x, node.attrs.y + node.attrs.height],
              stroke: node.attrs.stroke,
              strokeWidth: node.attrs.strokeWidth,
              fill: node.attrs.fill,
              closed: true,
              lineCap: 'round',
              lineJoin: 'round',
              name: node.attrs.name, // deduct polygon
              id: node.attrs.id
            });
            replacedPolygon.on('contextmenu', (event) => {
              this.showCustomContextMenu(event.evt);
            });

            node.remove();
            this.createPointCircles(replacedPolygon);
            this.layer.add(replacedPolygon);
            this.transformer.nodes([replacedPolygon]);
          }

          this.layer.draw();

          // const mousePosition = this.stage?.getPointerPosition();
          // console.log('mousePosition', mousePosition);
          this.modifyMenuPosition = {
            x: this.currentMousePosition.x,
            y: this.currentMousePosition.y - 100,
          };

          console.log(this.transformer.nodes()[0]);
          this.transformer.nodes()[0].on('click', (event) => {
            const pos = event.target.getStage().getPointerPosition();
            const clickX = pos.x;
            const clickY = pos.y;

            this.addPointNearEdge(clickX, clickY);
          });

          this.showModifyMenu = true;

          setTimeout(() => {
            window.addEventListener('click', this.closeModifyMenuListener);
          }, 0.1);
        }
        break;

      case 'color':
        this.showColorPicker = true;
        this.contextColorDialog = true;
        break;
      case 'delete':
        const node_id = node.id();
        this.tableData = this.tableData.filter(entry => entry.name !== node_id);
        node.remove();
        this.deselectAllShapes();
        this.transformer.nodes([]);
        this.layer.draw();
        break;
      case 'lock':
        node.setAttr('locked', !node.attrs.locked);
        break;
    }
  }

  setLineColor() {
    this.showColorPicker = true;
    this.lineColorDialog = true;
  }

  closeMenuListener = () => {
    console.log('closeMenuListener');
    this.showContextMenu = false;

    window.removeEventListener('click', this.closeMenuListener);
  }

  closeModifyMenuListener = () => {
    console.log('closeModifyMenuListener');
    this.showModifyMenu = false;
    window.removeEventListener('click', this.closeModifyMenuListener);
  }

  // for line editing
  onLineStrokeChanged(): void {
    this.currentContextShape.strokeWidth(this.lineStroke);
    if (!this.currentContextShape.getAttr('originalStroke')) {
      this.currentContextShape.setAttr('originalStroke', this.currentContextShape.stroke());
    }
    this.currentContextShape.setAttr('originalStrokeWidth', this.lineStroke);
  }

  toggleVisibleShape(id: string) {
    this.layer.find('.point_circle').forEach(circle => circle.visible(!circle.visible()));
    const tableShapes = this.layer.find<Konva.Shape>('.outer-rect, .polygon-shape, .polyline-shape, .line-length, .deductible-image');
    const shape = tableShapes.find(shape => shape.id() === id);
    if (shape) {
      shape.visible(!shape.visible());
    }
    // this.layer.draw();
  }

  isShapeVisible(id: string) {
    const tableShapes = this.layer.find<Konva.Shape>('.outer-rect, .polygon-shape, .polyline-shape, .line-length, .deductible-image');
    const shape = tableShapes.find(shape => shape.id() === id);
    if (shape) {
      return shape.visible();
    }
    return true;
  }

  toggleVisibleLabel(label_name: string): void {
    this.layer.find('.point_circle').forEach(circle => circle.visible(!circle.visible()));
    const tableShapes = this.layer.find<Konva.Shape>('.outer-rect, .polygon-shape, .polyline-shape, .line-length, .deductible-image');
    const visibility = this.isLabelVisible(label_name);
    tableShapes.forEach(shape => {
      if (shape.id().includes(label_name)) {
        shape.visible(!visibility);
      }
    });
  }

  isLabelVisible(label_name: string): boolean {
    const tableShapes = this.layer.find<Konva.Shape>('.outer-rect, .polygon-shape, .polyline-shape, .line-length, .deductible-image');
    for (const shape of tableShapes) {
      if (shape.id().includes(label_name) && shape.visible()) return true;
    }
    return false;
  }

  addNewPoint() {
    // this.isAddingPoint = true;
    // const node = this.transformer.nodes()[0];
    // node.on('click', (event) => {
    //   if (this.isAddingPoint) {
    //     this.isAddingPoint = false;
    //     const pos = event.target.getStage().getPointerPosition();
    //     if (node instanceof Konva.Line) {
    //       const points = node.points();
    //       points.push(pos.x, pos.y);
    //       node.points(points);
    //       this.layer.batchDraw();
    //     }
    //   }
    // });
  }

  pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) {
      param = dot / len_sq;
    }

    let xx: number, yy: number;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  addPointNearEdge(clickX: number, clickY: number) {
    const polygon = this.transformer.nodes()[0];
    if (polygon && polygon instanceof Konva.Line) {
      const points = polygon.points();
      const threshold = 10; // Threshold distance to consider the click "near" an edge
      let closestDistance = Infinity;
      let closestSegmentIndex = -1;

      // Iterate over each edge (line segment) of the polygon
      for (let i = 0; i < points.length; i += 2) {
        const x1 = points[i];
        const y1 = points[i + 1];
        const x2 = points[(i + 2) % points.length];  // Wrap around to the first point
        const y2 = points[(i + 3) % points.length];

        const dist = this.pointToLineDistance(clickX, clickY, x1, y1, x2, y2);
        if (dist < closestDistance && dist <= threshold) {
          closestDistance = dist;
          closestSegmentIndex = i;
        }
      }

      // If we found a close segment, insert a new point along the segment
      if (closestSegmentIndex >= 0) {
        const x1 = points[closestSegmentIndex];
        const y1 = points[closestSegmentIndex + 1];
        const x2 = points[(closestSegmentIndex + 2) % points.length];
        const y2 = points[(closestSegmentIndex + 3) % points.length];

        // Calculate the new point position along the segment (close to the mouse click position)
        const t = this.calculateInsertionPosition(x1, y1, x2, y2, clickX, clickY);
        const newPoint = this.getPointAlongSegment(x1, y1, x2, y2, t);

        // Insert the new point at the right position
        points.splice(closestSegmentIndex + 2, 0, newPoint.x, newPoint.y);

        // Update the polygon with the new points
        polygon.points(points);
        this.layer.batchDraw(); // Redraw the layer
      }
    }
  }

  calculateInsertionPosition(x1: number, y1: number, x2: number, y2: number, clickX: number, clickY: number): number {
    const segmentLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const projection = ((clickX - x1) * (x2 - x1) + (clickY - y1) * (y2 - y1)) / segmentLength;
    return Math.min(Math.max(projection / segmentLength, 0), 1); // Clamp t between 0 and 1
  }

  getPointAlongSegment(x1: number, y1: number, x2: number, y2: number, t: number) {
    const newX = x1 + t * (x2 - x1);
    const newY = y1 + t * (y2 - y1);
    return { x: newX, y: newY };
  }

  changeStrokeType(type: any) {
    switch (type) {
      case 'dash':
        this.currentContextShape.setAttr('dash', [10, 5]);
        break;
      case 'dotted':
        this.currentContextShape.setAttr('dash', [2, 10]);
        break;
      case 'line':
        this.currentContextShape.setAttr('dash', null);
        break;
    }
  }

  async wallMeasure() {
    try {
      this.tools[6].isLoading = true;
      document.body.classList.add('loading-cursor');

      const response = await this.uploadImage(this.imageURL, 'wall');
      console.log('Upload successful:', response);
      this.predictions = response.predictions || [];
      this.drawPredictions();

    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      this.tools[6].isLoading = false;
      document.body.classList.remove('loading-cursor');
    }
  }

  deletePoint() {
    this.isPointDelete = true;
  }

  alignPoints(type: string) {
    this.selectTool('pointalign');
    this.alignType = type;
  }

  alignSelectedPoints(rectArea: Konva.Rect): void {
    const currentShape = this.transformer.nodes()[0];
    const scale = this.stage.scaleX();
    if (currentShape instanceof Konva.Line) {
      const rectAreaBound = rectArea.getClientRect();
      const selectedAreaBound = {
        x: rectAreaBound.x / scale,
        y: rectAreaBound.y / scale,
        width: rectAreaBound.width / scale,
        height: rectAreaBound.height / scale,
      };

      const shapePoints = currentShape.points();
      const selectedPoints = [];
      for (let i = 0; i < shapePoints.length; i += 2) {
        if (this.isPointinArea({ x: shapePoints[i], y: shapePoints[i + 1] }, selectedAreaBound)) {
          selectedPoints.push(shapePoints[i], shapePoints[i + 1]);
        }
      }

      const widthRange = this.getMinMaxByIndex(selectedPoints, false);
      const heightRange = this.getMinMaxByIndex(selectedPoints, true);

      console.log('alignSelectedPoints', shapePoints, selectedPoints, widthRange, heightRange);

      switch (this.alignType) {
        case 'top':
          currentShape.points(
            this.modifyPointsAlignment(
              shapePoints, 
              selectedAreaBound, 
              {x: widthRange.min, y: heightRange.min},
              {x: widthRange.max, y: heightRange.min}
            )
          );
          this.layer.batchDraw();
          break;
        case 'bottom':
          currentShape.points(
            this.modifyPointsAlignment(
              shapePoints, 
              selectedAreaBound, 
              {x: widthRange.max, y: heightRange.max},
              {x: widthRange.min, y: heightRange.max}
            )
          );
          this.layer.batchDraw();
          break;
        case 'left':
          const updatedPoints = this.modifyPointsAlignment(
            shapePoints, 
            selectedAreaBound, 
            {x: widthRange.min, y: heightRange.min},
            {x: widthRange.min, y: heightRange.max}
          );
          currentShape.points(updatedPoints);
          this.layer.batchDraw();
          break;
        case 'right':
          currentShape.points(
            this.modifyPointsAlignment(
              shapePoints, 
              selectedAreaBound, 
              {x: widthRange.max, y: heightRange.min},
              {x: widthRange.max, y: heightRange.max}
            )
          );
          this.layer.batchDraw();
          break;
      }

      this.selectTool('select');
    }
  }

  getMinMaxByIndex(arr: number[], isOdd: boolean) {
    const result = arr.reduce((acc: { min: number; max: number; }, val: number, index: number) => {
      if ((index % 2 === 1) === isOdd) {
        acc.min = Math.min(acc.min, val);
        acc.max = Math.max(acc.max, val);
      }
      return acc;
    }, { min: Infinity, max: -Infinity });

    return result;
  }

  isPointinArea(point: { x: number, y: number }, area: { x: number, y: number, width: number, height: number }) {
    return (point.x >= area.x && point.x < area.x + area.width) &&
      (point.y >= area.y && point.y < area.y + area.height);
  }

  modifyPointsAlignment(shapePoints: number[], selectedAreaBound: { x: number, y: number, width: number, height: number }, position1: { x: number, y: number }, position2: { x: number, y: number }) {
    let selectIndex = 0;
    const updatedPoints = [];
    for (let i = 0; i < shapePoints.length; i += 2) {
      if (this.isPointinArea({ x: shapePoints[i], y: shapePoints[i + 1] }, selectedAreaBound)) {
        selectIndex++;
        if (selectIndex === 1) {
          updatedPoints.push(position1.x);
          updatedPoints.push(position1.y);
        }
        if (selectIndex === 2) {
          updatedPoints.push(position2.x);
          updatedPoints.push(position2.y);
        }
      } else {
        updatedPoints.push(shapePoints[i]);
        updatedPoints.push(shapePoints[i + 1]);
      }
    }
    console.log('modifyPointsAlignment', updatedPoints);
    return updatedPoints;
  }

  trackMousePosition(event: any) {
    this.currentMousePosition.x = event.evt.clientX;
    this.currentMousePosition.y = event.evt.clientY;
  }
}

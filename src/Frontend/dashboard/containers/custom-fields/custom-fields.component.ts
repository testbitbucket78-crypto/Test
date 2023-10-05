import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'sb-custom-fields',
  templateUrl: './custom-fields.component.html',
  styleUrls: ['./custom-fields.component.scss']
})



export class CustomFieldsComponent {


  onDrop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      // Item was dropped within the same list
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } 
  }

}

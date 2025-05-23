import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'interactive-button',
  templateUrl: './interactive-button.component.html',
  styleUrls: ['./interactive-button.component.scss']
})
export class InteractiveButtonComponent implements OnChanges {
  @Input() interactiveButtons: any;
  @Input() width: any = '70%'
  buttons: any;

  ngOnChanges(changes: SimpleChanges): void {
    if(typeof this.interactiveButtons == 'string'){
      this.interactiveButtons = JSON.parse(this.interactiveButtons);
    }
    if (!this.interactiveButtons?.action) {
      throw new Error("Please Enter A Valid Interactive Buttons Payload")
    }
    console.log(this.interactiveButtons.action)
    this.buttons = this.interactiveButtons.action.buttons
  }
}

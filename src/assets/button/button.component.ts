import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sb-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() label: string = '';
  @Input() isActive: boolean = false;
  @Input() type: 'primary' | 'secondary' = 'primary';
  @Input() customWidth: string = 'auto';
  @Input() disabled: boolean = false;
  @Output() onClick = new EventEmitter<void>();

  handleClick() {
    this.onClick.emit(); 
  }
}
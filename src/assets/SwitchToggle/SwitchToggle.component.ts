import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sb-SwitchToggle',
  templateUrl: './SwitchToggle.component.html',
  styleUrls: ['./SwitchToggle.component.scss']
})
export class SwitchToggleComponent {
  @Input() label: string = 'Enable';

  @Input() isEnabled: boolean = false;

  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  @Output() toggleChange = new EventEmitter<boolean>();
  

  onToggle(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.isEnabled = input.checked;
    this.toggleChange.emit(this.isEnabled);
  }

  get sizeClass(): string {
    return `toggle-${this.size}`;
  }
}
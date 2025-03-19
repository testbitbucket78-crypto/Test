import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sb-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent {
  @Input() tooltipText: string = 'Tooltip information';
  @Input() isVisible: boolean = false;
  @Output() visibilityChange = new EventEmitter<boolean>();

  toggleTooltip() {
    this.isVisible = !this.isVisible;
    this.visibilityChange.emit(this.isVisible);
  }

  closeTooltip() {
    this.isVisible = false;
    this.visibilityChange.emit(this.isVisible);
  }
}
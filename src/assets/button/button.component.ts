import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'sb-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnChanges {
  @Input() label: string = '';
  @Input() isActive: boolean = false;
  @Input() type: 'primary' | 'secondary' = 'primary';
  @Input() customWidth: string = 'auto';
  @Input() disabled: boolean = false;
  @Input() leftIcon: any;
  @Input() rightIcon: any;
  @Output() onClick = new EventEmitter<void>();
  @Input() labelColor: 'default' | 'accent' | 'muted' = 'default';

  safeLeftIcon: SafeHtml | string = '';
  safeRightIcon: SafeHtml | string = '';
  isLeftIconHtml = false;
  isRightIconHtml = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.isLeftIconHtml = this.isHtml(this.leftIcon);
    this.isRightIconHtml = this.isHtml(this.rightIcon);

    this.safeLeftIcon = this.isLeftIconHtml
      ? this.sanitizer.bypassSecurityTrustHtml(this.leftIcon)
      : this.leftIcon;

    this.safeRightIcon = this.isRightIconHtml
      ? this.sanitizer.bypassSecurityTrustHtml(this.rightIcon)
      : this.rightIcon;
  }

  isHtml(value: any): boolean {
    return typeof value === 'string' && value.trim().startsWith('<');
  }

  handleClick() {
    this.onClick.emit();
  }
}

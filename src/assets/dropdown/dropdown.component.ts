import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sb-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent {
  @Input() channelOption: any[] = [];
  @Input() channelSelected: string = '';
  @Input() channelPhoneNumber: string = '';
  @Input() ShowAssignOption: boolean = false;
  @Input() type: 'primary' | 'secondary' = 'primary';
  @Input() isOpen: boolean = false;
  @Input() customWidth: string = '200px';
  @Output() selectionChange = new EventEmitter<string>();

  toggleAssignOption() {
    this.ShowAssignOption = !this.ShowAssignOption;
  }

  updateDropdown(id: string) {
    this.selectionChange.emit(id);
    this.ShowAssignOption = false;
  }
}
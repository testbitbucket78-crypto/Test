import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'sb-manage-storage',
  templateUrl: './manage-storage.component.html',
  styleUrls: ['./manage-storage.component.scss']
})
export class ManageStorageComponent implements OnInit {

  percentage = 73;
  constructor() { }

  ngOnInit(): void {
  }

  get formattedDashArray() {
    return this.percentage + ', 100';
  }

}

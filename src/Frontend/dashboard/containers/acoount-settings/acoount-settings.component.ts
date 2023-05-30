import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'sb-acoount-settings',
  templateUrl: './acoount-settings.component.html',
  styleUrls: ['./acoount-settings.component.scss']
})
export class AcoountSettingsComponent implements OnInit {

  connection: number[] = [1, 3, 2, 4];
  selectedTab: number = 1;

  constructor() { }

  ngOnInit(): void {
  }

}
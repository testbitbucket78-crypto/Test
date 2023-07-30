import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'sb-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit {
  selectedTab:number = 4;

  constructor() { }

  ngOnInit(): void {
  }

}

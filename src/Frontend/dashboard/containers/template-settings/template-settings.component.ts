import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'sb-template-settings',
  templateUrl: './template-settings.component.html',
  styleUrls: ['./template-settings.component.scss']
})
export class TemplateSettingsComponent implements OnInit {

  selectedTab:number = 1;
  
  constructor() { }

  ngOnInit(): void {
  }

}

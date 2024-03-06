import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';

@Component({
  selector: 'sb-template-settings',
  templateUrl: './template-settings.component.html',
  styleUrls: ['./template-settings.component.scss']
})
export class TemplateSettingsComponent implements OnInit {

  selectedTab:number = 1;
  
  constructor(public settingsService:SettingsService,) { }

  ngOnInit(): void {
  }

}

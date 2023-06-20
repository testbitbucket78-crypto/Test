import { Component, OnInit } from '@angular/core';
declare var $:any;

@Component({
  selector: 'sb-acoount-settings',
  templateUrl: './acoount-settings.component.html',
  styleUrls: ['./acoount-settings.component.scss']
})
export class AcoountSettingsComponent implements OnInit {

  connection:number[] =[1,3,2,4];
  selectedTab:number = 1;
  public ipAddress:string[] = [''];

  constructor() { }

  ngOnInit(): void {
  }

  generateQR(){
    $("#connectWhatsappModal").modal('hide');
    $("#qrWhatsappModal").modal('show');
  }

  removeIP(index:number){
    this.ipAddress.splice(index,1);
    
  }

  addIP(){
    this.ipAddress.push('');
  }

}

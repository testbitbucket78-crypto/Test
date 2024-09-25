import { Component, OnInit } from '@angular/core';
import { ProfileService } from 'Frontend/dashboard/services/profile.service';


@Component({
  selector: 'sb-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  spId!:number;
  pageSize:number = 10;
  currentPage:number = 1;
  paging: number [] = [];
  searchText = '';
  notificationData = [];
  uid!:number;
  constructor(private apiservice:ProfileService) { }

  ngOnInit(): void {
    this.spId = Number(sessionStorage.getItem('SP_ID'));
    this.uid = (JSON.parse(sessionStorage.getItem('loginDetails')!)).uid;
    this.getNotificationData();
    this.getPaging();
   
  }

  getNotificationData() {
    this.apiservice.getNotifications(this.spId,this.uid).subscribe((response=> {
      this.notificationData = response.notifications;
      this.notificationData.reverse();
      this.getPaging(); 
    }));
  }

  getPaging() {
    this.paging = [];
    //this.currentPage = 1;
    let pagingStart = this.currentPage >3 ? this.currentPage - 2 : 1;
    let totalPages = Math.ceil( this.notificationData.length/this.pageSize) > this.currentPage+2 ? this.currentPage+2 :  Math.ceil( this.notificationData.length/this.pageSize);
    for (let i = pagingStart; i <= totalPages; i++) {
       this.paging.push(i);
  }
 

  }
}

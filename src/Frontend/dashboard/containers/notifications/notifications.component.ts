import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'sb-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  pageSize:number = 10;
  currentPage:number = 1;
  paging: number [] = [];
  searchText = '';

  notificationData = [
    { title: '1Assigned a conversation', content: 'Assigned a conversation with Fintch Hood', date: 'Today, 2:48 Pm' },
    { title: '2Mentioned You', content: 'Assigned a conversation with Fintch Hood', date: 'Today, 11:15 Am' },
    { title: '3Update!', content: 'Dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua', date: 'Yesterday, 1:49 Pm' },
    { title: '4Mentioned You', content: 'Mentioned you in a Comment', date: 'Yesterday, 3:55 Pm' },
    { title: '5Edited Flow Builder MBG Products', content: 'Assigned a conversation with Fintch Hood', date: 'Yesterday, 3:55 Pm' },
    { title: '6Edited Flow Builder MBG Products', content: 'Assigned a conversation with Fintch Hood', date: 'Yesterday, 3:55 Pm' },
    { title: '7Edited Flow Builder MBG Products', content: 'Assigned a conversation with Fintch Hood', date: 'Yesterday, 3:55 Pm' },
    { title: '8Payment Deducted', content: '$20 Deducted from your account towards Subscription', date: '5 Apr 2023, 7:35 Pm' },
    { title: '9Contacts imported successfully', content: '1560 New Contacts imported Successfully', date: '3 Apr 2023, 6:55 Pm' },
    { title: '10Payment Deducted', content: '$20 Deducted from your account towards Subscription', date: '2 Apr 2023, 7:35 Pm' },

    { title: '11Assigned a conversation', content: 'Assigned a conversation with Fintch Hood', date: 'Today, 2:48 Pm' },
    { title: '12Mentioned You', content: 'Assigned a conversation with Fintch Hood', date: 'Today, 11:15 Am' },
    { title: '13Update!', content: 'Dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua', date: 'Yesterday, 1:49 Pm' },
    { title: '14Mentioned You', content: 'Mentioned you in a Comment', date: 'Yesterday, 3:55 Pm' },
    { title: '15Edited Flow Builder MBG Products', content: 'Assigned a conversation with Fintch Hood', date: 'Yesterday, 3:55 Pm' },
    { title: '16Edited Flow Builder MBG Products', content: 'Assigned a conversation with Fintch Hood', date: 'Yesterday, 3:55 Pm' },
    { title: '17Edited Flow Builder MBG Products', content: 'Assigned a conversation with Fintch Hood', date: 'Yesterday, 3:55 Pm' },
    { title: '18Payment Deducted', content: '$20 Deducted from your account towards Subscription', date: '5 Apr 2023, 7:35 Pm' },
    { title: '19Contacts imported successfully', content: '1560 New Contacts imported Successfully', date: '3 Apr 2023, 6:55 Pm' },
    { title: '20Payment Deducted', content: '$20 Deducted from your account towards Subscription', date: '2 Apr 2023, 7:35 Pm' },


    { title: '21Payment Deducted', content: '$20 Deducted from your account towards Subscription', date: '2 Apr 2023, 7:35 Pm' },
    { title: '22Assigned a conversation', content: 'Assigned a conversation with Fintch Hood', date: 'Today, 2:48 Pm' },
    { title: '23Mentioned You', content: 'Assigned a conversation with Fintch Hood', date: 'Today, 11:15 Am' },
    { title: '24Update!', content: 'Dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua', date: 'Yesterday, 1:49 Pm' },
    { title: '25Mentioned You', content: 'Mentioned you in a Comment', date: 'Yesterday, 3:55 Pm' },
    { title: '26Edited Flow Builder MBG Products', content: 'Assigned a conversation with Fintch Hood', date: 'Yesterday, 3:55 Pm' },
    { title: '27Edited Flow Builder MBG Products', content: 'Assigned a conversation with Fintch Hood', date: 'Yesterday, 3:55 Pm' },
    { title: '28Edited Flow Builder MBG Products', content: 'Assigned a conversation with Fintch Hood', date: 'Yesterday, 3:55 Pm' },
    { title: '29Payment Deducted', content: '$20 Deducted from your account towards Subscription', date: '5 Apr 2023, 7:35 Pm' },
    { title: '30Contacts imported successfully', content: '1560 New Contacts imported Successfully', date: '3 Apr 2023, 6:55 Pm' },
    { title: '31Payment Deducted', content: '$20 Deducted from your account towards Subscription', date: '2 Apr 2023, 7:35 Pm' },

     ]
  constructor() { }

  ngOnInit(): void {
    this.getPaging();
   
  }

  getPaging() {
    this.paging = [];
    this.currentPage = 1;
    let totalPages = Math.ceil( this.notificationData.length/this.pageSize);
    for (let i = 1; i <= totalPages; i++) {
       this.paging.push(i);
  }
 

  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

  requestPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        console.log(`Notification permission: ${permission}`);
      });
    } else {
      console.error('Browser does not support notifications.');
    }
  }

  showNotification(title: string, options?: NotificationOptions) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, options);
      
      notification.onclick = () => {
        console.log('Notification clicked');
      };
    } else {
      console.error('Notifications are not enabled or permission not granted.');
    }
  }
  
}
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

requestPermission(): Promise<NotificationPermission> {
  return Notification.requestPermission();
}

showNotification(title: string, options?: NotificationOptions): void {
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
}
}
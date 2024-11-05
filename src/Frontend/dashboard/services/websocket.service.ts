import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket$: WebSocketSubject<any> = new WebSocketSubject('wss://notify.stacknize.com/');
  private isReconnecting: boolean = false;

  constructor() { }

  connect(spn: any): void {
    if (this.isReconnecting) return;
      this.isReconnecting = true; 
    this.socket$ = webSocket('wss://notify.stacknize.com/'); // Replace with your server's URL
    this.socket$.next(JSON.stringify(spn));
    // Handle incoming messages
    let i =0
    const intervalId = setInterval(() => {      
      this.socket$.next("ping alive switch");
 }, 30000);
 
    this.socket$.subscribe(
      (message) => {
        console.log('Received message:', message);
        this.isReconnecting = false;
      },
      (error) => {
        console.error('WebSocket error:', error);
        clearInterval(intervalId);
        this.isReconnecting = false;
        this.connect(spn);
      },
      () => {
        console.log('WebSocket connection closed');
        clearInterval(intervalId);
        this.isReconnecting = false;
        this.connect(spn); 
      }
    );
    
  }

  // send(message: any): void {
  //   if (this.socket$ && this.socket$.readyState === WebSocket.OPEN) {
  //     this.socket$.next(message);
  //   }
  // }
  getMessage(): Observable<any> {
    return this.socket$.asObservable();
  }
  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.isReconnecting = false;
      //connect();
      //this.socket$ = null;
    }
  }
}

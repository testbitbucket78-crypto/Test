import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket$: WebSocketSubject<any> = new WebSocketSubject('wss://notify.stacknize.com/');

  constructor() { }

  connect(spn: any): void {
    this.socket$ = webSocket('wss://notify.stacknize.com/'); // Replace with your server's URL
    this.socket$.next(JSON.stringify(spn));
    // Handle incoming messages
    let i =0
    this.socket$.subscribe(
      (message) => {
        console.log('Received message:', message);
        // Process the received data here
      },
      (error) => {
        console.error('WebSocket error:', error);
      }
    );
    setInterval(() => {      
             this.socket$.next("ping alive switch");
        }, 30000);
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
      //connect();
      //this.socket$ = null;
    }
  }
}

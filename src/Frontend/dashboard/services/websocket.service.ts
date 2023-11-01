import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket$: WebSocketSubject<any> = new WebSocketSubject('ws://localhost:3010/');

  constructor() { }

  connect(spn: any): void {
    this.socket$ = webSocket('ws://localhost:3010/'); // Replace with your server's URL
    this.socket$.next(JSON.stringify(spn));
    // Handle incoming messages
    this.socket$.subscribe(
      (message) => {
        console.log('Received message:');
        console.log(message);
        // Process the received data here
      },
      (error) => {
        console.log('WebSocket error:');
        console.log(error);
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
      //this.socket$ = null;
    }
  }
}

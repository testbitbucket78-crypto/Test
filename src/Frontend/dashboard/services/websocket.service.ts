import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket$: WebSocketSubject<any> | null = null;
  private isReconnecting: boolean = false;

  private socketInstance: WebSocket | null = null;

  constructor() { }

  connect(spn: any): void {
    console.log(this.socketInstance);
    console.log(this.socketInstance?.readyState);
    if (this.socketInstance && (this.socketInstance?.readyState === WebSocket.OPEN || this.socketInstance?.readyState === WebSocket.CONNECTING)) {
      console.log("WebSocket is already connected or connection is pending.");
      return;
    }

      this.isReconnecting = true; 
    this.socket$ = webSocket('wss://notify.stacknize.com/'); // Replace with your server's URL
    this.socketInstance = new WebSocket('wss://notify.stacknize.com/');
    this.socket$.next(JSON.stringify(spn));
    let i =0
    const intervalId = setInterval(() => {      
      if (this.socketInstance?.readyState === WebSocket.OPEN) {
        this.socket$?.next("ping alive switch");
      }
 }, 30000);
 
    this.socket$.subscribe(
      (message) => {
        console.log('Received message:', message);
        console.log(this.socket$);
      },
      (error) => {
        console.error('WebSocket error:', error);
        clearInterval(intervalId);
        console.log(this.socket$);
        this.cleanupConnection();
        this.connect(spn);
      },
      () => {
        console.log('WebSocket connection closed');
        clearInterval(intervalId);
        console.log(this.socket$);
        this.cleanupConnection();
        this.connect(spn); 
      }
    );
    
  }

  private cleanupConnection(): void {
    if (this.socketInstance) {
      this.socketInstance.close();
      this.socketInstance = null;
    }
    this.socket$ = null;
  }

  // send(message: any): void {
  //   if (this.socket$ && this.socket$.readyState === WebSocket.OPEN) {
  //     this.socket$.next(message);
  //   }
  // }
  getMessage(): (Observable<any> | null) {
    return this.socket$ ? this.socket$?.asObservable() :null;
  }
  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}

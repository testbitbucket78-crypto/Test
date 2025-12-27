import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket | null = null;
  private readonly url = environment.notify; 

  constructor() {}

  connect(spn: any): void {
    if (this.socket && (this.socket.connected || this.socket.active)) {
      console.log("Socket.io is already connected or connection is pending.");
      return;
    }

    // Initialize the socket connection
    this.socket = io(this.url, {
      transports: ['websocket'],
      reconnectionAttempts: 5, 
      reconnectionDelay: 1000, 
    });

    this.socket.on('connect', () => {
      console.log('Socket.io connected');
      this.socket?.emit('message', spn); 
      this.startPing();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.io disconnected:', reason);
      this.cleanupConnection();
    });

    this.socket.on('message', (message) => {
      console.log('Received message:', message);
    });
  }

  private startPing(): void {
    if (this.socket) {
      setInterval(() => {
        if (this.socket?.connected) {
          this.socket.emit('ping', 'ping alive switch');
        }
      }, 30000);
    }
  }

  private cleanupConnection(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  send(message: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('message', message);
    }
  }

  getMessage(): Observable<any> {
    return new Observable((observer) => {
      if (!this.socket) {
        observer.error('Socket is not connected');
        return;
      }

      this.socket.on('message', (data) => observer.next(data));

      return () => {
        this.socket?.off('message');
      };
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
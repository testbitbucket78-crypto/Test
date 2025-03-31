import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<ToastConfig | null>(null);
  toast$ = this.toastSubject.asObservable();

  show(config: ToastConfig) {
    this.toastSubject.next(config);
  }

  success(message: string, duration: number = 5000) {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration: number = 5000) {
    this.show({ message, type: 'error', duration });
  }

  warning(message: string, duration: number = 5000) {
    this.show({ message, type: 'warning', duration });
  }

  hide() {
    this.toastSubject.next(null);
  }
} 
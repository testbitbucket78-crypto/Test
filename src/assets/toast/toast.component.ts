import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ToastService, ToastConfig } from './toast.service';

@Component({
  selector: 'sb-toast',
  template: `
    <div class="toast" *ngIf="config" [class]="config.type" [@slideInOut]="isVisible ? 'in' : 'out'">
      <p>{{ config.message }}</p>
    </div>
  `,
  styles: [`
    .toast {
      position: fixed;
      right: 20px;
      top: 50px;
      z-index: 999999;
      padding: 10px 24px;
      border-radius: 50px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 500px !important;
      width: max-content;
      text-align: center;
    }
    .toast p {
      margin: 0;
      color: #ffffff;
      font-size: 14px;
      font-weight: 500;
    }
    .success {
      background-color: #2ABA7D;
    }
    .error {
      background-color: #E02020;
    }
    .warning {
      background-color: #F9B035;
    }
  `],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      state('out', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      transition('in => out', [
        animate('0.3s ease-out')
      ]),
      transition('void => in', [
        animate('0.3s ease-out')
      ])
    ])
  ]
})
export class ToastComponent implements OnInit, OnDestroy {
  config: ToastConfig | null = null;
  isVisible: boolean = false;
  private timeoutId: any;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toast$.subscribe(config => {
      if (config) {
        this.config = config;
        this.isVisible = true;
        this.startTimer(config.duration || 10000);
      } else {
        this.isVisible = false;
        this.clearTimer();
      }
    });
  }

  private startTimer(duration: number) {
    this.clearTimer();
    this.timeoutId = setTimeout(() => {
      this.toastService.hide();
    }, duration);
  }

  private clearTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  ngOnDestroy() {
    this.clearTimer();
  }
} 
import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';

@Component({
  selector: 'sb-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit, OnChanges {
  @Input() isLoading: boolean = false;
  @Input() message: string = 'Loading... Please wait...';
  //@Input() loaderType: string = 'standard'; 
  @Input() loaderType: 'standard' | 'small' | 'mini' = 'standard'; 
  @Input() customStyles: { [key: string]: string } = {};
  @Input() maxDuration: number = 15000; // default to 15 seconds

  private timeout10Sec: any;
  private timeout14Sec: any;

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isLoading && changes.isLoading.currentValue) {
      this.startTimers();
    } else if (changes.isLoading && !changes.isLoading.currentValue) {
      this.clearTimers();
    }
  }

  private startTimers(): void {
    this.clearTimers(); 
    const messageDelay = Math.max(this.maxDuration - 5000, 0);
    this.timeout10Sec = setTimeout(() => {
      this.message = 'Oops! We are facing some problem. Please try after some time.';
    }, messageDelay); 
    this.timeout14Sec = setTimeout(() => {
      this.isLoading = false;
      this.clearTimers();
    }, this.maxDuration); 
  }

  private clearTimers(): void {
    if (this.timeout10Sec) {
      clearTimeout(this.timeout10Sec);
      this.timeout10Sec = null;
    }
    if (this.timeout14Sec) {
      clearTimeout(this.timeout14Sec);
      this.timeout14Sec = null;
    }
  }
}
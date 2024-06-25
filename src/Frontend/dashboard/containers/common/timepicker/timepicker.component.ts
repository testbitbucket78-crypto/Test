import { Component, OnInit, HostListener, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'sb-timepicker',
    templateUrl: './timepicker.component.html',
    styleUrls: ['./timepicker.component.scss']
})
export class TimepickerComponent implements OnInit {
    @Input() timebind: string = '';
    @Output() timebindChange: EventEmitter<string> = new EventEmitter<string>();
    @Output() timeChanged: EventEmitter<string> = new EventEmitter<string>();
    @Input() step: number = 5;
    timeOptions: string[] = [];
    dropdownVisible: boolean = false;


    ngOnInit() {
        this.generateTimeOptions();
    }

    generateTimeOptions() {
        this.timeOptions = [];
        for (let i = 0; i < 24 * 60; i += this.step) {
            const hours = String(Math.floor(i / 60)).padStart(2, '0');
            const minutes = String(i % 60).padStart(2, '0');
            this.timeOptions.push(`${hours}:${minutes}`);
        }
    }

    toggleDropdown() {
        this.dropdownVisible = !this.dropdownVisible;
    }

    selectTime(time: string) {
        this.timebind = time;
        this.timebindChange.emit(time);
        this.timeChanged.emit(time);
        this.dropdownVisible = false;
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.input-container')) {
            this.dropdownVisible = false;
        }
    }
}

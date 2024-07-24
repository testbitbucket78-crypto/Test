import { Component, OnInit, HostListener, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'sb-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {
    @Input() isLoading: boolean = false;
    @Input() message: string = 'Loading... Please wait...';
    @Input() loaderType: string = 'standard'; 
    @Input() customStyles: { [key: string]: string } = {};
   ngOnInit(): void {
       
   }

}

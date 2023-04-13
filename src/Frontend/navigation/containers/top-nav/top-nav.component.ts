import { ChangeDetectionStrategy, Input, Component, OnInit,HostListener } from '@angular/core';
import { NavigationService } from 'Frontend/navigation/services';



@HostListener('window:scroll', ['$event'])


@Component({
    selector: 'sb-top-nav',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './top-nav.component.html',
    styleUrls: ['top-nav.component.scss'],
})
export class TopNavComponent implements OnInit {
    @Input() title: string = '';
    showNav: boolean = true;
    
    onWindowScroll(event:any) {
        const scrollTop = event.target.documentElement.scrollTop;
        this.showNav = scrollTop < 50;
    }


    constructor(private navigationService: NavigationService) {}

    ngOnInit() {}
   
 }


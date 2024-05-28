import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UserService } from 'Frontend/auth/services';
import { SideNavItems, SideNavSection } from 'Frontend/navigation/models';
import { NavigationService } from 'Frontend/navigation/services';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';

@Component({
    selector: 'sb-side-nav',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './side-nav.component.html',
    styleUrls: ['side-nav.component.scss'],
})
export class SideNavComponent implements OnInit {
    @Input() sidenavStyle!: string;
    @Input() sideNavItems!: SideNavItems;
    @Input() sideNavSections!: any[];
    @Output() navWidth: any = new EventEmitter();

    subscription: Subscription = new Subscription();
    routeDataSubscription!: Subscription;

    showNavItem: boolean = true;
    items=[
        {id:1,name:'dashboard'},
        {id:2,name:'Contacts'},
        {id:11,name:'teambox'},
        {id:31,name:'SmartReplies'},
        {id:25,name:'camp'},
        {id:27,name:'Funnel'},
        {id:31,name:'FlowBuilder'},
        {id:1,name:'rep'},
    ]
 

    constructor(public navigationService: NavigationService, public userService: UserService,private router:Router, private settingsService:SettingsService) {}

    ngOnInit() {  
       console.log(this.sideNavSections);
       this.sideNavSections.forEach((item:any)=>{
        let data =item?.items;
        let tempArr =[];
        for(let i=0;i<data?.length;i++){
            let idx = this.items.filter((it:any)=> it.name == data[i])[0].id;
            console.log(idx);
            if(this.settingsService.checkRoleExist(idx.toString())){
                console.log('remove',data[i]);                
            //     data.splice(i);
            // i--;
        }else{
            tempArr.push(data[i]);
        }
        }
        item.items = tempArr;
        // item.forEach(element => {
        //     let idx = this.items.filter((it:any)=> it.name == element)[0].id;

        // });
       })
       console.log(this.sideNavSections,'jhk');
    }
    
    toggleHamburger(): void {
        const sideNavMenu = document.getElementById('sidenav-menu');
        const sideBarToggle = document.getElementById('sidebarToggle');
        const sideBarBody = document.getElementById('sidenavAccordion');
        const layoutMainSide = document.getElementById('layoutSidenav_content');
        const mainBody = document.getElementsByClassName('container-fluid')[0] as HTMLElement;
    
        if (sideNavMenu && sideBarToggle && sideBarBody && layoutMainSide) {
            if (sideBarBody.style.width === '100%') {
                sideBarBody.style.width = '100%';
                mainBody.style.marginLeft = '-4%';
                layoutMainSide.style.paddingLeft= '155px';
                sideBarToggle.style.marginLeft = '-3px';
                this.navWidth.emit('56px');
            } else {
                sideBarBody.style.width = '100%';
                sideNavMenu.style.borderRight = '1px solid #EBEBEB';
                mainBody.style.marginLeft = '0';
                layoutMainSide.style.paddingLeft= '225px';
                sideBarToggle.style.marginLeft = '-148px';
                this.navWidth.emit('225px');
            }
        }
    }
}

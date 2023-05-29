import { ChangeDetectorRef, Component, OnInit,ChangeDetectionStrategy } from '@angular/core';
import { DashboardService } from './../../services';
import { Router } from '@angular/router';

@Component({
    selector: 'sb-dashboard',
    templateUrl: './dashboard.component.html',
    changeDetection:ChangeDetectionStrategy.Default,
    styleUrls: ['dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    interactions: any;
    dashboard: any;
    campaigns: any;
    agents: any;
    recentConversation:any;
    scheduledCampaign:any;
    completedCampaign:any;
    runningCampaign:any;
    draftCampaign:any;
    Name:any;
   

    constructor(private apiService: DashboardService, private router: Router, private cdRef: ChangeDetectorRef) { }
    ngOnInit() {

        //this.routerGuard();
        this.getDashboardSubscribers();
        this.getDashboardInteractions();
        this.getdashboardCampaigns();
        this.getdashboardAgents();
        this. getRecentConversation();
        this.Name = (JSON.parse(sessionStorage.getItem('loginDetails')!)).name;

        console.log (sessionStorage);
        console.log(this.Name);
    }

    //******* Router Guard  *********//
    routerGuard = () => {
        if (sessionStorage.getItem('SP_ID') === null) {
            this.router.navigate(['login']);
        }
    }

    getDashboardSubscribers() {
        var sPid = sessionStorage.getItem('SP_ID')
        this.apiService.dashboardSubscribers(sPid).subscribe(data => {
            this.dashboard = data;
            
        });
    }
    getDashboardInteractions() {
        this.apiService.dashboardInteractions().subscribe(data => {
            this.interactions = data;
        });
    }
    getdashboardCampaigns() {
        var sPid = sessionStorage.getItem('SP_ID')
        this.apiService.dashboardCampaigns(sPid).subscribe(data => {

            this.campaigns = data;
            for (var i = 0; i < this.campaigns.length; i++) {
                if (this.campaigns[i].STATUS == '1') {
                    this.scheduledCampaign = this.campaigns[i].COUNT
                }
                if (this.campaigns[i].STATUS == '2') {
                    this.completedCampaign = this.campaigns[i].COUNT
                }
                if (this.campaigns[i].STATUS == '3') {
                    this.runningCampaign = this.campaigns[i].COUNT
                }
                if (this.campaigns[i].STATUS == '4') {
                    this.draftCampaign = this.campaigns[i].COUNT
                    console.log(this.draftCampaign);
                }
            }

        });
    }
    getdashboardAgents() {
        var SP_ID = sessionStorage.getItem('SP_ID')

        this.apiService.dashboardAgents(SP_ID).subscribe(data => {
            this.agents = data;
        });
    }
    getRecentConversation() {

        var SP_ID = sessionStorage.getItem('SP_ID')

        this.apiService.dashboardRecentConversation(SP_ID).subscribe((data: any) => {
            this.recentConversation = data[0];


        })
    }

    routeToPage() {
        this.router.navigate(['/dashboard/contacts']);
    }

    routeToPage1() {
        this.router.navigate(['/dashboard/teambox']);
    }
    routeToPage2() {
        this.router.navigate(['/dashboard/automation']);
    }
  
}

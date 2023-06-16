import { Component, OnInit,ChangeDetectionStrategy } from '@angular/core';
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
    closedInteractions:number = 0;
    openInteractions:number = 0;
    totalInteractions:number = 0;
    dashboard: any;
    totalContacts:number = 0;
    activeContacts:number = 0;
    inactiveContacts:number = 0;
    campaigns: any;
    agents: any;
    totalAgents:number = 0;
    activeAgents:number = 0;
    inactiveAgents:number = 0;
    recentConversation:any;
    scheduledCampaign:number = 0;
    completedCampaign:number = 0;
    runningCampaign:number = 0;
    draftCampaign:number = 0;
    Name:any;
   

    constructor(private apiService: DashboardService, private router: Router) { }
    ngOnInit() {

        // this.routerGuard();
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
    // routerGuard = () => {
    //     if (sessionStorage.getItem('SP_ID') === null) {
    //         this.router.navigate(['login']);
    //     }
    // }

    getDashboardSubscribers() {
        var sPid = sessionStorage.getItem('SP_ID')
        this.apiService.dashboardSubscribers(sPid).subscribe(data => {
            this.dashboard = data;
            for (var i = 0; i < this.dashboard.length; i++) {
                if (this.dashboard[i].OptInStatus === 'Total Contacts') {
                    this.totalContacts = this.dashboard[i].count;
                }
                if (this.dashboard[i].OptInStatus === 'Active Subscribers') {
                    this.activeContacts = this.dashboard[i].count;
                }
                if (this.dashboard[i].OptInStatus === 'null') {
                    this.inactiveContacts = this.dashboard[i].count;
                }
            }
            
        });
    }
    getDashboardInteractions() {
        var sPid = sessionStorage.getItem('SP_ID');
        this.apiService.dashboardInteractions(sPid).subscribe(data => {
            this.interactions = data;
            console.log(this.interactions);
            for (var i = 0; i < this.interactions.length; i++) {
                if (this.interactions[i].interaction_status === 'Open') {
                    this.closedInteractions = this.interactions[i].count;
                }
                if (this.interactions[i].interaction_status === 'Open Interactions') {
                    this.openInteractions = this.interactions[i].count;
                }
                if (this.interactions[i].interaction_status === 'Total Interactions') {
                    this.totalInteractions = this.interactions[i].count;
                }
            }
        });
    }
    getdashboardCampaigns() {
        var sPid = sessionStorage.getItem('SP_ID')
        this.apiService.dashboardCampaigns(sPid).subscribe(data => {

            this.campaigns = data;
            for (var i = 0; i < this.campaigns.length; i++) {
                if (this.campaigns[i].STATUS == '0') {
                    this.scheduledCampaign = this.campaigns[i].COUNT
                }
                if (this.campaigns[i].STATUS == '1') {
                    this.completedCampaign = this.campaigns[i].COUNT
                }
                if (this.campaigns[i].STATUS == '2') {
                    this.runningCampaign = this.campaigns[i].COUNT
                }
                if (this.campaigns[i].STATUS == '3') {
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
            for (var i = 0; i < this.agents.length; i++) {
                if (this.agents[i].Status === 'Total Agents') {
                    this.totalAgents = this.agents[i].count;
                }
                if (this.agents[i].Status === 'Active Agents') {
                    this.activeAgents = this.agents[i].count;
                }
                if (this.agents[i].Status === 'Inactive Agents') {
                    this.inactiveAgents = this.agents[i].count;
                }
            }

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
    routeToPage3() {
        this.router.navigate(['/dashboard/campaigns']);
    } 
  
}

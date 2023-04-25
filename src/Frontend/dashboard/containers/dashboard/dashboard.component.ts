import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DashboardService } from './../../services';
import { Router } from '@angular/router';

@Component({
    selector: 'sb-dashboard',
    changeDetection: ChangeDetectionStrategy.Default,
    templateUrl: './dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    interactions: any;
    dashboard: any;
    campaigns: any;
    agents: any;
    recentConversation:any;
    Name:any;
    constructor(private apiService: DashboardService, private router: Router) { }
    ngOnInit() {
        this.getDashboardSubscribers();
        this.getDashboardInteractions();
        this.getdashboardCampaigns();
        this.getdashboardAgents();
        this. getRecentConversation();
        this.Name = sessionStorage.loginDetails;
     
        console.log(sessionStorage);
    }

    getDashboardSubscribers() {
        this.apiService.dashboardSubscribers().subscribe(data => {
            this.dashboard = data;
            console.log(this.dashboard);
        });
    }
    getDashboardInteractions() {
        this.apiService.dashboardInteractions().subscribe(data => {
            this.interactions = data;
            console.log(this.interactions);
        });
    }
    getdashboardCampaigns() {
        this.apiService.dashboardCampaigns().subscribe(data => {
            this.campaigns = data;
            console.log(this.campaigns);
        });
    }
    getdashboardAgents() {
        this.apiService.dashboardAgents().subscribe(data => {
            this.agents = data;
            console.log(this.agents);
        });
    }
    getRecentConversation() {
        sessionStorage.setItem('SP_ID', '1')
        var SP_ID = sessionStorage.getItem('SP_ID')
        this.apiService.dashboardRecentConversation(SP_ID).subscribe((data: any) => {
            // console.log(data)
            this.recentConversation = data;
            console.log("recentConversation")
            console.log(this.recentConversation)

        })
    }

    routeToPage() {
        this.router.navigate(['/dashboard/reports']);
    }

    routeToPage1() {
        this.router.navigate(['/dashboard/import']);
    }
    routeToPage2() {
        this.router.navigate(['/dashboard/reports']);
    }
}

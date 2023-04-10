import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {DashboardService} from './../../services';

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
    constructor(private apiService: DashboardService) { }
    ngOnInit() {
        this.getDashboardSubscribers();
        this.getDashboardInteractions();
        this.getdashboardCampaigns();
        this.getdashboardAgents();
        this. getRecentConversation();
    }
    
    getDashboardSubscribers(){
        this.apiService.dashboardSubscribers().subscribe(data =>{
            this.dashboard=data;
            console.log(this.dashboard)
        })
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
    getRecentConversation(){
        this.apiService.dashboardRecentConversation().subscribe((data:any)=>{
            this.recentConversation=data;
            console.log(this.recentConversation)
            console.log("recentConversation")
        })
    }
}
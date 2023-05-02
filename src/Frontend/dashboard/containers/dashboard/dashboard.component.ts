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
    scheduledCampaign:any;
    completedCampaign:any;
    runningCampaign:any;
    draftCampaign:any;
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
        var sPid=sessionStorage.getItem('SP_ID')
        this.apiService.dashboardSubscribers(sPid).subscribe(data => {
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
        var sPid=sessionStorage.getItem('SP_ID')
        this.apiService.dashboardCampaigns(sPid).subscribe(data => {
           
            this.campaigns = data;
            for(var i=0;i<this.campaigns.length;i++){
                if(this.campaigns[i].STATUS=='1'){
                    this.scheduledCampaign=this.campaigns[i].COUNT  
                }
                if(this.campaigns[i].STATUS=='2'){
                    this.completedCampaign=this.campaigns[i].COUNT
                }
                if(this.campaigns[i].STATUS=='3'){
                    this.runningCampaign=this.campaigns[i].COUNT
                }
                if(this.campaigns[i].STATUS=='4'){
                    this.draftCampaign=this.campaigns[i].COUNT
                      console.log(this.draftCampaign);
                }
            }
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
        
        var SP_ID=sessionStorage.getItem('SP_ID')
  
        this.apiService.dashboardRecentConversation(SP_ID).subscribe((data:any)=>{
            console.log("dashboardRecentConversation")
            this.recentConversation=data[0];
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

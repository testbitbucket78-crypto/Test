import { Component, OnInit,ChangeDetectionStrategy } from '@angular/core';
import { DashboardService } from './../../services';
import { ProfileService } from 'Frontend/dashboard/services/profile.service';
import { Router } from '@angular/router';
import { SettingsService } from 'Frontend/dashboard/services/settings.service';
@Component({
    selector: 'sb-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
    changeDetection:ChangeDetectionStrategy.Default,
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
    SPID = 0;
    nameInitials: string[] = [];
    availableAmount=0;
    isLoading!:boolean;

    errorMessage='';
	successMessage='';
	warningMessage='';

    whatsAppDisplay: any[] = [];
    constructor(private apiService: DashboardService, private router: Router,private profileService:ProfileService,private settingsService:SettingsService) { }
    ngOnInit() {
       
        this.isLoading = true;
        this.routerGuard();
        this.getDashboardSubscribers();
        this.getDashboardInteractions();
        this.getdashboardCampaigns();
        this.getdashboardAgents();
        this.getRecentConversation();
        this.getAvailableAmount();
        this.Name = (JSON.parse(sessionStorage.getItem('loginDetails')!)).name;
        this.SPID = Number(sessionStorage.getItem('SP_ID'));
        this.clientAuthentication();
       
        
    }
    showToaster(message:any,type:any){
		if(type=='success'){
			this.successMessage=message;
		}else if(type=='error'){
            this.errorMessage=message;
        }else{
			this.warningMessage=message;
		}
		setTimeout(() => {
			this.hideToaster()
		}, 5000);
	}
    hideToaster(){
		this.successMessage='';
		this.errorMessage='';
		this.warningMessage='';
	}
  // ******* Router Guard  *********//
    routerGuard = () => {
        if (sessionStorage.getItem('SP_ID') === null) {
            this.router.navigate(['login']);
        }
     }
     clientAuthentication(){
        const navigation = history.state
        if (navigation?.message == 'Logged In') {
            let input = {
                spid: this.SPID
            };
            setTimeout(() => {
            this.settingsService.clientAuthenticated(input).subscribe(response => {
                if (response.status === 200) {
                    console.log(response.message);
                }
                if (response.status === 404) {
                    console.log(response.message);
                    this.whatsAppDisplay = response.result
                    this.showToaster('Channel not connected', 'error');
                }
            });
        },600);
        }
     }
    
    getDashboardSubscribers() {
        var sPid = sessionStorage.getItem('SP_ID')
        this.apiService.dashboardSubscribers(sPid).subscribe(data => {
            this.dashboard = data;
            for (var i = 0; i < this.dashboard.length; i++) {
                if (this.dashboard[i].OptInStatus === 'Total Contacts') {
                    this.totalContacts = this.dashboard[i].count;
                }
                if (this.dashboard[i].OptInStatus === 'Yes') {
                    this.activeContacts = this.dashboard[i].count;
                }
                if (this.dashboard[i].OptInStatus === 'No') {
                    this.inactiveContacts = this.dashboard[i].count;
                }
            }
            
        });
    }
    getDashboardInteractions() {
        var sPid = sessionStorage.getItem('SP_ID');
        this.apiService.dashboardInteractions(sPid).subscribe(data => {
            this.interactions = data;
            for (var i = 0; i < this.interactions.length; i++) {
                if (this.interactions[i].interaction_status === 'Resolved') {
                    this.closedInteractions = this.interactions[i].count;
                }
                if (this.interactions[i].interaction_status === 'Open') {
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
                if (this.campaigns[i].STATUS == '1') {
                    this.scheduledCampaign = this.campaigns[i].COUNT
                }
                if (this.campaigns[i].STATUS == '3') {
                    this.completedCampaign = this.campaigns[i].COUNT
                }
                if (this.campaigns[i].STATUS == '2') {
                    this.runningCampaign = this.campaigns[i].COUNT
                }
                if (this.campaigns[i].STATUS == '0') {
                    this.draftCampaign = this.campaigns[i].COUNT
                }
            }

        });
    }
    getdashboardAgents() {
        var SP_ID = sessionStorage.getItem('SP_ID')

        this.apiService.dashboardAgents(SP_ID).subscribe(data => {
            
            this.agents = data;
            for (var i = 0; i < this.agents.length; i++) {
                if (this.agents[i].IsActive === 'Total Agents') {
                    this.totalAgents = this.agents[i].count;
                }
                if (this.agents[i].IsActive === '1') {
                    this.activeAgents = this.agents[i].count;
                }
                if (this.agents[i].IsActive === '0') {
                    this.inactiveAgents = this.agents[i].count;
                }
            }

        });
    }
    getRecentConversation() {

        var SP_ID = sessionStorage.getItem('SP_ID')

        this.apiService.dashboardRecentConversation(SP_ID).subscribe((data: any) => {
            this.recentConversation = data[0];
        
            this.recentConversation.forEach((item: { Name: string; nameInitials: string; }) => {
                const nameParts = item.Name.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts[1] || '';
                const nameInitials = firstName.charAt(0)+ ' ' +lastName.charAt(0);
    
                item.nameInitials = nameInitials;
            });
        
            console.log(this.recentConversation);
        });
        
    
    }
    

    getLimitedMessageText(message: string) {
        let maxLength = 70;
        if (message.length <= maxLength) {
        return message;
        } else {
        return message.substring(0, maxLength) + '...';
        }

    }

    getAvailableAmount() {
        const spid = Number(sessionStorage.getItem('SP_ID'));
        this.profileService.showAvailableAmount(spid).subscribe(response => {
            this.isLoading = false;
            let amountAvilable = response?.AvailableAmout;
            this.availableAmount = amountAvilable?.toFixed(2);
            console.log(this.availableAmount)
      });
    }

    routeToPage(link:string) {
        this.router.navigate([link]);
    }
  
}

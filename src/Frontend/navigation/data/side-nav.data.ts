import { SideNavItems, SideNavSection } from 'Frontend/navigation/models';

export const sideNavSections: SideNavSection[] = [
    {
       
        items: ['dashboard'],
    },
    
    {
        items: ['camp', 'teambox', 'Contacts',  'automation', 'rep'],
    },
];

export const sideNavItems: SideNavItems = {
    dashboard: {
        icon: 'assets/img/dashboard.png',
        text: 'Dashboard',
        link: '/dashboard',
    },
    
    camp: {
        icon: 'assets/img/campaign.png',
        text: 'Campaings',
        link: '/dashboard/campaigns',
    },
     
    teambox: {
        icon: 'assets/img/teambox.png',
        text: 'Teambox',
        link: '/dashboard/teambox',
    },
    Contacts: {
        icon: 'assets/img/contacts.png',
        text: 'Contacts',
        link: '/dashboard/contacts',
    },
 
  

    automation: {

        text: 'Automation',
        submenu: [
            {
                icon: 'assets/img/funnel.png',
                text: 'Funnel',
                link: '/dashboard/automation',
            },
            {
                icon: 'assets/img/Flowbuilder.png',
                text: 'Flow builder',
                link: '/dashboard/flowBuilder',
            },
            {
                icon: 'assets/img/Smartreplies.png',
                text: 'Smart Replies',
                link: '/dashboard/smartReplies',
            },
            {
                text: 'Reply Material',
                link: '/dashboard/replyMaterial',
            },


        ],
    },
  
      reports: {
        icon: 'assets/img/rep.png',
        text: 'Repots',
        link: '/dashboard/reports',
    },

    rep: {
        icon: 'assets/img/rep.png',
        text: 'Reports',
        submenu: [
            {
                text: 'Reports List',
                link: '/dashboard/reports',
            },
            {
                icon: 'assets/img/con-report.png',
                text: ' Report Conversation',
                link: '/dashboard/conversation',
            },
            {
                icon: 'assets/img/camp-repot.png',
                text: 'Campaings Reports',
                link: '/dashboard/reportcampaign',
            },
            {
                text: 'Automation Reports',
                link: '/dashboard/reportautomation',
            },
            {
                text: 'Report Filters',
                link: '/dashboard',
            },
            {
                text: 'Export Reports',
                link: '/dashboard',
            },


        ],
    },

};

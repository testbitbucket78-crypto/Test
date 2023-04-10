import { SideNavItems, SideNavSection } from 'Frontend/navigation/models';

export const sideNavSections: SideNavSection[] = [
    {
       
        items: ['dashboard'],
    },
    
    {
        items: ['Contacts', 'teambox', 'camp', 'automation', 'rep','setting'],
    },
];

export const sideNavItems: SideNavItems = {
    dashboard: {
        icon: 'tachometer-alt',
        text: 'Dashboard',
        link: '/dashboard',
    },
    automation: {
        icon: 'tachometer-alt',
        text: 'Automation',
        submenu: [
        {
                        text: 'Funnel',
                        link: '/dashboard/automation',
                    },
                 {
                        text: 'Flow builder',
                        link: '/dashboard/flowBuilder',
                    },
                    {
                        text: 'Smart Replies',
                        link: '/dashboard/smartReplies',
                    },
                 {
                        text: 'Reply Material',
                        link: '/dashboard/replyMaterial',
                    },
                   
    
        ],
    },
     rep: {
        text: 'Reports',
        submenu: [
        {
                        text: 'Reports List',
                        link: '/dashboard/reports',
                    },
                 {
                        text: ' Report Conversation',
                        link: '/dashboard/conversation',
                    },
                    {
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
    camp: {
        // icon: 'table',
        text: 'Campaings',
        link: '/dashboard/campaigns',
    },
      Contacts: {
        // icon: 'table',
        text: 'Contacts',
        link: '/dashboard/contacts',
    },
    teambox: {
        // icon: 'table',
        text: 'Teambox',
        link: '/dashboard/teambox',
    },
      campaings: {
        // icon: 'table',
        text: 'Campaigns',
        link: '/dashboard/campaigns',
    },
    //   automation: {
    //     // icon: 'table',
    //     text: 'Automation',
    //     link: '/dashboard/automation',
    // },
      reports: {
        // icon: 'table',
        text: 'Repots',
        link: '/dashboard/reports',
    },
     setting: {
        // icon: 'table',
        text: 'Setting',
        link: '/dashboard/setting',
    },
};

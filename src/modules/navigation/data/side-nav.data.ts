import { SideNavItems, SideNavSection } from '@modules/navigation/models';

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
    camp: {
        text: 'Campaings',
        submenu: [
        {
                        text: 'Running',
                        link: '/dashboard/campaigns',
                    },
                 {
                        text: 'Compose',
                        link: '/dashboard/compose',
                    },
                    {
                        text: 'Schedule',
                        link: '/dashboard/schedule',
                    },
                 {
                        text: 'Summary',
                        link: '/dashboard/campaignReport',
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
                        text: 'Conversations Reports',
                        link: '/dashboard',
                    },
                    {
                        text: 'Campaings Reports',
                        link: '/dashboard',
                    },
                 {
                        text: 'Automation Reports',
                        link: '/dashboard',
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
      automation: {
        // icon: 'table',
        text: 'Automation',
        link: '/dashboard/automation',
    },
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

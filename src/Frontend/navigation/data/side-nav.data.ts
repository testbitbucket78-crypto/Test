import { SideNavItems, SideNavSection } from 'Frontend/navigation/models';

export const sideNavSections: SideNavSection[] = [
    {

        items: ['dashboard'],
    },

    {
        items: ['Contacts', 'teambox', 'SmartReplies', 'camp', 'Funnel', 'FlowBuilder',  'rep'],
    },
];

export const sideNavItems: SideNavItems = {
    dashboard: {
        icon: 'assets/img/side-nav/dashboard.svg',
        text: 'Dashboard',
        link: '/dashboard',
    },

    Contacts: {
        icon: 'assets/img/side-nav/contacts.svg',
        text: 'Contacts',
        link: '/dashboard/contacts',
    },

    teambox: {
        icon: 'assets/img/side-nav/teambox.svg',
        text: 'Teambox',
        link: '/dashboard/teambox',
    },

    SmartReplies: {
        icon: 'assets/img/side-nav/Smartreplies.svg',
        text: 'Smart Replies',
        link: '/dashboard/smartReplies',
    },

    camp: {
        icon: 'assets/img/side-nav/campaign.svg',
        text: 'Campaigns',
        link: '/dashboard/campaigns',
    },

    
    Funnel: {

        icon: 'assets/img/side-nav/funnel.svg',
        text: 'Funnel',
        link: '/dashboard/funnel',
    },

    FlowBuilder: {
        icon: 'assets/img/side-nav/Flowbuilder.svg',
        text: 'Flow Builder',
        link: '/dashboard/flowBuilder',
    },

 

    rep: {
        icon: 'assets/img/side-nav/repots.svg',
        text: 'Reports',
        link: '/dashboard/reports',
        submenu: [

            {
                icon: 'assets/img/side-nav/con-report.svg',
                text: ' Conversational Reports',
                link: '/dashboard/conversationalReports',
            },
            {
                icon: 'assets/img/side-nav/camp-repot.svg',
                text: 'Campaign Reports',
                link: '/dashboard/campaignReports',
            },
            {
                icon: 'assets/img/side-nav/auto-report.svg',
                text: 'Automation Reports',
                link: '/dashboard/automationReports',
            },

        ],
    },

};

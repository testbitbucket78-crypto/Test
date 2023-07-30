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
        link: '/dashboard/automation',
    },

    FlowBuilder: {
        icon: 'assets/img/side-nav/Flowbuilder.svg',
        text: 'Flow Builder',
        link: '/dashboard/flowBuilder',
    },

 

    rep: {
        icon: 'assets/img/side-nav/repots.svg',
        text: 'Reports',
        submenu: [

            {
                icon: 'assets/img/side-nav/con-report.svg',
                text: ' Conversational Report',
                link: '/dashboard/conversation',
            },
            {
                icon: 'assets/img/side-nav/camp-repot.svg',
                text: 'Campaign Report',
                link: '/dashboard/reportcampaign',
            },
            {
                icon: 'assets/img/side-nav/auto-report.svg',
                text: 'Automation Report',
                link: '/dashboard/reportautomation',
            },

        ],
    },

    // Setting: {
    //     icon: 'assets/img/Flowbuilder.png',
    //     text: 'Flow Builder',
    //     link: '/dashboard/flowBuilder',
    // },

};

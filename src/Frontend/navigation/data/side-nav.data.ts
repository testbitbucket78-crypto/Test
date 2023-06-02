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
        icon: 'assets/img/dashboard.png',
        text: 'Dashboard',
        link: '/dashboard',
    },

    Contacts: {
        icon: 'assets/img/contacts.png',
        text: 'Contacts',
        link: '/dashboard/contacts',
    },

    teambox: {
        icon: 'assets/img/teambox.png',
        text: 'Teambox',
        link: '/dashboard/teambox',
    },

    SmartReplies: {
        icon: 'assets/img/Smartreplies.png',
        text: 'Smart Replies',
        link: '/dashboard/smartReplies',
    },

    camp: {
        icon: 'assets/img/campaign.png',
        text: 'Campaigns',
        link: '/dashboard/campaigns',
    },

    
    Funnel: {

        icon: 'assets/img/funnel.png',
        text: 'Funnel',
        link: '/dashboard/automation',
    },

    FlowBuilder: {
        icon: 'assets/img/Flowbuilder.png',
        text: 'Flow Builder',
        link: '/dashboard/flowBuilder',
    },

 

    rep: {
        icon: 'assets/img/rep.png',
        text: 'Reports',
        submenu: [

            {
                icon: 'assets/img/con-report.png',
                text: ' Conversational Report',
                link: '/dashboard/conversation',
            },
            {
                icon: 'assets/img/camp-repot.png',
                text: 'Campaign Report',
                link: '/dashboard/reportcampaign',
            },
            {
                icon: 'assets/img/auto-report.png',
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

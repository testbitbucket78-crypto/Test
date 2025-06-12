import { SideNavItems, SideNavSection } from 'Frontend/navigation/models';

export const sideNavSections: SideNavSection[] = [
    {

        items: ['dashboard'],
    },

    {
        items: ['Contacts', 'teambox', 'SmartReplies', 'camp','flow', 'Funnel', 'FlowBuilder',  'rep','botBuilder'],
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
        link: '/contacts',
    },

    teambox: {
        icon: 'assets/img/side-nav/teambox.svg',
        text: 'Teambox',
        link: '/teambox',
    },

    SmartReplies: {
        icon: 'assets/img/side-nav/Smartreplies.svg',
        text: 'Smart Replies',
        link: '/smartReplies',
    },

    camp: {
        icon: 'assets/img/side-nav/campaign.svg',
        text: 'Campaigns',
        link: '/campaigns',
    },

    flow: {
        icon: 'assets/img/side-nav/campaign.svg',
        text: 'Whatsapp Flow',
        link: '/flow',
    },
    botBuilder: {
        icon: 'assets/img/side-nav/campaign.svg',
        text: 'Bot Builder',
        link: '/bot-builder',
    },

    
    // Funnel: {

    //     icon: 'assets/img/side-nav/funnel.svg',
    //     text: 'Funnel',
    //     link: '/funnel',
    // },

    // FlowBuilder: {
    //     icon: 'assets/img/side-nav/Flowbuilder.svg',
    //     text: 'Flow Builder',
    //     link: '/flowBuilder',
    // },

 

    // rep: {
    //     icon: 'assets/img/side-nav/repots.svg',
    //     text: 'Reports',
    //     link: '/reports',
    //     submenu: [

    //         {
    //             icon: 'assets/img/side-nav/con-report.svg',
    //             text: ' Conversational Reports',
    //             link: '/conversationalReports',
    //         },
    //         {
    //             icon: 'assets/img/side-nav/camp-repot.svg',
    //             text: 'Campaign Reports',
    //             link: '/campaignReports',
    //         },
    //         {
    //             icon: 'assets/img/side-nav/auto-report.svg',
    //             text: 'Automation Reports',
    //             link: '/automationReports',
    //         },

    //     ],
    // },

};

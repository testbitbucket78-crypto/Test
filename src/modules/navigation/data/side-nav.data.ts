import { SideNavItems, SideNavSection } from '@modules/navigation/models';

export const sideNavSections: SideNavSection[] = [
    {
       
        items: ['dashboard'],
    },
    // {
     
    //     items: ['layouts', 'pages'],
    // },
    {
        items: ['Contacts', 'teambox', 'campaings', 'automation', 'reports'],
    },
];

export const sideNavItems: SideNavItems = {
    dashboard: {
        icon: 'tachometer-alt',
        text: 'Dashboard',
        link: '/dashboard',
    },
    // pages: {
    //     icon: 'book-open',
    //     text: 'Pages',
    //     submenu: [
    //         {
    //             text: 'Authentication',
    //             submenu: [
    //                 {
    //                     text: 'Login',
    //                     link: '/auth/login',
    //                 },
    //                 {
    //                     text: 'Register',
    //                     link: '/auth/register',
    //                 },
    //                 {
    //                     text: 'Forgot Password',
    //                     link: '/auth/forgot-password',
    //                 },
    //             ],
    //         },
    //         {
    //             text: 'Error',
    //             submenu: [
    //                 {
    //                     text: '401 Page',
    //                     link: '/error/401',
    //                 },
    //                 {
    //                     text: '404 Page',
    //                     link: '/error/404',
    //                 },
    //                 {
    //                     text: '500 Page',
    //                     link: '/error/500',
    //                 },
    //             ],
    //         },
    //     ],
    // },
    Contacts: {
        // icon: 'table',
        text: 'Contacts',
        link: '/',
    },
    teambox: {
        // icon: 'table',
        text: 'Teambox',
        link: '/',
    },
      campaings: {
        // icon: 'table',
        text: 'Campaings',
        link: '/',
    },
      automation: {
        // icon: 'table',
        text: 'Automation',
        link: '/',
    },
      reports: {
        // icon: 'table',
        text: 'Repots',
        link: '/',
    },
};

/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SBRouteData } from 'Frontend/navigation/models';

/* Module */
import { DashboardModule } from './dashboard.module';

/* Containers */
import * as dashboardContainers from './containers';

export const routes: Routes = [
    {
        path: '',
        data: {
            title: 'Dashboard',
            breadcrumbs: [
                {
                    text: 'Dashboard',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.DashboardComponent,
    },
    {
        path: 'contacts',
        data: {
            title: 'Contacts',
            breadcrumbs: [
                {
                    text: 'Contacts',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.ContactsComponent,
    },
    {
        path: 'teambox',
        data: {
            title: 'Teambox',
            breadcrumbs: [
                {
                    text: 'Teambox',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.TeamboxComponent,
    },
    {
        path: 'teambox/:isNewMessage',
        data: {
            title: 'Teambox',
            breadcrumbs: [
                {
                    text: 'Teambox',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.TeamboxComponent,
    },
    {
        path: 'import',
        data: {
            title: 'Import Contact',
            breadcrumbs: [
                {
                    text: 'Import Contact',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.ImportComponent,
    },
    {
        path: 'campaigns',
        data: {
            title: 'Campaigns',
            breadcrumbs: [
                {
                    text: 'Campaigns',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.CampaignsComponent,
    },
    {
        path: 'funnel',
        data: {
            title: 'Funnel',
            breadcrumbs: [
                {
                    text: 'Funnel',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.FunnelComponent,
    },
    {
        path: 'smartReplies',
        data: {
            title: 'Smart Replies',
            breadcrumbs: [
                {
                    text: 'Smart Replies',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.SmartRepliesComponent,
    },
    {
        path: 'flowBuilder',
        data: {
            title: 'Flow builder',
            breadcrumbs: [
                {
                    text: 'Flow builder',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.FlowBuilderComponent,
    },
    {
        path: 'reports',
        data: {
            title: 'Reports',
            breadcrumbs: [
                {
                    text: 'Reports',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.ReportsComponent,
    },
    {
        path: 'conversationalReports',
        data: {
            title: 'Conversational Reports',
            breadcrumbs: [
                {
                    text: 'Conversational Reports',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.ConversationalReportsComponent,
    },
    {
        path: 'campaignReports',
        data: {
            title: 'Campaign Reports',
            breadcrumbs: [
                {
                    text: 'Campaign Reports',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.CampaignReportsComponent,
    },
    {
        path: 'automationReports',
        data: {
            title: 'Automation Reports',
            breadcrumbs: [
                {
                    text: 'Automation Reports',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.AutomationReportsComponent,
    },
    {
        path: 'setting',
        data: {
            title: 'Settings',
            breadcrumbs: [
                {
                    text: 'Settings',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.SettingComponent,
    },
    {
        path: 'myprofile',
        data: {
            title: 'Profile',
            breadcrumbs: [
                {
                    text: 'Profile',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.MyprofileComponent,
    },
    {
        path: 'support',
        data: {
            title: 'Support',
            breadcrumbs: [
                {
                    text: 'Support',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.SupportComponent,
    },
    {
        path: 'notifications',
        data: {
            title: 'Notifications',
            breadcrumbs: [
                {
                    text: 'Notifications',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.NotificationsComponent,
    },
    {
        path: 'flow',
        data: {
            title: 'Whatsapp Flows',
            breadcrumbs: [
                {
                    text: 'flow',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.WhatsAppFlowsComponent,
    }
];

// @NgModule({
//     imports: [RouterModule.forRoot(routes, { useHash: false })],
//     exports: [RouterModule],
// })
// export class AppRoutingModule {}

@NgModule({
    imports: [DashboardModule, RouterModule.forRoot(routes, { useHash: false })],
    exports: [RouterModule],
})
export class DashboardRoutingModule {}
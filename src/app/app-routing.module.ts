import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardModule } from 'Frontend/dashboard/dashboard.module';

import { SBRouteData } from 'Frontend/navigation/models';

/* Module */
/* Containers */
//import * as dashboardContainers from '.\.\src\Frontend\dashboard\containers\index.ts';
import * as dashboardContainers from '../Frontend/dashboard/containers';
import * as authContainers from '../Frontend/auth/containers';
import { AuthModule } from 'Frontend/auth/auth.module';


const routes: Routes = [
    // {
    //     path: '',
    //     pathMatch: 'full',
    //     redirectTo: 'login',
    // },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',  // Redirect empty path to login
    },
    // {
    //     path: 'dashboard',
    //     loadChildren: () =>
    //         import('Frontend/dashboard/dashboard-routing.module').then(
    //             m => m.DashboardRoutingModule
    //         ),
    // },
    // {
    //     path: 'import',
    //     loadChildren: () =>
    //         import('Frontend/dashboard/dashboard-routing.module').then(
    //             m => m.DashboardRoutingModule
    //         ),
    // },
    // {
    //     path: 'campaigns',
    //     loadChildren: () =>
    //         import('Frontend/dashboard/dashboard-routing.module').then(
    //             m => m.DashboardRoutingModule
    //         ),
    // },
    // {
    //     path: 'smartReplies',
    //     loadChildren: () =>
    //         import('Frontend/dashboard/dashboard-routing.module').then(
    //             m => m.DashboardRoutingModule
    //         ),
    // },
    // {
    //     path: 'setting',
    //     loadChildren: () =>
    //         import('Frontend/dashboard/dashboard-routing.module').then(
    //             m => m.DashboardRoutingModule
    //         ),
    // },
    // {
    //     path: 'setting',
    //     loadChildren: () =>
    //         import('Frontend/dashboard/dashboard-routing.module').then(
    //             m => m.DashboardRoutingModule
    //         ),
    // },

    {
        path: 'auth',
        loadChildren: () =>
            import('Frontend/auth/auth-routing.module').then(m => m.AuthRoutingModule),
    },
    
    {
        path: 'error',
        loadChildren: () =>
            import('Frontend/error/error-routing.module').then(m => m.ErrorRoutingModule),
    },
    {
        path: 'tables',
        loadChildren: () =>
            import('Frontend/tables/tables-routing.module').then(m => m.TablesRoutingModule),
    },
    // {
    //     path: '**',
    //     pathMatch: 'full',
    //     loadChildren: () =>
    //         import('Frontend/error/error-routing.module').then(m => m.ErrorRoutingModule),
    // },



    {
        path: 'dashboard',
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
        path: 'tools',
        data: {
            title: 'Tools',
            breadcrumbs: [
                {
                    text: 'Tools',
                    active: true,
                },
            ],
        } as SBRouteData,
        component: dashboardContainers.ToolsComponent,
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
        path: 'login',
      //  canActivate: [],
        component: authContainers.LoginComponent,
        data: {
            title: 'CIP - Sign In',
            breadcrumbs: [
                {
                    text: 'login',
                    active: true,
                },
            ],
        } as SBRouteData,
    },
    {
        path: 'register',
        canActivate: [],
        component: authContainers.RegisterComponent,
        data: {
            title: 'CIP - Sign Up',
        } as SBRouteData,
    },
    {
        path: 'forgot-password',
        canActivate: [],
        component: authContainers.ForgotPasswordComponent,
        data: {
            title: 'CIP - Forgot Password',
        } as SBRouteData,
    },
    {
        path: 'reset-password',
        canActivate: [],
        component: authContainers.ResetPasswordComponent,
        data: {
            title: 'CIP - Reset Password',
        } as SBRouteData,
    },
   
    {
        path: 'verification',
        canActivate: [],
        component: authContainers.VerificationComponent,
        data: {
            title: 'CIP - Verification',
        } as SBRouteData,
    },
    {
        path: 'Create-password',
        canActivate: [],
        component: authContainers.CreatePasswordComponent,
        data: {
            title: 'CIP - Create-password',
        } as SBRouteData,
    },
];

@NgModule({
    imports: [DashboardModule,AuthModule, RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}

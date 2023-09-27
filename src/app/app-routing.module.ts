import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardModule } from 'Frontend/dashboard/dashboard.module';

const routes: Routes = [
    // {
    //     path: '',
    //     pathMatch: 'full',
    //     redirectTo: 'login',
    // },
    {
        path: 'dashboard',
        loadChildren: () =>
            import('Frontend/dashboard/dashboard-routing.module').then(
                m => m.DashboardRoutingModule
            ),
    },
    {
        path: '',
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
    {
        path: '**',
        pathMatch: 'full',
        loadChildren: () =>
            import('Frontend/error/error-routing.module').then(m => m.ErrorRoutingModule),
    },
];

@NgModule({
    imports: [DashboardModule, RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}

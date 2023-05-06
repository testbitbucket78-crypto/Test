import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/dashboard',
    },
    {
        path: 'dashboard',
        loadChildren: () =>
            import('Frontend/dashboard/dashboard-routing.module').then(
                m => m.DashboardRoutingModule
            ),
    },
    /*{
        path: '',
        loadChildren: () =>
            import('Frontend/auth/auth-routing.module').then(m => m.AuthRoutingModule),
    },
    */
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
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule],
})
export class AppRoutingModule {}

/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SBRouteData } from '@modules/navigation/models';

/* Module */
import { AuthModule } from './auth.module';

/* Containers */
import * as authContainers from './containers';

/* Guards */
import * as authGuards from './guards';

/* Routes */
export const ROUTES: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
    },
    {
        path: 'login',
        canActivate: [],
        component: authContainers.LoginComponent,
        data: {
            title: 'CIP - Sign In',
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
    }
];

@NgModule({
    imports: [AuthModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class AuthRoutingModule {}

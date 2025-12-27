import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { VerificationComponent } from './verification/verification.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { CreatePasswordComponent } from './create-password/create-password.component';


export const containers = [LoginComponent, RegisterComponent, ForgotPasswordComponent,ResetPasswordComponent, VerificationComponent,CreatePasswordComponent];

export * from './login/login.component';
export * from './register/register.component';
export * from './forgot-password/forgot-password.component';
export * from './verification/verification.component';
export * from './reset-password/reset-password.component';
export * from './create-password/create-password.component';


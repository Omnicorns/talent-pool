import { Routes } from '@angular/router';
import { candidateAuthGuard, completedOnboardingGuard } from './core/guard/candidate-auth.guard';
import { backofficeAuthGuard } from './core/guard/backoffice-auth.guard';
import { LandingComponent } from './features/public/landing.component';
import { CandidateAuthComponent } from './features/auth/candidate-auth.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password.component';
import { CandidatePortalComponent } from './features/candidate/candidate-portal.component';
import { TalentOnboardingComponent } from './features/candidate/talent-onboarding.component';
import { OpenPositionsComponent } from './features/public/open-positions.component';
import { BackofficeLoginComponent } from './features/backoffice/backoffice-login.component';
import { BackofficeDashboardComponent } from './features/backoffice/backoffice-dashboard.component';
import { BackofficeCandidatesComponent } from './features/backoffice/backoffice-candidates.component';
import { BackofficeJobListingsComponent } from './features/backoffice/backoffice-job-listings.component';
import { BackofficeApplicationsComponent } from './features/backoffice/backoffice-applications.component';
import { BackofficeInterviewsComponent } from './features/backoffice/backoffice-interviews.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'open-positions', component: OpenPositionsComponent },
  { path: 'sign-in', component: CandidateAuthComponent },
  { path: 'register', component: CandidateAuthComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'onboarding', component: TalentOnboardingComponent, canActivate: [candidateAuthGuard] },
  { path: 'portal', component: CandidatePortalComponent, canActivate: [completedOnboardingGuard] },
  { path: 'backoffice/login', component: BackofficeLoginComponent },
  {
    path: 'backoffice/dashboard',
    component: BackofficeDashboardComponent,
    canActivate: [backofficeAuthGuard],
  },
  {
    path: 'backoffice/candidates',
    component: BackofficeCandidatesComponent,
    canActivate: [backofficeAuthGuard],
  },
  {
    path: 'backoffice/job-listings',
    component: BackofficeJobListingsComponent,
    canActivate: [backofficeAuthGuard],
  },
  {
    path: 'backoffice/applications',
    component: BackofficeApplicationsComponent,
    canActivate: [backofficeAuthGuard],
  },
  {
    path: 'backoffice/interviews',
    component: BackofficeInterviewsComponent,
    canActivate: [backofficeAuthGuard],
  },
  { path: '**', redirectTo: '' },
];

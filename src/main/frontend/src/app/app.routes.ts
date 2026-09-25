import { Routes } from '@angular/router';
import { candidateAuthGuard } from './core/guard/candidate-auth.guard';
import { backofficeAuthGuard } from './core/guard/backoffice-auth.guard';
import { LandingComponent } from './features/public/landing.component';
import { CandidateAuthComponent } from './features/auth/candidate-auth.component';
import { CandidatePortalComponent } from './features/candidate/candidate-portal.component';
import { OpenPositionsComponent } from './features/public/open-positions.component';
import { BackofficeLoginComponent } from './features/backoffice/backoffice-login.component';
import { BackofficeDashboardComponent } from './features/backoffice/backoffice-dashboard.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'open-positions', component: OpenPositionsComponent },
  { path: 'sign-in', component: CandidateAuthComponent },
  { path: 'register', component: CandidateAuthComponent },
  { path: 'portal', component: CandidatePortalComponent, canActivate: [candidateAuthGuard] },
  { path: 'backoffice/login', component: BackofficeLoginComponent },
  {
    path: 'backoffice/dashboard',
    component: BackofficeDashboardComponent,
    canActivate: [backofficeAuthGuard],
  },
  { path: '**', redirectTo: '' },
];

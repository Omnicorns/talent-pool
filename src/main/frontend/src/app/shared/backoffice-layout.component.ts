import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BackofficeAuthService } from '../core/service/api/backoffice-auth.service';

@Component({
  selector: 'app-backoffice-layout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bo-shell">
      <aside class="bo-sidebar">
        <div class="bo-brand">
          <img src="images/sarinah.png" alt="Sarinah">
          <div>
            <strong>Talent Management</strong>
            <span>Back Office</span>
          </div>
        </div>

        <nav class="bo-nav">
          <a routerLink="/backoffice/dashboard" [class.active]="active === 'dashboard'">
            <span>▦</span><b>Dashboard</b>
          </a>
          <a routerLink="/backoffice/candidates" [class.active]="active === 'candidates'">
            <span>👥</span><b>Candidates</b>
          </a>
          <a routerLink="/backoffice/job-listings" [class.active]="active === 'jobs'">
            <span>▤</span><b>Job Listings</b>
          </a>
          <a routerLink="/backoffice/applications" [class.active]="active === 'applications'">
            <span>✓</span><b>Applications</b>
          </a>
        </nav>

        <div class="bo-sidebar-footer">
          <a routerLink="/" class="bo-portal-link">← Portal Kandidat</a>
          <button class="logout" (click)="auth.logout()">Keluar</button>
        </div>
      </aside>

      <main class="bo-content">
        <ng-content />
      </main>
    </div>
  `,
})
export class BackofficeLayoutComponent {
  @Input() active: 'dashboard' | 'candidates' | 'jobs' | 'applications' = 'dashboard';
  constructor(public auth: BackofficeAuthService) {}
}

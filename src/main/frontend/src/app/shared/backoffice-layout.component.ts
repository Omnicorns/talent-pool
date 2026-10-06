import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BackofficeAuthService } from '../core/service/api/backoffice-auth.service';
import { BackofficeOverlayDirective } from './backoffice-overlay.directive';

@Component({
  selector: 'app-backoffice-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, BackofficeOverlayDirective],
  template: `
    <div class="bo-shell">
      <header class="bo-mobile-header">
        <div class="bo-mobile-brand">
          <img src="images/sarinah.png" alt="Sarinah">
          <div>
            <strong>{{ pageTitle }}</strong>
            <span>Talent Management</span>
          </div>
        </div>
        <button
          type="button"
          class="bo-mobile-menu-button"
          (click)="mobileMenuOpen = true"
          [attr.aria-expanded]="mobileMenuOpen"
          aria-controls="backoffice-navigation"
          aria-label="Buka menu Back Office">
          <span></span><span></span><span></span>
        </button>
      </header>

      <div
        class="bo-mobile-overlay"
        *ngIf="mobileMenuOpen"
        (click)="mobileMenuOpen = false">
      </div>

      <aside id="backoffice-navigation" class="bo-sidebar" [class.mobile-open]="mobileMenuOpen"
        [boOverlay]="mobileMenuOpen" (overlayClose)="mobileMenuOpen = false"
        [attr.inert]="isMobile && !mobileMenuOpen ? '' : null" aria-label="Menu Back Office">
        <div class="bo-brand">
          <img src="images/sarinah.png" alt="Sarinah">
          <div>
            <strong>Talent Management</strong>
            <span>Back Office</span>
          </div>
          <button
            type="button"
            class="bo-sidebar-close"
            (click)="mobileMenuOpen = false"
            aria-label="Tutup menu">×</button>
        </div>

        <nav class="bo-nav" aria-label="Navigasi Back Office">
          <a routerLink="/backoffice/dashboard" [class.active]="active === 'dashboard'" (click)="mobileMenuOpen = false">
            <span>▦</span><b>Dashboard</b>
          </a>
          <a routerLink="/backoffice/candidates" [class.active]="active === 'candidates'" (click)="mobileMenuOpen = false">
            <span>◉</span><b>Candidates</b>
          </a>
          <a routerLink="/backoffice/job-listings" [class.active]="active === 'jobs'" (click)="mobileMenuOpen = false">
            <span>▤</span><b>Job Listings</b>
          </a>
          <a routerLink="/backoffice/applications" [class.active]="active === 'applications'" (click)="mobileMenuOpen = false">
            <span>✓</span><b>Applications</b>
          </a>
          <a routerLink="/backoffice/interviews" [class.active]="active === 'interviews'" (click)="mobileMenuOpen = false">
            <span>◷</span><b>Interviews</b>
          </a>
        </nav>

        <div class="bo-sidebar-footer">
          <a routerLink="/" class="bo-portal-link" (click)="mobileMenuOpen = false">← Portal Kandidat</a>
          <button class="logout" (click)="auth.logout()">Keluar</button>
        </div>
      </aside>

      <main class="bo-content" [attr.inert]="mobileMenuOpen ? '' : null">
        <ng-content />
      </main>
    </div>
  `,
})
export class BackofficeLayoutComponent {
  @Input() active: 'dashboard' | 'candidates' | 'jobs' | 'applications' | 'interviews' = 'dashboard';
  mobileMenuOpen = false;
  isMobile = window.innerWidth <= 1024;

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth <= 1024;
    if (!this.isMobile) this.mobileMenuOpen = false;
  }

  constructor(public auth: BackofficeAuthService) {}

  get pageTitle(): string {
    const labels = {
      dashboard: 'Dashboard',
      candidates: 'Candidates',
      jobs: 'Job Listings',
      applications: 'Applications',
      interviews: 'Interviews',
    };
    return labels[this.active];
  }
}

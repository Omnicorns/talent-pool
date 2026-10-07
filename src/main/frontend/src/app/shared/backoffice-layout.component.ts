import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BackofficeAuthService } from '../core/service/api/backoffice-auth.service';
import { BackofficeOverlayDirective } from './backoffice-overlay.directive';
import { IconComponent } from './icon.component';

type Section = 'dashboard' | 'candidates' | 'jobs' | 'applications' | 'interviews';

@Component({
  selector: 'app-backoffice-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, BackofficeOverlayDirective, IconComponent],
  template: `
    <div class="bo">
      <header class="bo-topbar">
        <button type="button" class="icon-btn" (click)="mobileMenuOpen = true" [attr.aria-expanded]="mobileMenuOpen"
          aria-controls="backoffice-navigation" aria-label="Buka menu">
          <app-icon name="menu" [size]="22"></app-icon>
        </button>
        <strong>{{ pageTitle }}</strong>
        <img src="images/sarinah.png" alt="Sarinah">
      </header>

      <div class="bo-scrim" *ngIf="mobileMenuOpen" (click)="mobileMenuOpen = false"></div>

      <aside id="backoffice-navigation" class="bo-sidebar" [class.open]="mobileMenuOpen"
        [boOverlay]="mobileMenuOpen" (overlayClose)="mobileMenuOpen = false"
        [attr.inert]="isMobile && !mobileMenuOpen ? '' : null" aria-label="Menu back office">
        <div class="bo-brand">
          <img src="images/sarinah.png" alt="Sarinah">
          <span>Human<br>Capital</span>
          <button type="button" class="icon-btn" (click)="mobileMenuOpen = false" aria-label="Tutup menu"><app-icon name="x"></app-icon></button>
        </div>

        <nav class="bo-nav" aria-label="Navigasi back office">
          <a *ngFor="let item of nav" [routerLink]="item.link" [class.active]="active === item.id"
            [attr.aria-current]="active === item.id ? 'page' : null" (click)="mobileMenuOpen = false">
            <app-icon [name]="item.icon"></app-icon>{{ item.label }}
          </a>
        </nav>

        <div class="bo-sidebar-foot">
          <a routerLink="/" (click)="mobileMenuOpen = false"><app-icon name="globe"></app-icon>Lihat portal kandidat</a>
          <button type="button" (click)="auth.logout()"><app-icon name="logout"></app-icon>Keluar</button>
        </div>
      </aside>

      <main class="bo-main" [attr.inert]="mobileMenuOpen ? '' : null">
        <ng-content />
      </main>
    </div>
  `,
})
export class BackofficeLayoutComponent {
  @Input() active: Section = 'dashboard';
  mobileMenuOpen = false;
  isMobile = window.innerWidth <= 1024;

  readonly nav: Array<{ id: Section; label: string; icon: string; link: string }> = [
    { id: 'dashboard', label: 'Ringkasan', icon: 'dashboard', link: '/backoffice/dashboard' },
    { id: 'candidates', label: 'Kandidat', icon: 'users', link: '/backoffice/candidates' },
    { id: 'jobs', label: 'Lowongan', icon: 'briefcase', link: '/backoffice/job-listings' },
    { id: 'applications', label: 'Lamaran', icon: 'clipboard', link: '/backoffice/applications' },
    { id: 'interviews', label: 'Interview', icon: 'calendar', link: '/backoffice/interviews' },
  ];

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth <= 1024;
    if (!this.isMobile) this.mobileMenuOpen = false;
  }

  constructor(public auth: BackofficeAuthService) {}

  get pageTitle(): string {
    return this.nav.find((item) => item.id === this.active)?.label || '';
  }
}

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TalentAuthService } from '../core/service/api/talent-auth.service';

@Component({
  selector: 'app-career-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="career-header" [class.is-authenticated]="auth.authenticated">
      <a routerLink="/" class="career-brand-link" aria-label="Sarinah Career Home">
        <img class="danantara-logo" src="images/Danantara_Indonesia.png" alt="Danantara Indonesia">
      </a>

      <button
        type="button"
        class="mobile-menu-toggle"
        (click)="mobileMenuOpen = !mobileMenuOpen"
        [attr.aria-expanded]="mobileMenuOpen"
        aria-controls="career-navigation"
        aria-label="Buka menu navigasi">
        <span></span><span></span><span></span>
      </button>

      <nav id="career-navigation" class="career-main-nav" [class.mobile-open]="mobileMenuOpen" aria-label="Navigasi utama">
        <a routerLink="/" [class.active]="active === 'home' && sectionActive === ''" (click)="mobileMenuOpen = false">Home</a>
        <button type="button" class="career-nav-button" [class.active]="sectionActive === 'life'" (click)="goToSection('life'); mobileMenuOpen = false">Life at Sarinah</button>
        <button type="button" class="career-nav-button" [class.active]="active === 'open' || sectionActive === 'open-positions'" (click)="goToSection('open-positions'); mobileMenuOpen = false">Open Positions</button>
        <button type="button" class="career-nav-button" [class.active]="sectionActive === 'faq'" (click)="goToSection('faq'); mobileMenuOpen = false">FAQ</button>
      </nav>

      <div class="career-header-right">
        <ng-container *ngIf="!auth.authenticated; else loggedIn">
          <div class="career-auth-actions">
            <a class="career-sign-in" routerLink="/sign-in" (click)="mobileMenuOpen = false">Masuk</a>
          </div>
        </ng-container>

        <ng-template #loggedIn>
          <a routerLink="/portal" class="header-user-chip" [class.active]="active === 'portal'" aria-label="Buka profil saya" title="Profil Saya" (click)="mobileMenuOpen = false">
            <span class="header-user-avatar">
              <img *ngIf="profilePictureUrl; else headerInitials" [src]="profilePictureUrl" [alt]="'Foto ' + (auth.session?.fullName || 'Talent')">
              <ng-template #headerInitials>{{ userInitials }}</ng-template>
            </span>
            <span class="header-user-copy">
              <strong>{{ auth.session?.fullName || 'Talent' }}</strong>
              <small>Profil Saya</small>
            </span>
          </a>
          <button type="button" class="text-button header-logout" (click)="auth.logout()">Keluar</button>
        </ng-template>

        <a routerLink="/" class="career-brand-link sarinah-brand-link" aria-label="Sarinah Home">
          <img class="sarinah-logo" src="images/sarinah.png" alt="Sarinah">
        </a>
      </div>
    </header>
  `,
})
export class CareerHeaderComponent {
  @Input() active: 'home' | 'open' | 'portal' | '' = '';
  @Input() profilePictureUrl: string | null = null;
  mobileMenuOpen = false;

  constructor(public auth: TalentAuthService, private router: Router) {}

  get sectionActive(): string {
    return this.router.parseUrl(this.router.url).fragment || '';
  }

  goToSection(section: 'life' | 'open-positions' | 'faq'): void {
    this.router.navigate(['/'], { fragment: section }).then(() => {
      // Also scroll when the user selects the current fragment again.
      setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 40);
    });
  }

  get userInitials(): string {
    const name = this.auth.session?.fullName || 'Talent';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
}

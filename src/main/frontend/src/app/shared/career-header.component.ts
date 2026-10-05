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
        <a routerLink="/" [class.active]="active === 'home' && sectionActive === ''" (click)="sectionActive = ''; mobileMenuOpen = false">Home</a>
        <button type="button" class="career-nav-button" [class.active]="sectionActive === 'life'" (click)="goToSection('life'); mobileMenuOpen = false">Life at Sarinah</button>
        <a routerLink="/open-positions" [class.active]="active === 'open'" (click)="mobileMenuOpen = false">Open Positions</a>
        <button type="button" class="career-nav-button" [class.active]="sectionActive === 'faq'" (click)="goToSection('faq'); mobileMenuOpen = false">FAQ</button>
      </nav>

      <div class="career-header-right">
        <ng-container *ngIf="!auth.authenticated; else loggedIn">
          <div class="career-auth-actions">
            <a class="join-talent-button" routerLink="/register" (click)="mobileMenuOpen = false">Gabung Talent Pool</a>
            <a class="career-sign-in" routerLink="/sign-in" (click)="mobileMenuOpen = false">Masuk</a>
          </div>
        </ng-container>

        <ng-template #loggedIn>
          <a routerLink="/portal" class="header-user-chip" [class.active]="active === 'portal'" aria-label="Buka profil saya" title="Profil Saya" (click)="mobileMenuOpen = false">
            <span class="header-user-avatar">{{ userInitials }}</span>
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
  sectionActive: 'life' | 'faq' | '' = '';
  mobileMenuOpen = false;

  constructor(public auth: TalentAuthService, private router: Router) {}

  goToSection(section: 'life' | 'faq'): void {
    this.sectionActive = section;

    const scroll = () => {
      setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 40);
    };

    if (this.router.url.startsWith('/') &&
        !this.router.url.startsWith('/open-positions') &&
        !this.router.url.startsWith('/portal') &&
        !this.router.url.startsWith('/backoffice') &&
        !this.router.url.startsWith('/sign-in') &&
        !this.router.url.startsWith('/register') &&
        !this.router.url.startsWith('/onboarding')) {
      this.router.navigate([], { fragment: section, replaceUrl: false }).then(scroll);
      return;
    }

    this.router.navigate(['/'], { fragment: section }).then(scroll);
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

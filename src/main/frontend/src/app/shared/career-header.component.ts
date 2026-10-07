import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TalentAuthService } from '../core/service/api/talent-auth.service';

@Component({
  selector: 'app-career-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="career-header" [class.is-authenticated]="auth.authenticated" [class.portal-reference-header]="active === 'portal'">
      <ng-container *ngIf="active === 'portal'; else standardCareerHeader">
        <a routerLink="/portal" class="talent-portal-brand" aria-label="Talent Pool"><span>T</span>Talent Pool</a>
        <nav class="talent-portal-nav" aria-label="Navigasi profil talent">
          <a routerLink="/open-positions">Lowongan</a>
          <button type="button" (click)="goToPortalSection('my-applications')">Lamaran Saya</button>
          <button type="button" class="active" (click)="goToPortalSection('about')">Profil</button>
        </nav>
      </ng-container>
      <ng-template #standardCareerHeader>
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
          <div class="header-account-menu" [class.is-open]="accountMenuOpen">
          <button type="button" class="header-user-chip" [class.active]="active === 'portal' || accountMenuOpen"
            [attr.aria-expanded]="accountMenuOpen" aria-haspopup="menu" aria-label="Buka menu akun"
            (click)="toggleAccountMenu(); mobileMenuOpen = false">
            <span class="header-user-avatar">
              <img *ngIf="profilePictureUrl; else headerInitials" [src]="profilePictureUrl" [alt]="'Foto ' + (auth.session?.fullName || 'Talent')">
              <ng-template #headerInitials>{{ userInitials }}</ng-template>
            </span>
            <span class="header-user-copy">
              <strong>{{ auth.session?.fullName || 'Talent' }}</strong>
              <small>Profil Saya</small>
            </span>
            <span class="header-account-chevron" aria-hidden="true"></span>
          </button>
          <div class="header-account-dropdown" *ngIf="accountMenuOpen" role="menu" aria-label="Menu akun">
            <div class="header-account-summary">
              <span class="header-account-avatar">
                <img *ngIf="profilePictureUrl; else dropdownInitials" [src]="profilePictureUrl" [alt]="'Foto ' + (auth.session?.fullName || 'Talent')">
                <ng-template #dropdownInitials>{{ userInitials }}</ng-template>
              </span>
              <span class="header-account-identity">
                <strong>{{ auth.session?.fullName || 'Talent' }}</strong>
                <small>{{ auth.session?.email }}</small>
              </span>
            </div>
            <a routerLink="/portal" role="menuitem" class="header-account-item" (click)="accountMenuOpen = false">
              <span class="header-account-profile-icon" aria-hidden="true">◉</span> Profil Saya
            </a>
            <button type="button" role="menuitem" class="header-account-item is-logout" (click)="logout()">
              <span class="header-account-logout-icon" aria-hidden="true">↪</span> Keluar
            </button>
          </div>
          </div>
        </ng-template>

        <a routerLink="/" class="career-brand-link sarinah-brand-link" aria-label="Sarinah Home">
          <img class="sarinah-logo" src="images/sarinah.png" alt="Sarinah">
        </a>
      </div>
      </ng-template>
    </header>
  `,
})
export class CareerHeaderComponent {
  @Input() active: 'home' | 'open' | 'portal' | '' = '';
  @Input() profilePictureUrl: string | null = null;
  mobileMenuOpen = false;
  accountMenuOpen = false;

  constructor(public auth: TalentAuthService, private router: Router, private elementRef: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event'])
  closeAccountMenuOnOutsideClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) this.accountMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  closeAccountMenuOnEscape(): void { this.accountMenuOpen = false; }

  toggleAccountMenu(): void { this.accountMenuOpen = !this.accountMenuOpen; }

  logout(): void {
    this.accountMenuOpen = false;
    this.auth.logout();
  }

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

  goToPortalSection(section: 'about' | 'my-applications'): void {
    this.router.navigate(['/portal'], { fragment: section }).then(() => {
      setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
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

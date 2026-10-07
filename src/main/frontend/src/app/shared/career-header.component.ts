import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TalentAuthService } from '../core/service/api/talent-auth.service';
import { IconComponent } from './icon.component';
import { initials } from './labels';

@Component({
  selector: 'app-career-header',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <header class="site-header">
      <div class="container">
        <a routerLink="/" class="site-brand" aria-label="Beranda Sarinah Karier">
          <img src="images/Danantara_Indonesia.png" alt="Danantara Indonesia">
        </a>

        <nav id="site-navigation" class="site-nav" [class.open]="mobileMenuOpen" aria-label="Navigasi utama">
          <a routerLink="/" [class.active]="active === 'home' && sectionActive === ''" (click)="mobileMenuOpen = false">Home</a>
          <button type="button" [class.active]="sectionActive === 'life'" (click)="goToSection('life')">Life at Sarinah</button>
          <button type="button" [class.active]="active === 'open' || sectionActive === 'open-positions'" (click)="goToSection('open-positions')">Open Positions</button>
          <button type="button" [class.active]="sectionActive === 'faq'" (click)="goToSection('faq')">FAQ</button>
        </nav>

        <div class="site-actions">
          <a *ngIf="!auth.authenticated" class="btn btn-secondary btn-sm" routerLink="/sign-in">Masuk</a>

          <div class="account" *ngIf="auth.authenticated">
            <button type="button" class="account-chip" [attr.aria-expanded]="accountMenuOpen" aria-haspopup="menu"
              aria-label="Menu akun" (click)="toggleAccountMenu(); mobileMenuOpen = false">
              <span class="avatar">
                <img *ngIf="profilePictureUrl; else headerInitials" [src]="profilePictureUrl" alt="">
                <ng-template #headerInitials>{{ userInitials }}</ng-template>
              </span>
              <strong>{{ auth.session?.fullName || 'Talent' }}</strong>
              <app-icon name="chevron-down" [size]="16"></app-icon>
            </button>
            <div class="menu-pop" *ngIf="accountMenuOpen" role="menu">
              <div class="menu-pop-head">
                <strong>{{ auth.session?.fullName || 'Talent' }}</strong>
                <small>{{ auth.session?.email }}</small>
              </div>
              <a routerLink="/portal" role="menuitem" class="menu-item" (click)="accountMenuOpen = false">
                <app-icon name="users"></app-icon> Profil saya
              </a>
              <a routerLink="/portal" fragment="my-applications" role="menuitem" class="menu-item" (click)="accountMenuOpen = false">
                <app-icon name="clipboard"></app-icon> Lamaran saya
              </a>
              <button type="button" role="menuitem" class="menu-item danger" (click)="logout()">
                <app-icon name="logout"></app-icon> Keluar
              </button>
            </div>
          </div>

          <a routerLink="/" aria-label="Sarinah" class="site-brand">
            <img class="sarinah-mark" src="images/sarinah.png" alt="Sarinah">
          </a>

          <button type="button" class="icon-btn menu-toggle" (click)="mobileMenuOpen = !mobileMenuOpen"
            [attr.aria-expanded]="mobileMenuOpen" aria-controls="site-navigation"
            [attr.aria-label]="mobileMenuOpen ? 'Tutup menu' : 'Buka menu'">
            <app-icon [name]="mobileMenuOpen ? 'x' : 'menu'" [size]="22"></app-icon>
          </button>
        </div>
      </div>
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
  closeMenusOnOutsideClick(event: MouseEvent): void {
    // composedPath still holds the clicked node even if the click re-rendered it (e.g. the menu icon swap).
    if (!event.composedPath().includes(this.elementRef.nativeElement)) {
      this.accountMenuOpen = false;
      this.mobileMenuOpen = false;
    }
  }
  @HostListener('document:keydown.escape')
  closeMenusOnEscape(): void { this.accountMenuOpen = false; this.mobileMenuOpen = false; }
  toggleAccountMenu(): void { this.accountMenuOpen = !this.accountMenuOpen; }
  logout(): void { this.accountMenuOpen = false; this.auth.logout(); }

  get sectionActive(): string {
    return this.router.parseUrl(this.router.url).fragment || '';
  }

  goToSection(section: 'life' | 'open-positions' | 'faq'): void {
    this.mobileMenuOpen = false;
    this.router.navigate(['/'], { fragment: section }).then(() => {
      // Also scroll when the user selects the current fragment again.
      setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
    });
  }

  get userInitials(): string {
    return initials(this.auth.session?.fullName);
  }
}

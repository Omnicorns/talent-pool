import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TalentAuthService } from '../core/service/api/talent-auth.service';

@Component({
  selector: 'app-career-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="career-header">
      <a routerLink="/" class="career-brand-link" aria-label="Sarinah Career Home">
        <img class="danantara-logo" src="images/Danantara_Indonesia.png" alt="Danantara Indonesia">
      </a>

      <nav class="career-main-nav" aria-label="Navigasi utama">
        <a routerLink="/" [class.active]="active === 'home'">Home</a>
        <a routerLink="/" fragment="life">Life at Sarinah</a>
        <a routerLink="/open-positions" [class.active]="active === 'open'">Open Positions</a>
        <a routerLink="/" fragment="faq">FAQ</a>
        <a
          *ngIf="auth.authenticated"
          routerLink="/portal"
          class="talent-pool-nav"
          [class.active]="active === 'portal'"
        >
          Talent Pool
        </a>
      </nav>

      <div class="career-header-right">
        <ng-container *ngIf="!auth.authenticated; else loggedIn">
          <a class="join-talent-button" routerLink="/register">Gabung Talent Pool</a>
          <a class="outline-link" routerLink="/sign-in">Masuk</a>
        </ng-container>

        <ng-template #loggedIn>
          <a routerLink="/portal" class="header-user-chip">
            <span class="header-user-avatar">{{ userInitials }}</span>
            <span class="header-user-copy">
              <strong>{{ auth.session?.fullName || 'Talent' }}</strong>
              <small>Talent Pool</small>
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

  constructor(public auth: TalentAuthService) {}

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

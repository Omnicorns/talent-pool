import { Component } from '@angular/core';
import { BackofficeAuthService } from '../../core/service/api/backoffice-auth.service';
import { SiteContentService } from '../../core/service/api/site-content.service';
import { ExecutiveSummaryContentComponent } from '../../shared/executive-summary-content.component';
import { DEFAULT_BRAND_LOGO } from '../public/site-defaults';

/** Ringkasan khusus pimpinan: hanya baca, tanpa menu kerja recruiter. */
@Component({
  selector: 'app-backoffice-executive-summary',
  imports: [ExecutiveSummaryContentComponent],
  template: `
    <div class="es">
      <header class="es-top">
        <img [src]="brandLogo" alt="Sarinah">
        <button type="button" class="es-logout" (click)="auth.logout()">Keluar</button>
      </header>

      <main class="es-main">
        <app-executive-summary-content />
      </main>
    </div>
  `,
  styles: [`
    .es { min-height: 100vh; background: #faf7f6; color: #2b2523; font-family: inherit; }
    .es-top { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; }
    .es-top img { height: 44px; width: auto; }
    .es-logout { border: 1px solid #d9cfcb; background: #fff; border-radius: 999px; padding: 8px 18px; cursor: pointer; font: inherit; }
    .es-main { max-width: 1200px; margin: 0 auto; padding: 8px 24px 40px; }
  `],
})
export class BackofficeExecutiveSummaryComponent {
  brandLogo = DEFAULT_BRAND_LOGO;

  constructor(readonly auth: BackofficeAuthService, site: SiteContentService) {
    site.branding().subscribe((branding) => (this.brandLogo = branding.brandLogo));
  }
}

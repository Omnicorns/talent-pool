import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Branding, DEFAULT_BRANDING, SiteContentService } from '../core/service/api/site-content.service';

@Component({
  selector: 'app-career-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="site-footer">
      <div class="container">
        <div>
          <a routerLink="/" aria-label="Beranda Sarinah Karier"><img [src]="b.brandLogo" alt="Sarinah"></a>
          <p>{{ b.footer.description }}</p>
        </div>
        <nav aria-label="Tautan">
          <h2>{{ b.footer.exploreTitle }}</h2>
          <a routerLink="/">{{ b.header.navHome }}</a>
          <a routerLink="/" fragment="life">{{ b.header.navLife }}</a>
          <a routerLink="/" fragment="open-positions">{{ b.header.navOpen }}</a>
          <a routerLink="/" fragment="faq">{{ b.header.navFaq }}</a>
        </nav>
        <div>
          <h2>{{ b.footer.contactTitle }}</h2>
          <address>
            <span *ngIf="b.footer.company">{{ b.footer.company }}</span>
            <span *ngIf="b.footer.address">{{ b.footer.address }}</span>
            <a *ngIf="b.footer.phone" [href]="'tel:' + phoneHref">{{ b.footer.phone }}</a>
            <a *ngIf="b.footer.email" [href]="'mailto:' + b.footer.email">{{ b.footer.email }}</a>
          </address>
        </div>
      </div>
      <div class="site-footer-bottom">
        <div class="container">
          <span>© {{ year }} {{ b.footer.copyright }}</span>
          <span>{{ b.footer.tagline }}</span>
        </div>
      </div>
    </footer>
  `,
})
export class CareerFooterComponent {
  readonly year = new Date().getFullYear();
  b: Branding = DEFAULT_BRANDING;

  constructor(site: SiteContentService) {
    site.branding().subscribe((branding) => (this.b = branding));
  }

  get phoneHref(): string {
    return (this.b.footer.phone || '').replace(/[^\d+]/g, '');
  }
}

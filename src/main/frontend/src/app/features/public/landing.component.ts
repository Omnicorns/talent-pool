import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CareerHeaderComponent } from '../../shared/career-header.component';
import { CareerFooterComponent } from '../../shared/career-footer.component';
import { IconComponent } from '../../shared/icon.component';
import { OpenPositionsComponent } from './open-positions.component';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';
import { LifeSliderComponent } from './life-slider.component';
import { LIFE_SLIDE_SECONDS } from './life-at-sarinah.config';
import { LandingData, SiteContentService } from '../../core/service/api/site-content.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, CareerHeaderComponent, CareerFooterComponent, OpenPositionsComponent, IconComponent, LifeSliderComponent],
  template: `
    <div class="site">
      <app-career-header active="home"></app-career-header>

      <main *ngIf="site">
        <section class="hero" aria-labelledby="hero-title">
          <svg class="hero-motif" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
            <g fill="currentColor"><path *ngFor="let angle of petals" d="M50 50C36 36 36 13 50 4c14 9 14 32 0 46Z" [attr.transform]="'rotate(' + angle + ' 50 50)'"></path></g>
          </svg>
          <div class="hero-copy">
            <h1 id="hero-title">{{ site.hero.title }}</h1>
            <p>{{ site.hero.subtitle }}</p>
            <div class="hero-actions">
              <a routerLink="/" fragment="open-positions" class="btn btn-primary btn-lg">{{ site.hero.primaryCta }} <app-icon name="arrow-up-right" [size]="16"></app-icon></a>
              <a [routerLink]="talentPoolLink" class="btn btn-secondary btn-lg">{{ site.hero.secondaryCta }}</a>
            </div>
          </div>
          <div class="hero-media">
            <img [src]="site.heroImages[0]" width="611" height="462"
              [alt]="heroAlt" fetchpriority="high">
          </div>
        </section>

        <section class="values" aria-label="Alasan bergabung dengan Sarinah">
          <div class="container">
            <div class="values-card">
              <article class="value" *ngFor="let item of site.values">
                <app-icon [name]="item.icon" [size]="28" [stroke]="1.6"></app-icon>
                <h2>{{ item.title }}</h2>
                <p>{{ item.text }}</p>
              </article>
            </div>
          </div>
        </section>

        <section id="life" class="life" aria-labelledby="life-title">
          <div class="life-banner">
            <div class="container">
              <p class="eyebrow">{{ site.lifeHeading.eyebrow }}</p>
              <h2 id="life-title">{{ site.lifeHeading.title }}</h2>
              <p class="life-tagline">{{ site.lifeHeading.tagline }}</p>
              <p class="life-lead">{{ site.lifeHeading.lead }}</p>
            </div>
          </div>
          <div class="container">
            <div class="life-panel">
              <ul class="life-grid">
                <li class="life-card" *ngFor="let program of site.programs">
                  <app-life-slider [images]="program.images" [alt]="program.title" [seconds]="slideSeconds"></app-life-slider>
                  <div class="life-caption"><h3>{{ program.title }}</h3><p>{{ program.description }}</p></div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="open-positions" class="section alt" aria-labelledby="positions-title">
          <div class="container">
            <app-open-positions></app-open-positions>
          </div>
        </section>

        <section id="faq" class="section">
          <div class="container">
            <div class="section-head">
              <h2>Pertanyaan yang sering diajukan</h2>
            </div>
            <div class="faq">
              <details *ngFor="let item of site.faqs; let first = first" [open]="first">
                <summary>{{ item.q }} <app-icon name="chevron-down" [size]="20"></app-icon></summary>
                <p>{{ item.a }}</p>
              </details>
            </div>
          </div>
        </section>
      </main>
      <app-career-footer *ngIf="site"></app-career-footer>
    </div>
  `,
})
export class LandingComponent {
  readonly petals = [0, 45, 90, 135, 180, 225, 270, 315];

  site: LandingData | null = null;
  readonly slideSeconds = LIFE_SLIDE_SECONDS;

  constructor(private auth: TalentAuthService, content: SiteContentService) {
    content.landing().subscribe((site) => this.site = site);
  }

  get heroAlt(): string {
    return this.site?.heroImages[0].startsWith('assets/') ? 'Dua karyawan Sarinah berbusana tenun dan batik bekerja bersama di depan laptop' : 'Sarinah';
  }

  get talentPoolLink(): string {
    if (!this.auth.authenticated) return '/register';
    return this.auth.session?.onboardingCompleted === false ? '/onboarding' : '/portal';
  }
}

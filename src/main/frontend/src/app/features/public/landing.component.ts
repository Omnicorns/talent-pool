import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CareerHeaderComponent } from '../../shared/career-header.component';
import { CareerFooterComponent } from '../../shared/career-footer.component';
import { IconComponent } from '../../shared/icon.component';
import { OpenPositionsComponent } from './open-positions.component';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';
import { LifeCarouselComponent } from './life-carousel.component';
import { LIFE_SLIDE_SECONDS } from './life-at-sarinah.config';
import { LandingData, SiteContentService } from '../../core/service/api/site-content.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, CareerHeaderComponent, CareerFooterComponent, OpenPositionsComponent, IconComponent, LifeCarouselComponent],
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
                <span class="value-icon"><app-icon [name]="item.icon" [size]="24" [stroke]="1.7"></app-icon></span>
                <h2>{{ item.title }}</h2>
                <p>{{ item.text }}</p>
              </article>
            </div>
          </div>
        </section>

        <section id="how" class="how" aria-labelledby="how-title">
          <div class="container">
            <div class="section-head center">
              <span class="eyebrow-red">Cara bergabung</span>
              <h2 id="how-title">Mulai karier Anda dalam 3 langkah</h2>
              <p>Proses pendaftaran dibuat singkat, dan Anda bisa memantau setiap perkembangannya dari akun Anda.</p>
            </div>
            <ol class="how-steps">
              <li *ngFor="let step of steps; let i = index">
                <span class="how-num">{{ i + 1 }}</span>
                <h3>{{ step.title }}</h3>
                <p>{{ step.text }}</p>
              </li>
            </ol>
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
            <div class="life-panel life-panel-carousel">
              <app-life-carousel [programs]="site.programs" [seconds]="slideSeconds"></app-life-carousel>
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
            <div class="faq-layout">
              <div class="faq-intro">
                <span class="eyebrow-red">FAQ</span>
                <h2>Pertanyaan yang sering diajukan</h2>
                <p>Belum menemukan jawaban yang Anda cari? Tim Human Capital siap membantu lewat kontak di bagian bawah halaman ini.</p>
                <a [routerLink]="talentPoolLink" class="btn btn-primary">{{ site.hero.secondaryCta }}</a>
              </div>
              <div class="faq">
                <details *ngFor="let item of site.faqs; let first = first" [open]="first">
                  <summary>{{ item.q }} <app-icon name="chevron-down" [size]="20"></app-icon></summary>
                  <p>{{ item.a }}</p>
                </details>
              </div>
            </div>
          </div>
        </section>
      </main>
      <app-career-footer *ngIf="site"></app-career-footer>
    </div>
  `,
})
export class LandingComponent {
  readonly steps = [
    { title: 'Buat akun', text: 'Daftar dengan email aktif, lalu verifikasi akun Anda.' },
    { title: 'Lengkapi profil', text: 'Isi data diri, pendidikan, pengalaman kerja, dan unggah CV terbaru.' },
    { title: 'Lamar dan pantau', text: 'Lamar lowongan yang sesuai dan pantau statusnya langsung dari portal.' },
  ];
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

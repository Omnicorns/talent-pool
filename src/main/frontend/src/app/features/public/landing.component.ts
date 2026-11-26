import { AfterViewInit, Component, ElementRef, OnDestroy, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CareerHeaderComponent } from '../../shared/career-header.component';
import { CareerFooterComponent } from '../../shared/career-footer.component';
import { IconComponent } from '../../shared/icon.component';
import { OpenPositionsComponent } from './open-positions.component';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';
import { LifeCarouselComponent } from './life-carousel.component';
import { LIFE_SLIDE_SECONDS } from './life-at-sarinah.config';
import { LandingData, SiteContentService } from '../../core/service/api/site-content.service';

/**
 * Landing page bergaya editorial/sinematik: foto penuh, huruf serif miring + mono ala metadata film,
 * kartu kaca, pita teks berjalan, dan animasi muncul saat di-scroll (dimatikan bila pengguna memilih
 * reduced motion). Semua teks utama tetap berasal dari isi landing di back office.
 */
@Component({
    selector: 'app-landing',
    imports: [RouterLink, CareerHeaderComponent, CareerFooterComponent, OpenPositionsComponent, IconComponent, LifeCarouselComponent],
    encapsulation: ViewEncapsulation.None,
    template: `
    <div class="site lp" [class.lp-anim]="animate">
      <app-career-header active="home"></app-career-header>

      @if (site) {
        <main>
          <!-- HERO -->
          <section class="lp-hero" aria-labelledby="hero-title">
            <div class="lp-hero-media" aria-hidden="true">
              <img [src]="site.heroImages[0]" alt="" fetchpriority="high">
            </div>
            <div class="lp-grain" aria-hidden="true"></div>

            <div class="lp-hero-meta lp-mono" aria-hidden="true">
              <span>Sarinah / Talent Pool — Nº 01</span>
              <span class="lp-hide-sm">06°11′S · 106°49′E · Jakarta</span>
            </div>

            <div class="container lp-hero-inner">
              <div class="lp-hero-copy">
                <p class="lp-chip"><i></i>Rekrutmen dibuka · {{ year }}</p>
                <h1 id="hero-title">{{ titleHead }} <em>{{ titleTail }}</em></h1>
                <p class="lp-hero-sub">{{ site.hero.subtitle }}</p>
                <div class="lp-actions">
                  <a routerLink="/" fragment="open-positions" class="lp-btn lp-btn-red">{{ site.hero.primaryCta }} <app-icon name="arrow-up-right" [size]="16"></app-icon></a>
                  <a [routerLink]="talentPoolLink" class="lp-btn lp-btn-glass">{{ site.hero.secondaryCta }}</a>
                </div>
              </div>

              <aside class="lp-index" aria-label="Ringkasan Talent Pool">
                <div class="lp-index-head">
                  <span class="lp-mono">Index · Talent Pool</span>
                  <span class="lp-mono">{{ year }}</span>
                </div>
                <h2>Talent Pool, <em>{{ year }}</em></h2>
                <p>Satu profil untuk semua peluang karier di Sarinah — tanpa perlu mengirim ulang CV.</p>
                <dl>
                  <div><dt class="lp-mono">Proses</dt><dd>3 langkah, langsung dari portal</dd></div>
                  <div><dt class="lp-mono">Lokasi</dt><dd>Jl. M.H. Thamrin No. 11, Jakarta</dd></div>
                  <div><dt class="lp-mono">Status</dt><dd>Terbuka sepanjang tahun</dd></div>
                </dl>
                @if (thumb) {
                  <figure>
                    <img [src]="thumb" alt="" loading="lazy">
                    <figcaption class="lp-mono">Frame 01 · Life at Sarinah</figcaption>
                  </figure>
                }
              </aside>
            </div>

            <nav class="lp-hero-foot lp-mono container" aria-label="Bagian halaman">
              <a href="#lp-why">01 Alasan</a>
              <a href="#how">02 Cara bergabung</a>
              <a href="#life">03 Life</a>
              <a href="#open-positions">04 Lowongan</a>
              <span class="lp-scroll" aria-hidden="true">Scroll ↓</span>
            </nav>
          </section>

          <!-- MARQUEE -->
          <div class="lp-marquee" aria-hidden="true">
            <div class="lp-marquee-track">
              @for (n of [0, 1]; track n) {
                <span>
                  @for (word of marquee; track word) {
                    <em>{{ word }}</em><b>✦</b>
                  }
                </span>
              }
            </div>
          </div>

          <!-- VALUES -->
          <section id="lp-why" class="lp-paper lp-why" aria-labelledby="why-title">
            <div class="container lp-why-grid">
              <div class="lp-why-left">
                <p class="lp-eyebrow lp-mono rv">(01) — Alasan bergabung</p>
                <h2 id="why-title" class="lp-display rv">Tempat talenta <em>tumbuh</em> bersama budaya Indonesia.</h2>
                @if (collage.length) {
                  <div class="lp-collage rv" aria-hidden="true">
                    @for (src of collage; track src; let i = $index) {
                      <figure [class]="'c' + i">
                        <img [src]="src" alt="" loading="lazy">
                        <figcaption class="lp-mono">Frame 0{{ i + 2 }}</figcaption>
                      </figure>
                    }
                  </div>
                }
              </div>
              <ol class="lp-values">
                @for (item of site.values; track item; let i = $index) {
                  <li class="rv">
                    <span class="lp-mono">0{{ i + 1 }}</span>
                    <div>
                      <h3>{{ item.title }}</h3>
                      <p>{{ item.text }}</p>
                    </div>
                  </li>
                }
              </ol>
            </div>
          </section>

          <!-- HOW -->
          <section id="how" class="lp-dark lp-how" aria-labelledby="how-title">
            <div class="lp-grain" aria-hidden="true"></div>
            <div class="container">
              <div class="lp-how-head">
                <p class="lp-eyebrow lp-mono rv">(02) — Cara bergabung</p>
                <h2 id="how-title" class="lp-display rv">Mulai karier Anda dalam <em>tiga langkah.</em></h2>
                <p class="lp-lead rv">Proses pendaftaran dibuat singkat, dan Anda bisa memantau setiap perkembangannya dari akun Anda.</p>
              </div>
              <ol class="lp-steps">
                @for (step of steps; track step; let i = $index) {
                  <li class="rv">
                    <div class="lp-step-top lp-mono"><span>Langkah 0{{ i + 1 }}</span><span>{{ step.tag }}</span></div>
                    <span class="lp-step-num" aria-hidden="true">{{ i + 1 }}</span>
                    <h3>{{ step.title }}</h3>
                    <p>{{ step.text }}</p>
                  </li>
                }
              </ol>
              <div class="lp-how-cta rv">
                <a [routerLink]="talentPoolLink" class="lp-btn lp-btn-red">{{ site.hero.secondaryCta }} <app-icon name="arrow-up-right" [size]="16"></app-icon></a>
              </div>
            </div>
          </section>

          <!-- LIFE -->
          <section id="life" class="lp-dark lp-life" aria-labelledby="life-title">
            <div class="container">
              <div class="lp-life-head">
                <p class="lp-eyebrow lp-mono rv">(03) — {{ site.lifeHeading.eyebrow }}</p>
                <h2 id="life-title" class="lp-mega rv">{{ site.lifeHeading.title }}</h2>
                <p class="lp-life-tag rv"><em>{{ site.lifeHeading.tagline }}</em></p>
                <p class="lp-lead rv">{{ site.lifeHeading.lead }}</p>
              </div>
              <div class="lp-life-stage rv">
                <app-life-carousel [programs]="site.programs" [seconds]="slideSeconds"></app-life-carousel>
              </div>
            </div>
          </section>

          <!-- OPEN POSITIONS -->
          <section id="open-positions" class="lp-paper lp-positions" aria-label="Lowongan">
            <div class="container">
              <app-open-positions></app-open-positions>
            </div>
          </section>

          <!-- FAQ -->
          <section id="faq" class="lp-paper lp-faq">
            <div class="container lp-faq-grid">
              <div>
                <p class="lp-eyebrow lp-mono rv">(05) — FAQ</p>
                <h2 class="lp-display rv">Pertanyaan yang <em>sering</em> diajukan.</h2>
                <p class="lp-muted rv">Belum menemukan jawaban yang Anda cari? Tim Human Capital siap membantu lewat kontak di bagian bawah halaman ini.</p>
              </div>
              <div class="lp-faq-list">
                @for (item of site.faqs; track item; let first = $first; let i = $index) {
                  <details [open]="first" class="rv">
                    <summary><span class="lp-mono">Q{{ i + 1 }}</span><span>{{ item.q }}</span><b aria-hidden="true">+</b></summary>
                    <p>{{ item.a }}</p>
                  </details>
                }
              </div>
            </div>
          </section>
        </main>
        <app-career-footer></app-career-footer>
      }
    </div>
    `,
    styles: [`
    .lp {
      --lp-ink: #0f0c0a; --lp-ink-2: #1a1512; --lp-paper: #f3eee6; --lp-paper-2: #ebe4d9;
      --lp-red: #d3121b; --lp-red-hot: #ff3b45; --lp-text-dim: #b8afa6;
      --lp-serif: 'Instrument Serif', 'Times New Roman', serif;
      --lp-mono: 'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace;
      background: var(--lp-paper);
    }
    .lp em { font-family: var(--lp-serif); font-style: italic; font-weight: 400; letter-spacing: -.01em; }
    .lp-mono { font-family: var(--lp-mono); font-size: 11.5px; letter-spacing: .12em; text-transform: uppercase; }
    .lp-eyebrow { color: var(--lp-red); margin: 0 0 18px; }
    .lp-dark .lp-eyebrow { color: var(--lp-red-hot); }
    .lp-display { font-size: clamp(34px, 4.6vw, 64px); line-height: 1.02; letter-spacing: -.04em; font-weight: 800; max-width: 16ch; }
    .lp-display em { font-size: 1.08em; }
    .lp-lead { font-size: 17px; line-height: 1.65; color: var(--lp-text-dim); max-width: 46ch; }
    .lp-muted { color: #6b6158; max-width: 40ch; }

    /* Header kaca gelap di landing */
    .lp .site-header { background: rgba(15, 12, 10, .55); border-bottom-color: rgba(255, 255, 255, .08); backdrop-filter: blur(16px) saturate(1.3); }
    .lp .site-brand img { filter: brightness(0) invert(1); }
    .lp .site-nav a, .lp .site-nav button { color: rgba(255, 255, 255, .78); }
    .lp .site-nav a:hover, .lp .site-nav button:hover { color: #fff; background: rgba(255, 255, 255, .08); }
    .lp .site-nav .active { color: #fff; }
    .lp .site-actions .btn-secondary { background: transparent; color: #fff; border-color: rgba(255, 255, 255, .35); border-radius: 999px; }
    .lp .menu-toggle { color: #fff; }
    @media (max-width: 900px) {
      .lp .site-nav { background: var(--lp-ink); border-color: rgba(255, 255, 255, .08); }
    }

    /* Buttons */
    .lp-btn { display: inline-flex; align-items: center; gap: 10px; height: 52px; padding: 0 26px; border-radius: 999px; font-weight: 700; font-size: 15px; transition: transform .2s, background-color .2s, border-color .2s; }
    .lp-btn:hover { transform: translateY(-2px); }
    .lp-btn-red { background: var(--lp-red); color: #fff; box-shadow: 0 10px 30px rgba(211, 18, 27, .35); }
    .lp-btn-red:hover { background: #b80f17; }
    .lp-btn-glass { color: #fff; background: rgba(255, 255, 255, .1); border: 1px solid rgba(255, 255, 255, .3); backdrop-filter: blur(12px); }
    .lp-btn-glass:hover { background: rgba(255, 255, 255, .18); border-color: #fff; }

    /* Grain */
    .lp-grain { position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: .18; mix-blend-mode: overlay;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }

    /* HERO */
    .lp-hero { position: relative; isolation: isolate; min-height: 100svh; margin-top: calc(-1 * var(--header-h)); padding-top: var(--header-h); color: #fff; background: var(--lp-ink); overflow: hidden; display: flex; flex-direction: column; }
    .lp-hero-media { position: absolute; inset: 0; z-index: 0; }
    .lp-hero-media img { width: 100%; height: 100%; object-fit: cover; object-position: 62% 28%; animation: lp-zoom 22s ease-out both; }
    .lp-hero-media::after { content: ""; position: absolute; inset: 0; background:
      radial-gradient(120% 90% at 70% 35%, rgba(15, 12, 10, 0) 30%, rgba(15, 12, 10, .65) 100%),
      linear-gradient(90deg, rgba(15, 12, 10, .85) 0%, rgba(15, 12, 10, .35) 45%, rgba(15, 12, 10, .1) 70%),
      linear-gradient(180deg, rgba(15, 12, 10, .3) 0%, rgba(15, 12, 10, 0) 30%, rgba(15, 12, 10, .85) 100%); }
    @keyframes lp-zoom { from { transform: scale(1.12); } to { transform: scale(1.02); } }
    .lp-hero-meta { position: relative; z-index: 2; display: flex; justify-content: space-between; padding: 22px var(--gutter) 0; color: rgba(255, 255, 255, .7); }
    .lp-hero-inner { position: relative; z-index: 2; flex: 1; display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 48px; align-items: end; padding-top: 56px; padding-bottom: 40px; }
    .lp-chip { display: inline-flex; align-items: center; gap: 10px; margin: 0 0 26px; padding: 8px 16px; border-radius: 999px; font-size: 13px; font-weight: 600; background: rgba(255, 255, 255, .1); border: 1px solid rgba(255, 255, 255, .22); backdrop-filter: blur(10px); }
    .lp-chip i { width: 8px; height: 8px; border-radius: 50%; background: var(--lp-red-hot); box-shadow: 0 0 0 0 rgba(255, 59, 69, .6); animation: lp-pulse 2s infinite; }
    @keyframes lp-pulse { 70% { box-shadow: 0 0 0 10px rgba(255, 59, 69, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 59, 69, 0); } }
    .lp-hero h1 { color: #fff; font-size: clamp(46px, 7.2vw, 108px); line-height: .94; letter-spacing: -.055em; font-weight: 800; max-width: 11.5ch; text-wrap: balance; }
    .lp-hero h1 em { display: inline; font-size: 1.1em; letter-spacing: -.02em; color: #ffe9e2; }
    .lp-hero-sub { margin: 28px 0 0; font-size: clamp(17px, 1.5vw, 20px); line-height: 1.55; color: #e9e2db; max-width: 40ch; }
    .lp-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 34px; }

    .lp-index { align-self: end; padding: 20px; border-radius: 20px; background: rgba(240, 236, 230, .14); border: 1px solid rgba(255, 255, 255, .22); backdrop-filter: blur(22px) saturate(1.2); box-shadow: 0 30px 80px rgba(0, 0, 0, .35); }
    .lp-index-head { display: flex; justify-content: space-between; padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px solid rgba(255, 255, 255, .2); color: rgba(255, 255, 255, .75); }
    .lp-index h2 { color: #fff; font-size: 30px; letter-spacing: -.03em; line-height: 1.05; font-weight: 700; }
    .lp-index > p { margin: 8px 0 14px; font-size: 13.5px; line-height: 1.55; color: rgba(255, 255, 255, .8); }
    .lp-index dl { margin: 0; }
    .lp-index dl div { display: grid; grid-template-columns: 76px 1fr; gap: 10px; padding: 9px 0; border-top: 1px solid rgba(255, 255, 255, .14); font-size: 13px; }
    .lp-index dt { color: rgba(255, 255, 255, .6); font-size: 10.5px; padding-top: 2px; }
    .lp-index dd { margin: 0; color: #fff; }
    .lp-index figure { margin: 14px 0 0; display: grid; grid-template-columns: 84px 1fr; gap: 12px; align-items: end; }
    .lp-index figure img { width: 84px; height: 62px; object-fit: cover; border-radius: 8px; }
    .lp-index figcaption { color: rgba(255, 255, 255, .65); font-size: 10px; }

    .lp-hero-foot { position: relative; z-index: 2; display: flex; gap: 28px; align-items: center; padding-top: 18px; padding-bottom: 22px; border-top: 1px solid rgba(255, 255, 255, .16); color: rgba(255, 255, 255, .7); }
    .lp-hero-foot a:hover { color: #fff; }
    .lp-scroll { margin-left: auto; color: #fff; animation: lp-bob 2.4s ease-in-out infinite; }
    @keyframes lp-bob { 50% { transform: translateY(4px); } }

    /* MARQUEE */
    .lp-marquee { overflow: hidden; background: var(--lp-red); color: #fff; padding: 18px 0; border-block: 1px solid rgba(0, 0, 0, .15); }
    .lp-marquee-track { display: flex; width: max-content; animation: lp-marquee 38s linear infinite; }
    .lp-marquee span { display: flex; align-items: center; flex: none; }
    .lp-marquee em { font-size: clamp(26px, 3vw, 40px); padding: 0 26px; white-space: nowrap; }
    .lp-marquee b { font-size: 18px; opacity: .8; }
    @keyframes lp-marquee { to { transform: translateX(-50%); } }

    /* PAPER / DARK */
    .lp-paper { background: var(--lp-paper); color: #1d1814; }
    .lp-dark { position: relative; isolation: isolate; background: var(--lp-ink); color: #fff; }
    .lp-dark h2, .lp-dark h3 { color: #fff; }

    /* VALUES */
    .lp-why { padding: 120px 0; }
    .lp-why-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 72px; align-items: start; }
    .lp-why-left { position: sticky; top: calc(var(--header-h) + 32px); }
    .lp-collage { position: relative; height: 330px; margin-top: 44px; }
    .lp-collage figure { position: absolute; margin: 0; padding: 8px 8px 30px; background: #fff; box-shadow: 0 20px 50px rgba(29, 24, 20, .18); }
    .lp-collage img { display: block; width: 100%; height: 100%; object-fit: cover; }
    .lp-collage figcaption { position: absolute; left: 10px; bottom: 9px; color: #6b6158; font-size: 10px; }
    .lp-collage .c0 { left: 0; top: 30px; width: 58%; height: 230px; transform: rotate(-3deg); }
    .lp-collage .c1 { right: 2%; top: 0; width: 46%; height: 200px; transform: rotate(4deg); }
    .lp-collage .c2 { right: 18%; bottom: -10px; width: 40%; height: 170px; transform: rotate(-1deg); }
    .lp-values { list-style: none; margin: 0; padding: 0; border-top: 1px solid #d8cfc3; }
    .lp-values li { display: grid; grid-template-columns: 64px 1fr; gap: 20px; padding: 34px 0; border-bottom: 1px solid #d8cfc3; }
    .lp-values li > span { color: var(--lp-red); padding-top: 8px; }
    .lp-values h3 { font-size: clamp(22px, 2.2vw, 30px); letter-spacing: -.03em; line-height: 1.1; }
    .lp-values p { margin-top: 10px; color: #5f564e; font-size: 16px; line-height: 1.6; max-width: 46ch; }

    /* HOW */
    .lp-how { padding: 120px 0; overflow: hidden; }
    .lp-how .container { position: relative; z-index: 2; }
    .lp-how-head { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 24px 64px; align-items: end; margin-bottom: 64px; }
    .lp-how-head .lp-eyebrow { grid-column: 1 / -1; margin: 0; }
    .lp-steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; border-top: 1px solid rgba(255, 255, 255, .18); }
    .lp-steps li { position: relative; padding: 26px 28px 34px 0; }
    .lp-steps li + li { padding-left: 28px; border-left: 1px solid rgba(255, 255, 255, .12); }
    .lp-step-top { display: flex; justify-content: space-between; color: var(--lp-text-dim); }
    .lp-step-num { display: block; margin: 26px 0 10px; font-family: var(--lp-serif); font-style: italic; font-size: clamp(110px, 12vw, 180px); line-height: .8; color: transparent; -webkit-text-stroke: 1.2px rgba(255, 255, 255, .55); transition: color .4s, -webkit-text-stroke-color .4s; }
    .lp-steps li:hover .lp-step-num { color: var(--lp-red); -webkit-text-stroke-color: var(--lp-red); }
    .lp-steps h3 { font-size: 24px; letter-spacing: -.02em; }
    .lp-steps p { margin-top: 8px; color: var(--lp-text-dim); line-height: 1.6; }
    .lp-how-cta { margin-top: 56px; }

    /* LIFE */
    .lp-life { padding: 40px 0 120px; border-top: 1px solid rgba(255, 255, 255, .08); }
    .lp-life-head { text-align: center; display: grid; justify-items: center; padding: 72px 0 48px; }
    .lp-mega { font-size: clamp(56px, 11vw, 168px); line-height: .88; letter-spacing: -.06em; font-weight: 800; color: #fff; }
    .lp-life-tag { margin: 18px 0 0; font-size: clamp(22px, 2.6vw, 34px); color: #f1e6de; }
    .lp-life-head .lp-lead { margin-top: 14px; }
    .lp-life-stage .lc-stage { border-radius: 24px; box-shadow: 0 40px 100px rgba(0, 0, 0, .5); }

    /* POSITIONS + FAQ */
    .lp-positions { padding: 100px 0 0; }
    .lp #open-positions { min-height: 0; }
    .lp-faq { padding: 40px 0 120px; }
    .lp-faq-grid { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 72px; align-items: start; }
    .lp-faq-list { border-top: 1px solid #d8cfc3; }
    .lp-faq details { border-bottom: 1px solid #d8cfc3; }
    .lp-faq summary { display: grid; grid-template-columns: 44px 1fr 24px; gap: 14px; align-items: baseline; padding: 24px 0; cursor: pointer; list-style: none; font-size: 19px; font-weight: 700; letter-spacing: -.02em; }
    .lp-faq summary::-webkit-details-marker { display: none; }
    .lp-faq summary .lp-mono { color: var(--lp-red); }
    .lp-faq summary b { font-weight: 400; font-size: 26px; line-height: 1; transition: transform .25s; color: #6b6158; }
    .lp-faq details[open] summary b { transform: rotate(45deg); }
    .lp-faq details p { margin: -8px 0 24px 58px; color: #5f564e; line-height: 1.65; max-width: 58ch; }

    /* Reveal */
    .lp-anim .rv { opacity: 0; transform: translateY(28px); transition: opacity .9s cubic-bezier(.2, .7, .2, 1), transform .9s cubic-bezier(.2, .7, .2, 1); }
    .lp-anim .rv.in { opacity: 1; transform: none; }

    @media (max-width: 1024px) {
      .lp-hero-inner { grid-template-columns: 1fr; }
      .lp-index { max-width: 420px; }
      .lp-why-grid, .lp-faq-grid, .lp-how-head { grid-template-columns: 1fr; gap: 40px; }
      .lp-why-left { position: static; }
    }
    @media (max-width: 760px) {
      .lp-hide-sm { display: none; }
      .lp-hero-inner { padding-top: 32px; }
      .lp-index { display: none; }
      .lp-hero-foot a { display: none; }
      .lp-why, .lp-how { padding: 80px 0; }
      .lp-collage { height: 260px; }
      .lp-collage .c0 { height: 180px; } .lp-collage .c1 { height: 150px; } .lp-collage .c2 { height: 130px; }
      .lp-steps { grid-template-columns: 1fr; }
      .lp-steps li, .lp-steps li + li { padding: 24px 0 28px; border-left: 0; border-bottom: 1px solid rgba(255, 255, 255, .12); }
      .lp-values li { grid-template-columns: 44px 1fr; padding: 26px 0; }
      .lp-faq summary { grid-template-columns: 36px 1fr 20px; font-size: 17px; }
      .lp-faq details p { margin-left: 50px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .lp-hero-media img, .lp-marquee-track, .lp-scroll, .lp-chip i { animation: none; }
      .lp-anim .rv { opacity: 1; transform: none; transition: none; }
    }
    `]
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  readonly steps = [
    { title: 'Buat akun', text: 'Daftar dengan email aktif, lalu verifikasi akun Anda.', tag: '± 2 menit' },
    { title: 'Lengkapi profil', text: 'Isi data diri, pendidikan, pengalaman kerja, dan unggah CV terbaru.', tag: 'Profil & CV' },
    { title: 'Lamar dan pantau', text: 'Lamar lowongan yang sesuai dan pantau statusnya langsung dari portal.', tag: 'Real-time' },
  ];
  readonly marquee = ['Karya lokal', 'Budaya Indonesia', 'Ritel kreatif', 'Tumbuh bersama', 'Berdampak', 'Sarinah Talent Pool'];
  readonly year = new Date().getFullYear();
  readonly slideSeconds = LIFE_SLIDE_SECONDS;
  readonly animate = typeof window !== 'undefined'
    && 'IntersectionObserver' in window
    && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  site: LandingData | null = null;
  private observer?: IntersectionObserver;
  private mutation?: MutationObserver;

  constructor(private auth: TalentAuthService, content: SiteContentService, private host: ElementRef<HTMLElement>) {
    content.landing().subscribe((site) => this.site = site);
  }

  ngAfterViewInit(): void {
    if (!this.animate) return;
    this.observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('in'); this.observer?.unobserve(e.target); }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    const scan = () => this.host.nativeElement.querySelectorAll('.rv:not(.in)').forEach((el) => this.observer?.observe(el));
    scan();
    // Isi landing dimuat async; amati elemen yang baru muncul.
    this.mutation = new MutationObserver(scan);
    this.mutation.observe(this.host.nativeElement, { childList: true, subtree: true });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.mutation?.disconnect();
  }

  /** Judul hero dipecah: kata terakhir (2 kata) ditulis serif miring sebagai aksen. */
  private get titleWords(): string[] { return (this.site?.hero.title || '').trim().split(/\s+/); }
  get titleHead(): string { const w = this.titleWords; return w.length > 3 ? w.slice(0, -2).join(' ') : w.join(' '); }
  get titleTail(): string { const w = this.titleWords; return w.length > 3 ? w.slice(-2).join(' ') : ''; }

  private get programImages(): string[] {
    return (this.site?.programs || []).flatMap((p) => p.images || []).filter(Boolean);
  }
  get thumb(): string | null { return this.programImages[0] || null; }
  get collage(): string[] { return this.programImages.slice(1, 4); }

  get talentPoolLink(): string {
    if (!this.auth.authenticated) return '/register';
    return this.auth.session?.onboardingCompleted === false ? '/onboarding' : '/portal';
  }
}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="career-shell">
      <header class="career-header">
        <img class="danantara-logo" src="/images/Danantara_Indonesia.png" alt="Danantara Indonesia">
        <nav>
          <a routerLink="/" class="active">Home</a>
          <a href="#life">Life at Sarinah</a>
          <a routerLink="/open-positions">Open Positions</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div class="career-header-right">
          <a class="outline-link" routerLink="/sign-in">Masuk</a>
          <img class="sarinah-logo" src="/images/sarinah.png" alt="Sarinah">
        </div>
      </header>

      <main>
        <section class="hero">
          <div class="hero-copy">
            <span class="eyebrow">SARINAH CAREER</span>
            <h1>Build a legacy through <span>creative retail.</span></h1>
            <p>Temukan ruang untuk bertumbuh, berkolaborasi, dan menciptakan pengalaman ritel Indonesia yang relevan untuk generasi berikutnya.</p>
            <div class="hero-actions">
              <a routerLink="/open-positions" class="primary-cta">Explore Opportunities →</a>
              <a href="#life" class="secondary-cta">Discover Life at Sarinah</a>
            </div>
          </div>
          <div class="hero-photo">
            <div class="hero-card">
              <strong>Grow with Sarinah</strong>
              <span>Talent Pool • Retail • Technology • Operations</span>
            </div>
          </div>
        </section>

        <section id="life" class="section">
          <div class="section-head">
            <span>WHY SARINAH</span>
            <h2>Build, learn, and make an impact together.</h2>
          </div>
          <div class="feature-grid">
            <article><b>01</b><h3>Collaborative Spirit</h3><p>Kolaborasi lintas fungsi untuk menciptakan pengalaman retail yang relevan.</p></article>
            <article><b>02</b><h3>Meaningful Growth</h3><p>Kesempatan berkembang melalui project, mentoring, dan pengalaman nyata.</p></article>
            <article><b>03</b><h3>Indonesian Legacy</h3><p>Berkarier sambil membawa cerita dan kreativitas Indonesia lebih jauh.</p></article>
          </div>
        </section>

        <section id="faq" class="section soft">
          <div class="section-head">
            <span>FAQ</span>
            <h2>Frequently asked questions.</h2>
          </div>
          <div class="faq-grid">
            <article><h3>Apa itu Talent Pool?</h3><p>Talent Pool menyimpan profil kandidat untuk dipertimbangkan pada peluang yang relevan.</p></article>
            <article><h3>Harus melamar posisi tertentu?</h3><p>Tidak. Anda dapat bergabung ke Talent Pool sambil tetap melihat posisi yang sedang terbuka.</p></article>
            <article><h3>Bagaimana proses berikutnya?</h3><p>Tim rekrutmen dapat meninjau profil dan menghubungi Anda jika ada kebutuhan yang sesuai.</p></article>
          </div>
        </section>
      </main>
    </div>
  `,
})
export class LandingComponent {}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CareerHeaderComponent } from '../../shared/career-header.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CareerHeaderComponent],
  template: `
    <div class="career-shell">
      <app-career-header active="home"></app-career-header>

      <main>
        <section class="hero">
          <div class="hero-copy">
            <span class="eyebrow">SARINAH CAREER</span>
            <h1>Build a legacy through <span>creative retail.</span></h1>
            <p>Temukan ruang untuk bertumbuh, berkolaborasi, dan menciptakan pengalaman ritel Indonesia yang relevan untuk generasi berikutnya.</p>
            <div class="hero-actions">
              <a routerLink="/open-positions" class="primary-cta">Explore Opportunities →</a>
              <a routerLink="/" fragment="life" class="secondary-cta">Discover Life at Sarinah</a>
            </div>
          </div>
          <div class="hero-photo">
            <div class="hero-card">
              <strong>Grow with Sarinah</strong>
              <span>Talent Pool • Retail • Technology • Operations</span>
            </div>
          </div>
        </section>

        <section id="life" class="section life-section">
          <div class="life-intro">
            <div class="section-head">
              <span>LIFE AT SARINAH</span>
              <h2>Grow together, create meaningful retail experiences.</h2>
              <p class="life-lead">
                Di Sarinah, pekerjaan bukan hanya tentang menyelesaikan tugas. Anda bekerja bersama tim lintas fungsi,
                bertemu ide baru, belajar dari pengalaman nyata, dan ikut membawa identitas Indonesia ke pengalaman retail modern.
              </p>
            </div>

            <div class="life-feature-photo">
              <div class="life-photo-copy">
                <span>COLLABORATE • LEARN • GROW</span>
                <strong>Tempat untuk berkarya bersama.</strong>
                <p>Berinteraksi dengan berbagai fungsi bisnis dan membangun solusi yang berdampak langsung pada pelanggan.</p>
              </div>
            </div>
          </div>

          <div class="life-gallery">
            <article class="life-gallery-card life-gallery-one">
              <div>
                <span>OUR PEOPLE</span>
                <h3>Collaboration that moves ideas forward.</h3>
              </div>
            </article>

            <article class="life-gallery-card life-gallery-two">
              <div>
                <span>OUR GROWTH</span>
                <h3>Learn through real projects and shared experience.</h3>
              </div>
            </article>
          </div>

          <div class="feature-grid life-values">
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

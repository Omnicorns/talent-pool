import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CareerHeaderComponent } from '../../shared/career-header.component';
import { CareerFooterComponent } from '../../shared/career-footer.component';
import { OpenPositionsComponent } from './open-positions.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, CareerHeaderComponent, CareerFooterComponent, OpenPositionsComponent],
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
              <a routerLink="/" fragment="open-positions" class="primary-cta">Explore Opportunities →</a>
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
          <div class="section-head life-program-heading">
            <span>LIFE AT SARINAH</span>
            <h2>Berkarya, bertumbuh, dan merayakan kebersamaan.</h2>
            <p>Kenali kehidupan di Sarinah melalui kegiatan dan cerita kebersamaan tim kami.</p>
          </div>
          <div class="life-program-grid">
            <article class="life-program-card" *ngFor="let program of lifePrograms; let i = index">
              <div class="life-program-photo">
                <img src="assets/images/life-at-sarinah-reference.png" [alt]="program.title"
                  loading="lazy" [style.left.%]="-program.x / 436 * 100" [style.top.%]="-program.y / 230 * 100">
              </div>
              <div class="life-program-caption"><h3>{{ program.title }}</h3><p>{{ program.description }}</p></div>
            </article>
          </div>
        </section>

        <section id="open-positions" class="section positions-section" aria-label="Open Positions">
          <app-open-positions></app-open-positions>
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
      <app-career-footer></app-career-footer>
    </div>
  `,
})
export class LandingComponent {
  lifePrograms = [
    {x:80,y:64,title:'Kebersamaan Sarinah',description:'Bergerak bersama dalam kegiatan yang mempererat kebersamaan keluarga Sarinah.'},
    {x:532,y:64,title:'Semangat Kolaborasi',description:'Berbagi ide dan energi positif untuk mendukung keberhasilan bersama.'},
    {x:986,y:64,title:'Kegiatan Tim Sarinah',description:'Membangun hubungan antarrekan melalui pengalaman dan kegiatan bersama.'},
    {x:80,y:307,title:'Perayaan Bersama',description:'Merayakan pencapaian dan momen istimewa bersama tim Sarinah.'},
    {x:532,y:307,title:'Belajar Bersama',description:'Berbagi pengalaman dan saling mendukung untuk terus bertumbuh.'},
    {x:986,y:307,title:'Keluarga Besar Sarinah',description:'Menghargai keberagaman dan menghadirkan suasana kerja yang inklusif.'},
  ];
}

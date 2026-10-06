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
        <section class="hero home-hero" aria-labelledby="home-hero-title">
          <div class="home-hero-visual">
            <div class="home-hero-crop">
              <img src="assets/images/home-hero-reference.png" width="1456" height="810"
                alt="Dua rekan kerja Sarinah berkolaborasi menggunakan laptop" fetchpriority="high">
            </div>
          </div>
          <svg class="home-hero-flower" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
            <g fill="currentColor"><path *ngFor="let angle of flowerPetals" d="M50 50C35 35 35 12 50 3C65 12 65 35 50 50Z" [attr.transform]="'rotate(' + angle + ' 50 50)'"></path></g>
          </svg>
          <div class="hero-copy home-hero-copy">
            <h1 id="home-hero-title"><span>Be Part of Indonesia’s</span><span>Creative Retail Legacy</span></h1>
            <p>Discover opportunities to grow, create impact, and champion local excellence</p>
            <div class="hero-actions">
              <a routerLink="/" fragment="open-positions" class="primary-cta home-hero-cta">Explore opportunities <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </section>

        <section class="home-benefits" aria-label="Mengapa bergabung dengan Sarinah">
          <article class="home-benefit">
            <div class="home-benefit-heading">
              <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="13" r="7"/><path d="M12 43v-9c0-6 5-11 12-11s12 5 12 11v9M18 43v-9m12 9v-9M12 12a5 5 0 0 0 0 10M7 39v-8c0-4 2-7 6-8M36 12a5 5 0 0 1 0 10m5 17v-8c0-4-2-7-6-8"/></g></svg>
              <h2>Bergabung dalam <br>Talent Pool</h2>
            </div>
            <p>Kesempatan untuk menjadi bagian dari jaringan talenta Sarinah.</p>
          </article>
          <article class="home-benefit">
            <div class="home-benefit-heading">
              <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 42V28h7v14m7 0V22h7v20m7 0V14h7v28M5 23 17 11l9 7L43 3m-8 0h8v8M3 43h40"/></g></svg>
              <h2>Peluang <br>Berkembang</h2>
            </div>
            <p>Dapatkan kesempatan karier yang sesuai dengan kompetensi dan minat Anda.</p>
          </article>
          <article class="home-benefit">
            <div class="home-benefit-heading">
              <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 21-12 21 12H3Zm2 25h38v4H5Zm5-4V20m6 17V20m5 17V20m6 17V20m5 17V20m6 17V20M7 20h34M7 37h34"/></g></svg>
              <h2>Berkontribusi untuk <br>Indonesia</h2>
            </div>
            <p>Bersama Sarinah, hadirkan nilai dan inspirasi bagi masyarakat Indonesia.</p>
          </article>
          <article class="home-benefit">
            <div class="home-benefit-heading">
              <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 3c6 4 11 6 17 7v13c0 11-8 18-17 22C15 41 7 34 7 23V10c6-1 11-3 17-7Z"/><path d="m17 24 5 5 10-11"/></g></svg>
              <h2>Keamanan Data</h2>
            </div>
            <p>Data Anda dikelola sesuai UU Perlindungan Data Pribadi dan hanya digunakan untuk proses rekrutmen.</p>
          </article>
          <svg class="home-benefits-flower" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
            <g fill="none" stroke="currentColor" stroke-width="1.2"><path *ngFor="let angle of flowerPetals" d="M50 50C35 35 35 12 50 3C65 12 65 35 50 50Z" [attr.transform]="'rotate(' + angle + ' 50 50)'"></path></g>
          </svg>
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
  flowerPetals = [0,45,90,135,180,225,270,315];
  lifePrograms = [
    {x:80,y:64,title:'Kebersamaan Sarinah',description:'Bergerak bersama dalam kegiatan yang mempererat kebersamaan keluarga Sarinah.'},
    {x:532,y:64,title:'Semangat Kolaborasi',description:'Berbagi ide dan energi positif untuk mendukung keberhasilan bersama.'},
    {x:986,y:64,title:'Kegiatan Tim Sarinah',description:'Membangun hubungan antarrekan melalui pengalaman dan kegiatan bersama.'},
    {x:80,y:307,title:'Perayaan Bersama',description:'Merayakan pencapaian dan momen istimewa bersama tim Sarinah.'},
    {x:532,y:307,title:'Belajar Bersama',description:'Berbagi pengalaman dan saling mendukung untuk terus bertumbuh.'},
    {x:986,y:307,title:'Keluarga Besar Sarinah',description:'Menghargai keberagaman dan menghadirkan suasana kerja yang inklusif.'},
  ];
}

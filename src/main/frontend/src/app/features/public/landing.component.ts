import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CareerHeaderComponent } from '../../shared/career-header.component';
import { CareerFooterComponent } from '../../shared/career-footer.component';
import { IconComponent } from '../../shared/icon.component';
import { OpenPositionsComponent } from './open-positions.component';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, CareerHeaderComponent, CareerFooterComponent, OpenPositionsComponent, IconComponent],
  template: `
    <div class="site">
      <app-career-header active="home"></app-career-header>

      <main>
        <section class="hero" aria-labelledby="hero-title">
          <svg class="hero-motif" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
            <g fill="currentColor"><path *ngFor="let angle of petals" d="M50 50C36 36 36 13 50 4c14 9 14 32 0 46Z" [attr.transform]="'rotate(' + angle + ' 50 50)'"></path></g>
          </svg>
          <div class="hero-copy">
            <h1 id="hero-title">Be Part of Indonesia’s Creative Retail Legacy</h1>
            <p>Discover opportunities to grow, create impact, and champion local excellence.</p>
            <div class="hero-actions">
              <a routerLink="/" fragment="open-positions" class="btn btn-primary btn-lg">Explore opportunities</a>
              <a [routerLink]="talentPoolLink" class="btn btn-secondary btn-lg">Gabung Talent Pool</a>
            </div>
          </div>
          <div class="hero-media">
            <img src="assets/images/hero-sarinah.jpg" width="611" height="462"
              alt="Dua karyawan Sarinah berbusana tenun dan batik bekerja bersama di depan laptop" fetchpriority="high">
          </div>
        </section>

        <section class="values" aria-label="Alasan bergabung dengan Sarinah">
          <div class="container">
            <div class="values-card">
              <article class="value" *ngFor="let item of values">
                <app-icon [name]="item.icon" [size]="28" [stroke]="1.6"></app-icon>
                <h2>{{ item.title }}</h2>
                <p>{{ item.text }}</p>
              </article>
            </div>
          </div>
        </section>

        <section id="life" class="section">
          <div class="container">
            <div class="section-head">
              <h2>Life at Sarinah</h2>
              <p>Berkarya, bertumbuh, dan merayakan kebersamaan bersama keluarga besar Sarinah.</p>
            </div>
            <div class="life-grid">
              <figure class="life-item" *ngFor="let program of lifePrograms">
                <div class="life-photo"><img [src]="program.image" [alt]="program.title" loading="lazy" width="436" height="146"></div>
                <figcaption><h3>{{ program.title }}</h3><p>{{ program.description }}</p></figcaption>
              </figure>
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
              <details *ngFor="let item of faqs; let first = first" [open]="first">
                <summary>{{ item.q }} <app-icon name="chevron-down" [size]="20"></app-icon></summary>
                <p>{{ item.a }}</p>
              </details>
            </div>
          </div>
        </section>
      </main>
      <app-career-footer></app-career-footer>
    </div>
  `,
})
export class LandingComponent {
  readonly petals = [0, 45, 90, 135, 180, 225, 270, 315];

  readonly values = [
    { icon: 'users', title: 'Bergabung dalam Talent Pool', text: 'Kesempatan untuk menjadi bagian dari jaringan talenta Sarinah.' },
    { icon: 'sprout', title: 'Peluang berkembang', text: 'Dapatkan kesempatan karier yang sesuai dengan kompetensi dan minat Anda.' },
    { icon: 'building', title: 'Berkontribusi untuk Indonesia', text: 'Bersama Sarinah, hadirkan nilai dan inspirasi bagi masyarakat Indonesia.' },
    { icon: 'shield', title: 'Keamanan data', text: 'Data Anda dikelola sesuai UU Perlindungan Data Pribadi dan hanya digunakan untuk rekrutmen.' },
  ];

  readonly lifePrograms = [
    { image: 'assets/images/life/life-1.jpg', title: 'Kebersamaan Sarinah', description: 'Bergerak bersama dalam kegiatan yang mempererat keluarga Sarinah.' },
    { image: 'assets/images/life/life-2.jpg', title: 'Semangat kolaborasi', description: 'Berbagi ide dan energi positif untuk keberhasilan bersama.' },
    { image: 'assets/images/life/life-3.jpg', title: 'Kegiatan tim', description: 'Membangun hubungan antarrekan melalui pengalaman bersama.' },
    { image: 'assets/images/life/life-4.jpg', title: 'Perayaan bersama', description: 'Merayakan pencapaian dan momen istimewa bersama tim.' },
    { image: 'assets/images/life/life-5.jpg', title: 'Belajar bersama', description: 'Berbagi pengalaman dan saling mendukung untuk terus bertumbuh.' },
    { image: 'assets/images/life/life-6.jpg', title: 'Keluarga besar Sarinah', description: 'Menghargai keberagaman dalam suasana kerja yang inklusif.' },
  ];

  readonly faqs = [
    { q: 'Apa itu Talent Pool?', a: 'Talent Pool adalah basis data profil kandidat Sarinah. Profil Anda akan dipertimbangkan saat ada kebutuhan posisi yang relevan, meskipun Anda belum melamar lowongan tertentu.' },
    { q: 'Apakah saya harus melamar posisi tertentu?', a: 'Tidak. Anda dapat bergabung ke Talent Pool terlebih dahulu, lalu melamar lowongan yang sedang dibuka kapan saja dari akun yang sama.' },
    { q: 'Bagaimana proses setelah saya mendaftar?', a: 'Tim Human Capital meninjau profil dan CV Anda. Jika ada posisi yang sesuai, kami menghubungi Anda melalui email atau WhatsApp untuk tahap berikutnya.' },
    { q: 'Bagaimana saya memantau status lamaran?', a: 'Masuk ke akun Anda, lalu buka Profil saya. Status setiap lamaran tampil di bagian Lamaran saya, lengkap dengan riwayat prosesnya.' },
  ];

  constructor(private auth: TalentAuthService) {}

  get talentPoolLink(): string {
    if (!this.auth.authenticated) return '/register';
    return this.auth.session?.onboardingCompleted === false ? '/onboarding' : '/portal';
  }
}

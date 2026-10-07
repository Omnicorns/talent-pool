import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-career-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <div class="container">
        <div>
          <a routerLink="/" aria-label="Beranda Sarinah Karier"><img src="images/sarinah.png" alt="Sarinah"></a>
          <p>Tempat bertemunya karya, budaya, produk lokal, dan talenta yang ingin ikut membangun pengalaman ritel Indonesia.</p>
        </div>
        <nav aria-label="Tautan">
          <h2>Jelajahi</h2>
          <a routerLink="/">Home</a>
          <a routerLink="/" fragment="life">Life at Sarinah</a>
          <a routerLink="/" fragment="open-positions">Open Positions</a>
          <a routerLink="/" fragment="faq">FAQ</a>
        </nav>
        <div>
          <h2>Kontak</h2>
          <address>
            <span>PT Sarinah</span>
            <span>Jl. M.H. Thamrin No. 11, Jakarta Pusat</span>
            <a href="tel:+622131923008">(021) 3192 3008</a>
            <a href="mailto:div.sekretariat@sarinah.co.id">div.sekretariat&#64;sarinah.co.id</a>
          </address>
        </div>
      </div>
      <div class="site-footer-bottom">
        <div class="container">
          <span>© {{ year }} PT Sarinah</span>
          <span>Portal Karier &amp; Talent Pool</span>
        </div>
      </div>
    </footer>
  `,
})
export class CareerFooterComponent {
  readonly year = new Date().getFullYear();
}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-career-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="career-footer">
      <div class="career-footer-grid">
        <div class="career-footer-brand">
          <a routerLink="/" aria-label="Sarinah Career Home">
            <img src="images/sarinah.png" alt="Sarinah">
          </a>
          <p>Tempat bertemunya karya, budaya, produk lokal, dan talenta yang ingin ikut membangun pengalaman retail Indonesia.</p>
        </div>
        <nav aria-label="Quick Links">
          <h2>Quick Links</h2>
          <a routerLink="/">Home</a>
          <a routerLink="/" fragment="life">Life at Sarinah</a>
          <a routerLink="/" fragment="open-positions">Open Positions</a>
          <a routerLink="/" fragment="faq">FAQ</a>
        </nav>
        <div class="career-footer-contact">
          <h2>Contact</h2>
          <address>
            <strong>PT Sarinah</strong>
            <span>Jl. M. H. Thamrin No.11, Jakarta Pusat</span>
            <a href="tel:+622131923008">Telp (021) 31923008</a>
            <a href="mailto:div.sekretariat@sarinah.co.id">div.sekretariat&#64;sarinah.co.id</a>
          </address>
        </div>
      </div>
      <div class="career-footer-bottom">
        <span>© {{ year }} PT Sarinah. All rights reserved.</span>
        <span>Talent Pool & Career Portal</span>
      </div>
    </footer>
  `,
})
export class CareerFooterComponent {
  readonly year = new Date().getFullYear();
}

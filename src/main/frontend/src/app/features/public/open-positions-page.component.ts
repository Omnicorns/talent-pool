import { Component } from '@angular/core';
import { CareerHeaderComponent } from '../../shared/career-header.component';
import { CareerFooterComponent } from '../../shared/career-footer.component';
import { OpenPositionsComponent } from './open-positions.component';

/** Halaman tersendiri untuk daftar lowongan (/open-positions), terpisah dari landing page. */
@Component({
    selector: 'app-open-positions-page',
    imports: [CareerHeaderComponent, CareerFooterComponent, OpenPositionsComponent],
    template: `
    <div class="site">
      <app-career-header active="open"></app-career-header>
      <main>
        <section id="open-positions" class="section alt positions-page" aria-labelledby="positions-title">
          <div class="container">
            <app-open-positions></app-open-positions>
          </div>
        </section>
      </main>
      <app-career-footer></app-career-footer>
    </div>
    `
})
export class OpenPositionsPageComponent {}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';

@Component({
  selector: 'app-backoffice-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BackofficeLayoutComponent],
  template: `
    <app-backoffice-layout active="dashboard">
      <div class="bo-page-head">
        <div>
          <span class="bo-kicker">OVERVIEW</span>
          <h1>Dashboard</h1>
          <p>Pantau Talent Pool, lowongan, dan proses rekrutmen dalam satu tempat.</p>
        </div>
      </div>

      <section class="dashboard-grid">
        <a routerLink="/backoffice/candidates">
          <span>Total Candidate</span>
          <strong>{{ dashboard?.totalCandidates ?? '-' }}</strong>
          <small>Lihat kandidat →</small>
        </a>
        <a routerLink="/backoffice/candidates">
          <span>Available Talent</span>
          <strong>{{ dashboard?.availableCandidates ?? '-' }}</strong>
          <small>Talent siap proses →</small>
        </a>
        <a routerLink="/backoffice/job-listings">
          <span>Open Positions</span>
          <strong>{{ dashboard?.openJobListings ?? '-' }}</strong>
          <small>Kelola lowongan →</small>
        </a>
        <a routerLink="/backoffice/applications">
          <span>Applications</span>
          <strong>{{ dashboard?.totalApplications ?? '-' }}</strong>
          <small>Lihat pipeline →</small>
        </a>
      </section>

      <section class="bo-dashboard-panels">
        <article class="bo-dashboard-panel">
          <div class="bo-panel-head">
            <div>
              <span class="bo-kicker">QUICK ACCESS</span>
              <h2>Recruitment Workspace</h2>
            </div>
          </div>
          <div class="bo-quick-grid">
            <a routerLink="/backoffice/candidates"><b>👥</b><strong>Candidates</strong><span>Kelola profil dan status talent.</span></a>
            <a routerLink="/backoffice/job-listings"><b>▤</b><strong>Job Listings</strong><span>Pantau posisi dan kebutuhan rekrutmen.</span></a>
            <a routerLink="/backoffice/applications"><b>✓</b><strong>Applications</strong><span>Kelola pipeline kandidat per tahap.</span></a>
          </div>
        </article>

        <article class="bo-dashboard-panel bo-highlight-panel">
          <span class="bo-kicker">SARINAH TALENT MANAGEMENT</span>
          <h2>Satu dashboard untuk seluruh proses kandidat.</h2>
          <p>Gunakan menu di sebelah kiri untuk berpindah antara kandidat, lowongan, dan application pipeline tanpa kembali ke halaman login.</p>
        </article>
      </section>
    </app-backoffice-layout>
  `,
})
export class BackofficeDashboardComponent implements OnInit {
  dashboard: any;
  constructor(private api: BackofficeApiService) {}

  ngOnInit(): void {
    this.api.dashboard().subscribe({
      next: (value) => this.dashboard = value,
    });
  }
}

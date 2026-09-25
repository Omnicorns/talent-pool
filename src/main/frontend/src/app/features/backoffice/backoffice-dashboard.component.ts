import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BackofficeAuthService } from '../../core/service/api/backoffice-auth.service';
import { API_BASE } from '../../core/service/api/api-base';

@Component({
  selector: 'app-backoffice-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bo-shell">
      <aside>
        <img src="images/sarinah.png" alt="Sarinah">
        <strong>Talent Management</strong>
        <nav><button class="active">Dashboard</button><button>Candidates</button><button>Job Listings</button><button>Applications</button></nav>
        <button class="logout" (click)="auth.logout()">Keluar</button>
      </aside>
      <main>
        <header><div><h1>Dashboard</h1><p>Talent Pool & Recruitment Overview</p></div></header>
        <section class="dashboard-grid">
          <article><span>Total Candidate</span><strong>{{ dashboard?.totalCandidates ?? '-' }}</strong></article>
          <article><span>Available Talent</span><strong>{{ dashboard?.availableCandidates ?? '-' }}</strong></article>
          <article><span>Open Positions</span><strong>{{ dashboard?.openJobListings ?? '-' }}</strong></article>
          <article><span>Applications</span><strong>{{ dashboard?.totalApplications ?? '-' }}</strong></article>
        </section>
        <section class="dashboard-panel"><h2>Back Office Angular</h2><p>Dashboard sudah berjalan dari Angular dan menggunakan API Spring Boot yang sama.</p></section>
      </main>
    </div>
  `,
})
export class BackofficeDashboardComponent implements OnInit {
  dashboard: any;

  constructor(private http: HttpClient, public auth: BackofficeAuthService) {}

  ngOnInit(): void {
    const authorization = this.auth.authorization;
    const headers = authorization ? new HttpHeaders({ Authorization: authorization }) : undefined;
    this.http.get(`${API_BASE}/backoffice/dashboard`, { headers }).subscribe({
      next: (value) => this.dashboard = value,
    });
  }
}

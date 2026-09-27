import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';

interface Insight {
  name: string;
  count: number;
}

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

      <section class="bo-analytics-grid">
        <article class="bo-analytics-card bo-donut-card">
          <div class="bo-panel-head">
            <div>
              <span class="bo-kicker">TALENT OVERVIEW</span>
              <h2>Candidate Status</h2>
            </div>
            <a routerLink="/backoffice/candidates">Detail →</a>
          </div>

          <div class="bo-donut-layout">
            <div
              class="bo-donut"
              [style.background]="candidateDonutBackground"
              [attr.aria-label]="'Candidate status distribution'"
            >
              <div class="bo-donut-center">
                <strong>{{ candidateTotal }}</strong>
                <span>Candidate</span>
              </div>
            </div>

            <div class="bo-chart-legend">
              <div *ngFor="let item of candidateStatuses; let i = index">
                <i [style.background]="chartColors[i % chartColors.length]"></i>
                <span>{{ label(item.name) }}</span>
                <strong>{{ item.count }}</strong>
              </div>
              <div *ngIf="!candidateStatuses.length" class="bo-chart-empty">Belum ada data kandidat.</div>
            </div>
          </div>
        </article>

        <article class="bo-analytics-card">
          <div class="bo-panel-head">
            <div>
              <span class="bo-kicker">RECRUITMENT FUNNEL</span>
              <h2>Application Pipeline</h2>
            </div>
            <a routerLink="/backoffice/applications">Detail →</a>
          </div>

          <div class="bo-bar-chart" *ngIf="applicationStages.length; else emptyPipeline">
            <div class="bo-bar-row" *ngFor="let item of applicationStages">
              <span class="bo-bar-label">{{ label(item.name) }}</span>
              <div class="bo-bar-track">
                <div class="bo-bar-fill" [style.width.%]="percentage(item.count, applicationMax)"></div>
              </div>
              <strong>{{ item.count }}</strong>
            </div>
          </div>
          <ng-template #emptyPipeline>
            <div class="bo-chart-empty">Belum ada application pipeline.</div>
          </ng-template>
        </article>

        <article class="bo-analytics-card bo-job-status-card">
          <div class="bo-panel-head">
            <div>
              <span class="bo-kicker">POSITION HEALTH</span>
              <h2>Job Listing Status</h2>
            </div>
            <a routerLink="/backoffice/job-listings">Detail →</a>
          </div>

          <div class="bo-job-status-list">
            <div class="bo-job-status-row" *ngFor="let item of jobListingStatuses; let i = index">
              <div class="bo-job-status-head">
                <span><i [style.background]="jobStatusColors[i % jobStatusColors.length]"></i>{{ label(item.name) }}</span>
                <strong>{{ item.count }}</strong>
              </div>
              <div class="bo-job-status-track">
                <div
                  class="bo-job-status-fill"
                  [style.width.%]="percentage(item.count, jobListingTotal)"
                  [style.background]="jobStatusColors[i % jobStatusColors.length]"
                ></div>
              </div>
            </div>
            <div *ngIf="!jobListingStatuses.length" class="bo-chart-empty">Belum ada data job listing.</div>
          </div>

          <div class="bo-job-status-total">
            <span>Total posisi</span>
            <strong>{{ jobListingTotal }}</strong>
          </div>
        </article>
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

  readonly chartColors = ['#d9271c', '#2ca58d', '#4d7cfe', '#f0a23b', '#8c63d8', '#8e98a3', '#c45b9d', '#3aa1a6'];
  readonly jobStatusColors = ['#2ca58d', '#f0a23b', '#8e98a3'];

  constructor(private api: BackofficeApiService) {}

  ngOnInit(): void {
    this.api.dashboard().subscribe({
      next: (value) => this.dashboard = value,
    });
  }

  get candidateStatuses(): Insight[] {
    return this.dashboard?.candidateStatuses || [];
  }

  get applicationStages(): Insight[] {
    const order = ['NEW_CANDIDATE', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];
    const data = this.dashboard?.applicationStages || [];
    return [...data].sort((a: Insight, b: Insight) => order.indexOf(a.name) - order.indexOf(b.name));
  }

  get jobListingStatuses(): Insight[] {
    const order = ['PUBLISHED', 'DRAFT', 'CLOSED'];
    const data = this.dashboard?.jobListingStatuses || [];
    return [...data].sort((a: Insight, b: Insight) => order.indexOf(a.name) - order.indexOf(b.name));
  }

  get candidateTotal(): number {
    return this.candidateStatuses.reduce((sum, item) => sum + Number(item.count || 0), 0);
  }

  get applicationMax(): number {
    return Math.max(1, ...this.applicationStages.map((item) => Number(item.count || 0)));
  }

  get jobListingTotal(): number {
    return this.jobListingStatuses.reduce((sum, item) => sum + Number(item.count || 0), 0);
  }

  get candidateDonutBackground(): string {
    if (!this.candidateStatuses.length || !this.candidateTotal) {
      return 'conic-gradient(#e8ecef 0deg 360deg)';
    }

    let cursor = 0;
    const slices = this.candidateStatuses.map((item, index) => {
      const start = cursor;
      const degrees = (Number(item.count || 0) / this.candidateTotal) * 360;
      cursor += degrees;
      const color = this.chartColors[index % this.chartColors.length];
      return `${color} ${start}deg ${cursor}deg`;
    });

    return `conic-gradient(${slices.join(', ')})`;
  }

  percentage(value: number, total: number): number {
    if (!total) return 0;
    return Math.max(0, Math.min(100, (Number(value || 0) / total) * 100));
  }

  label(value: string): string {
    return String(value || '-')
      .toLowerCase()
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}

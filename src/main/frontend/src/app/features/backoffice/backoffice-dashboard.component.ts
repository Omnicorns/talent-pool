import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';
import { IconComponent } from '../../shared/icon.component';
import { FMT } from '../../shared/labels';

interface Insight {
  name: string;
  count: number;
}

@Component({
  selector: 'app-backoffice-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BackofficeLayoutComponent, IconComponent],
  template: `
    <app-backoffice-layout active="dashboard">
      <div class="bo-head">
        <div>
          <h1>Ringkasan rekrutmen</h1>
          <p>{{ today }}</p>
        </div>
        <div class="bo-actions">
          <a class="btn btn-secondary" routerLink="/backoffice/interviews"><app-icon name="calendar" [size]="16"></app-icon> Jadwal interview</a>
          <a class="btn btn-primary" routerLink="/backoffice/job-listings"><app-icon name="plus" [size]="16"></app-icon> Buat lowongan</a>
        </div>
      </div>

      <p class="alert alert-error" *ngIf="error" role="alert"><app-icon name="alert"></app-icon>{{ error }}</p>

      <section class="stat-strip" aria-label="Angka utama">
        <div class="stat"><span>Kandidat di Talent Pool</span><strong>{{ dashboard?.totalCandidates ?? '–' }}</strong><a routerLink="/backoffice/candidates">Lihat kandidat <app-icon name="chevron-right" [size]="14"></app-icon></a></div>
        <div class="stat"><span>Siap diproses</span><strong>{{ dashboard?.availableCandidates ?? '–' }}</strong><a routerLink="/backoffice/candidates">Status tersedia <app-icon name="chevron-right" [size]="14"></app-icon></a></div>
        <div class="stat"><span>Lowongan dibuka</span><strong>{{ dashboard?.openJobListings ?? '–' }}</strong><a routerLink="/backoffice/job-listings">Dari {{ dashboard?.totalJobListings ?? 0 }} lowongan <app-icon name="chevron-right" [size]="14"></app-icon></a></div>
        <div class="stat"><span>Lamaran masuk</span><strong>{{ dashboard?.totalApplications ?? '–' }}</strong><a routerLink="/backoffice/applications">Lihat lamaran <app-icon name="chevron-right" [size]="14"></app-icon></a></div>
      </section>

      <div class="bo-grid">
        <section class="panel span-7">
          <div class="panel-head">
            <div><h2>Tahapan lamaran</h2><p>Jumlah lamaran di setiap tahap rekrutmen.</p></div>
            <a class="btn btn-ghost btn-sm" routerLink="/backoffice/applications">Kelola</a>
          </div>
          <div class="panel-body">
            <div class="bars" *ngIf="applicationStages.length; else emptyPipeline">
              <div class="bar-row" *ngFor="let item of applicationStages">
                <span>{{ fmt.label(item.name) }}</span>
                <div class="bar-track"><div class="bar-fill" [class.accent]="item.name === 'HIRED'" [style.width.%]="percentage(item.count, applicationMax)"></div></div>
                <strong>{{ item.count }}</strong>
              </div>
            </div>
            <ng-template #emptyPipeline><p class="muted">Belum ada lamaran.</p></ng-template>
          </div>
        </section>

        <section class="panel span-5">
          <div class="panel-head">
            <div><h2>Interview terdekat</h2><p>{{ dashboard?.interviewsToday || 0 }} interview hari ini</p></div>
            <a class="btn btn-ghost btn-sm" routerLink="/backoffice/interviews">Semua</a>
          </div>
          <div class="panel-body">
            <div class="list-plain" *ngIf="upcoming.length; else noInterview">
              <div *ngFor="let item of upcoming">
                <div>
                  <strong>{{ item.candidateName }}</strong>
                  <small>{{ item.jobTitle || 'Talent Pool' }} · {{ item.interviewer }}</small>
                </div>
                <div style="text-align: right; flex: none">
                  <strong>{{ fmt.fullDate(item.scheduledAt) }}</strong>
                  <small>{{ fmt.time(item.scheduledAt) }} · {{ fmt.label(item.mode) }}</small>
                </div>
              </div>
            </div>
            <ng-template #noInterview><p class="muted">Tidak ada interview terjadwal.</p></ng-template>
          </div>
        </section>

        <section class="panel span-5">
          <div class="panel-head"><div><h2>Status kandidat</h2><p>Sebaran status di Talent Pool.</p></div></div>
          <div class="panel-body">
            <div class="donut-layout">
              <div class="donut" [style.background]="candidateDonutBackground" role="img" [attr.aria-label]="'Sebaran status dari ' + candidateTotal + ' kandidat'">
                <div><strong>{{ candidateTotal }}</strong><small>kandidat</small></div>
              </div>
              <div class="legend">
                <div *ngFor="let item of candidateStatuses; let i = index">
                  <i [style.background]="chartColors[i % chartColors.length]"></i>
                  <span>{{ fmt.label(item.name) }}</span>
                  <strong>{{ item.count }}</strong>
                </div>
                <p class="muted" *ngIf="!candidateStatuses.length">Belum ada data kandidat.</p>
              </div>
            </div>
          </div>
        </section>

        <section class="panel span-7">
          <div class="panel-head">
            <div><h2>Kandidat terbaru</h2><p>Profil yang terakhir diperbarui.</p></div>
            <a class="btn btn-ghost btn-sm" routerLink="/backoffice/candidates">Semua</a>
          </div>
          <div class="panel-body" style="padding-top: 8px; padding-bottom: 8px">
            <div class="list-plain" *ngIf="recent.length; else noRecent">
              <div *ngFor="let item of recent">
                <div class="person" style="min-width: 0">
                  <span class="avatar">{{ fmt.initials(item.fullName) }}</span>
                  <div><strong>{{ item.fullName }}</strong><small>{{ item.relatedPosition || 'Posisi belum diisi' }}</small></div>
                </div>
                <span class="tag" [ngClass]="'tag-' + fmt.tone(item.status)">{{ fmt.label(item.status) }}</span>
              </div>
            </div>
            <ng-template #noRecent><p class="muted">Belum ada kandidat.</p></ng-template>
          </div>
        </section>

        <section class="panel span-12">
          <div class="panel-head">
            <div><h2>Status lowongan</h2></div>
            <a class="btn btn-ghost btn-sm" routerLink="/backoffice/job-listings">Kelola</a>
          </div>
          <div class="panel-body">
            <div class="bars">
              <div class="bar-row" *ngFor="let item of jobListingStatuses">
                <span>{{ fmt.label(item.name) }}</span>
                <div class="bar-track"><div class="bar-fill" [style.background]="jobColor(item.name)" [style.width.%]="percentage(item.count, jobListingTotal)"></div></div>
                <strong>{{ item.count }}</strong>
              </div>
              <p class="muted" *ngIf="!jobListingStatuses.length">Belum ada lowongan.</p>
            </div>
          </div>
        </section>
      </div>
    </app-backoffice-layout>
  `,
})
export class BackofficeDashboardComponent implements OnInit {
  readonly fmt = FMT;
  dashboard: any;
  error = '';
  readonly today = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  readonly chartColors = ['#1e7a4e', '#24456b', '#c98a1c', '#c4161c', '#6b645e', '#8a5a3b', '#5b7fa6', '#b9b2ab', '#3f3934'];

  constructor(private api: BackofficeApiService) {}

  ngOnInit(): void {
    this.api.dashboard().subscribe({
      next: (value) => this.dashboard = value,
      error: () => this.error = 'Data ringkasan belum bisa dimuat. Muat ulang halaman untuk mencoba lagi.',
    });
  }

  get upcoming(): any[] {
    return (this.dashboard?.upcomingInterviewItems || []).slice(0, 4);
  }

  get recent(): any[] {
    return (this.dashboard?.recentCandidates || []).slice(0, 5);
  }

  get candidateStatuses(): Insight[] {
    return [...(this.dashboard?.candidateStatuses || [])].sort((a: Insight, b: Insight) => b.count - a.count);
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

  jobColor(status: string): string {
    return status === 'PUBLISHED' ? '#1e7a4e' : status === 'DRAFT' ? '#c98a1c' : '#b9b2ab';
  }

  get candidateDonutBackground(): string {
    if (!this.candidateStatuses.length || !this.candidateTotal) return 'conic-gradient(#e7e4e1 0deg 360deg)';
    let cursor = 0;
    const slices = this.candidateStatuses.map((item, index) => {
      const start = cursor;
      cursor += (Number(item.count || 0) / this.candidateTotal) * 360;
      return `${this.chartColors[index % this.chartColors.length]} ${start}deg ${cursor}deg`;
    });
    return `conic-gradient(${slices.join(', ')})`;
  }

  percentage(value: number, total: number): number {
    if (!total) return 0;
    return Math.max(0, Math.min(100, (Number(value || 0) / total) * 100));
  }
}

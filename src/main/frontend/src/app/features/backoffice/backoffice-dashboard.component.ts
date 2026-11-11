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
    
      @if (error) {
        <p class="alert alert-error" role="alert"><app-icon name="alert"></app-icon>{{ error }}</p>
      }
    
      <section class="stat-strip" aria-label="Angka utama">
        <div class="stat"><span>Kandidat di Talent Pool</span><strong>{{ dashboard?.totalCandidates ?? '–' }}</strong><a routerLink="/backoffice/candidates">Lihat kandidat <app-icon name="chevron-right" [size]="14"></app-icon></a></div>
        <div class="stat"><span>Siap diproses</span><strong>{{ dashboard?.availableCandidates ?? '–' }}</strong><a routerLink="/backoffice/candidates">Status tersedia <app-icon name="chevron-right" [size]="14"></app-icon></a></div>
        <div class="stat"><span>Lowongan dibuka</span><strong>{{ dashboard?.openJobListings ?? '–' }}</strong><a routerLink="/backoffice/job-listings">Dari {{ dashboard?.totalJobListings ?? 0 }} lowongan <app-icon name="chevron-right" [size]="14"></app-icon></a></div>
        <div class="stat"><span>Lamaran masuk</span><strong>{{ dashboard?.totalApplications ?? '–' }}</strong><a routerLink="/backoffice/applications">Lihat pipeline <app-icon name="chevron-right" [size]="14"></app-icon></a></div>
      </section>
    
      <div class="bo-grid">
        <section class="panel span-7">
          <div class="panel-head">
            <div><h2>Tahapan lamaran</h2><p>Jumlah lamaran di setiap tahap rekrutmen.</p></div>
            <a class="btn btn-ghost btn-sm" routerLink="/backoffice/applications">Kelola</a>
          </div>
          <div class="panel-body">
            @if (applicationStages.length) {
              <div class="bars">
                @for (item of applicationStages; track item) {
                  <div class="bar-row">
                    <span>{{ fmt.label(item.name) }}</span>
                    <div class="bar-track"><div class="bar-fill" [class.accent]="item.name === 'HIRED'" [style.width.%]="percentage(item.count, applicationMax)"></div></div>
                    <strong>{{ item.count }}</strong>
                  </div>
                }
              </div>
            } @else {
              <p class="muted">Belum ada lamaran.</p>
            }
          </div>
        </section>
    
        <section class="panel span-5">
          <div class="panel-head">
            <div><h2>Interview terdekat</h2><p>{{ dashboard?.interviewsToday || 0 }} interview hari ini</p></div>
            <a class="btn btn-ghost btn-sm" routerLink="/backoffice/interviews">Semua</a>
          </div>
          <div class="panel-body">
            @if (upcoming.length) {
              <div class="list-plain">
                @for (item of upcoming; track item) {
                  <div>
                    <div>
                      <strong>{{ item.candidateName }}</strong>
                      <small>{{ item.jobTitle || 'Talent Pool' }} · {{ item.interviewer }}</small>
                    </div>
                    <div style="text-align: right; flex: none">
                      <strong>{{ fmt.fullDate(item.scheduledAt) }}</strong>
                      <small>{{ fmt.time(item.scheduledAt) }} · {{ fmt.label(item.mode) }}</small>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="muted">Tidak ada interview terjadwal.</p>
            }
          </div>
        </section>
    
        <section class="panel span-7">
          <div class="panel-head"><div><h2>Pertumbuhan kandidat</h2><p>Jumlah kandidat yang masuk setiap bulan.</p></div></div>
          <div class="panel-body">
            <div class="growth-chart" role="img" aria-label="Grafik jumlah kandidat baru per bulan">
              @for (m of growth; track m.month) {
                <div class="growth-col">
                  <strong>{{ m.count }}</strong>
                  <div class="growth-bar" [style.height.%]="growthHeight(m.count)"></div>
                  <span>{{ monthLabel(m.month) }}</span>
                </div>
              }
              @if (!growth.length) {
                <p class="muted">Belum ada data.</p>
              }
            </div>
          </div>
        </section>

        <section class="panel span-5">
          <div class="panel-head"><div><h2>Status review kandidat</h2><p>Sebaran kandidat berdasarkan status review.</p></div></div>
          <div class="panel-body">
            <div class="donut-layout">
              <div class="donut" [style.background]="reviewDonutBackground" role="img" [attr.aria-label]="'Sudah di review ' + reviewed + ' dari ' + reviewTotal + ' kandidat'">
                <div><strong>{{ reviewTotal }}</strong><small>kandidat</small></div>
              </div>
              <div class="legend">
                <div><i style="background: #b91c24"></i><span>Sudah di review</span><strong>{{ reviewed }} ({{ reviewPercent(reviewed) }}%)</strong></div>
                <div><i style="background: #f1b6b9"></i><span>Belum di review</span><strong>{{ unreviewed }} ({{ reviewPercent(unreviewed) }}%)</strong></div>
              </div>
            </div>
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
                @for (item of candidateStatuses; track item; let i = $index) {
                  <div>
                    <i [style.background]="chartColors[i % chartColors.length]"></i>
                    <span>{{ fmt.label(item.name) }}</span>
                    <strong>{{ item.count }}</strong>
                  </div>
                }
                @if (!candidateStatuses.length) {
                  <p class="muted">Belum ada data kandidat.</p>
                }
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
            @if (recent.length) {
              <div class="list-plain">
                @for (item of recent; track item) {
                  <div>
                    <div class="person" style="min-width: 0">
                      <span class="avatar">{{ fmt.initials(item.fullName) }}</span>
                      <div><strong>{{ item.fullName }}</strong><small>{{ item.relatedPosition || 'Posisi belum diisi' }}</small></div>
                    </div>
                    <span class="tag" [ngClass]="'tag-' + fmt.tone(item.status)">{{ fmt.label(item.status) }}</span>
                  </div>
                }
              </div>
            } @else {
              <p class="muted">Belum ada kandidat.</p>
            }
          </div>
        </section>
    
        <section class="panel span-12">
          <div class="panel-head">
            <div><h2>Status lowongan</h2></div>
            <a class="btn btn-ghost btn-sm" routerLink="/backoffice/job-listings">Kelola</a>
          </div>
          <div class="panel-body">
            <div class="bars">
              @for (item of jobListingStatuses; track item) {
                <div class="bar-row">
                  <span>{{ fmt.label(item.name) }}</span>
                  <div class="bar-track"><div class="bar-fill" [style.background]="jobColor(item.name)" [style.width.%]="percentage(item.count, jobListingTotal)"></div></div>
                  <strong>{{ item.count }}</strong>
                </div>
              }
              @if (!jobListingStatuses.length) {
                <p class="muted">Belum ada lowongan.</p>
              }
            </div>
          </div>
        </section>
      </div>
    </app-backoffice-layout>
    `,
    styles: [`
      .growth-chart { display: flex; align-items: flex-end; gap: 14px; height: 200px; padding-top: 8px; }
      .growth-col { flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; }
      .growth-bar { width: 100%; max-width: 64px; background: #b91c24; border-radius: 4px 4px 0 0; min-height: 2px; }
      .growth-col span { font-size: 13px; color: #6f6561; }
    `]
})
export class BackofficeDashboardComponent implements OnInit {
  readonly fmt = FMT;
  dashboard: any;
  summary: any;
  error = '';
  readonly today = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  readonly chartColors = ['#1e7a4e', '#24456b', '#c98a1c', '#c4161c', '#6b645e', '#8a5a3b', '#5b7fa6', '#b9b2ab', '#3f3934'];

  constructor(private api: BackofficeApiService) {}

  ngOnInit(): void {
    this.api.dashboard().subscribe({
      next: (value) => this.dashboard = value,
      error: () => this.error = 'Data ringkasan belum bisa dimuat. Muat ulang halaman untuk mencoba lagi.',
    });
    // Data grafik pertumbuhan dan status review; kegagalannya tidak mengganggu panel lain.
    this.api.executiveSummary().subscribe({ next: (value) => this.summary = value, error: () => {} });
  }

  private static readonly MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  get growth(): { month: string; count: number }[] {
    return this.summary?.monthlyGrowth || [];
  }

  monthLabel(yearMonth: string): string {
    return BackofficeDashboardComponent.MONTHS[Number(yearMonth.split('-')[1]) - 1] ?? yearMonth;
  }

  growthHeight(count: number): number {
    const max = Math.max(1, ...this.growth.map((m) => m.count));
    return Math.max(2, (count / max) * 80);
  }

  get reviewed(): number { return this.summary?.reviewedCandidates ?? 0; }
  get unreviewed(): number { return this.summary?.unreviewedCandidates ?? 0; }
  get reviewTotal(): number { return this.reviewed + this.unreviewed; }

  reviewPercent(value: number): number {
    return this.reviewTotal ? Math.round((value / this.reviewTotal) * 100) : 0;
  }

  get reviewDonutBackground(): string {
    if (!this.reviewTotal) return 'conic-gradient(#e7e4e1 0deg 360deg)';
    const deg = (this.reviewed / this.reviewTotal) * 360;
    return `conic-gradient(#b91c24 0deg ${deg}deg, #f1b6b9 ${deg}deg 360deg)`;
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

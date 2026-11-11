import { Component, OnInit } from '@angular/core';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';
import { BackofficeAuthService } from '../../core/service/api/backoffice-auth.service';
import { SiteContentService } from '../../core/service/api/site-content.service';
import { DEFAULT_BRAND_LOGO } from '../public/site-defaults';
import { FMT } from '../../shared/labels';

interface MonthlyCount { month: string; count: number; }
interface PotentialCandidate { fullName: string; position: string | null; inProcess: boolean; }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** Ringkasan khusus pimpinan: hanya baca, tanpa menu kerja recruiter. */
@Component({
  selector: 'app-backoffice-executive-summary',
  template: `
    <div class="es">
      <header class="es-top">
        <img [src]="brandLogo" alt="Sarinah">
        <button type="button" class="es-logout" (click)="auth.logout()">Keluar</button>
      </header>

      <main class="es-main">
        @if (error) {
          <p class="es-error" role="alert">{{ error }}</p>
        }

        <section class="es-cards" aria-label="Angka utama">
          <div class="es-card"><span>Total Kandidat<br>di Talent Pool</span><strong>{{ num(data?.totalCandidates) }}</strong></div>
          <div class="es-card"><span>Total Kandidat<br>Masuk Proses Rekrutmen</span><strong>{{ num(data?.candidatesInRecruitment) }}</strong></div>
          <div class="es-card"><span>Total Kandidat<br>di Tahap Interview</span><strong>{{ num(data?.candidatesInInterview) }}</strong></div>
          <div class="es-card"><span>Total Kandidat<br>Diterima</span><strong>{{ num(data?.candidatesHired) }}</strong></div>
        </section>

        <div class="es-grid">
          <section class="es-panel es-wide">
            <h2>Pertumbuhan Kandidat</h2>
            <p class="es-sub">Jumlah kandidat yang masuk setiap bulan</p>
            <div class="es-chart" role="img" aria-label="Grafik jumlah kandidat baru per bulan">
              @for (m of growth; track m.month) {
                <div class="es-bar-col">
                  <strong>{{ m.count }}</strong>
                  <div class="es-bar" [style.height.%]="barHeight(m.count)"></div>
                  <span>{{ monthLabel(m.month) }}</span>
                </div>
              }
            </div>
          </section>

          <section class="es-panel">
            <h2>Interview Terdekat</h2>
            <p class="es-sub">Jadwal interview berikutnya</p>
            @if (interviews.length) {
              <ul class="es-list">
                @for (item of interviews; track item) {
                  <li>
                    <div>
                      <strong>{{ item.candidateName }}</strong>
                      <small>{{ item.jobTitle || 'Talent Pool' }} · {{ item.interviewer }}</small>
                    </div>
                    <div class="es-when">
                      <strong>{{ fmt.fullDate(item.scheduledAt) }}</strong>
                      <small>{{ fmt.time(item.scheduledAt) }}</small>
                    </div>
                  </li>
                }
              </ul>
            } @else {
              <p class="es-empty">Tidak ada interview terjadwal.</p>
            }
          </section>

          <section class="es-panel es-wide">
            <h2>Kandidat Potential</h2>
            <p class="es-sub">Kandidat dengan potensi tinggi untuk diproyeksikan</p>
            @if (potential.length) {
              <table class="es-table">
                <thead><tr><th>No</th><th>Nama Kandidat</th><th>Posisi</th><th>Status</th></tr></thead>
                <tbody>
                  @for (c of potential; track c.fullName; let i = $index) {
                    <tr>
                      <td>{{ i + 1 }}</td>
                      <td>{{ c.fullName }}</td>
                      <td>{{ c.position || '-' }}</td>
                      <td><span class="es-tag" [class.busy]="c.inProcess">{{ c.inProcess ? 'Dalam proses' : 'Tersedia' }}</span></td>
                    </tr>
                  }
                </tbody>
              </table>
            } @else {
              <p class="es-empty">Belum ada kandidat potensial.</p>
            }
          </section>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .es { min-height: 100vh; background: #faf7f6; color: #2b2523; font-family: inherit; }
    .es-top { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; }
    .es-top img { height: 44px; width: auto; }
    .es-logout { border: 1px solid #d9cfcb; background: #fff; border-radius: 999px; padding: 8px 18px; cursor: pointer; font: inherit; }
    .es-main { max-width: 1200px; margin: 0 auto; padding: 8px 24px 40px; }
    .es-error { background: #fdecec; color: #8a1118; border-radius: 10px; padding: 10px 14px; }
    .es-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
    .es-card { background: #fff; border-radius: 16px; padding: 18px 20px; box-shadow: 0 1px 4px rgba(0,0,0,.06); display: flex; flex-direction: column; gap: 6px; }
    .es-card span { font-size: 14px; color: #5b524e; line-height: 1.35; }
    .es-card strong { font-size: 36px; line-height: 1.1; }
    .es-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .es-panel { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,.06); min-width: 0; }
    .es-panel h2 { margin: 0; font-size: 18px; }
    .es-sub { margin: 2px 0 16px; font-size: 13px; color: #6f6561; }
    .es-chart { display: flex; align-items: flex-end; gap: 14px; height: 220px; padding-top: 8px; }
    .es-bar-col { flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; }
    .es-bar { width: 100%; max-width: 64px; background: #b91c24; border-radius: 4px 4px 0 0; min-height: 2px; }
    .es-bar-col span { font-size: 13px; color: #5b524e; }
    .es-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
    .es-list li { display: flex; justify-content: space-between; gap: 12px; }
    .es-list small { display: block; color: #6f6561; }
    .es-when { text-align: right; flex: none; }
    .es-empty { text-align: center; color: #6f6561; padding: 40px 0; font-weight: 600; }
    .es-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .es-table th { text-align: left; background: #f4efed; padding: 8px 10px; font-size: 12px; }
    .es-table td { padding: 10px; border-bottom: 1px solid #f0eae7; }
    .es-tag { background: #e3f4e8; color: #17703a; border-radius: 999px; padding: 2px 10px; font-size: 12px; }
    .es-tag.busy { background: #fff1d6; color: #8a5a00; }
    @media (max-width: 900px) {
      .es-cards { grid-template-columns: repeat(2, 1fr); }
      .es-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 480px) { .es-cards { grid-template-columns: 1fr; } .es-chart { gap: 6px; } }
  `],
})
export class BackofficeExecutiveSummaryComponent implements OnInit {
  readonly fmt = FMT;
  brandLogo = DEFAULT_BRAND_LOGO;
  data: any = null;
  error = '';

  constructor(
    private api: BackofficeApiService,
    readonly auth: BackofficeAuthService,
    site: SiteContentService,
  ) {
    site.branding().subscribe((branding) => (this.brandLogo = branding.brandLogo));
  }

  ngOnInit(): void {
    this.api.executiveSummary().subscribe({
      next: (data) => (this.data = data),
      error: () => (this.error = 'Gagal memuat ringkasan. Coba muat ulang halaman.'),
    });
  }

  get growth(): MonthlyCount[] { return this.data?.monthlyGrowth ?? []; }
  get interviews(): any[] { return this.data?.upcomingInterviews ?? []; }
  get potential(): PotentialCandidate[] { return this.data?.potentialCandidates ?? []; }

  num(value: number | null | undefined): string {
    return value == null ? '–' : new Intl.NumberFormat('id-ID').format(value);
  }

  monthLabel(yearMonth: string): string {
    const index = Number(yearMonth.split('-')[1]) - 1;
    return MONTHS[index] ?? yearMonth;
  }

  barHeight(count: number): number {
    const max = Math.max(1, ...this.growth.map((m) => m.count));
    return Math.max(2, (count / max) * 80);
  }
}

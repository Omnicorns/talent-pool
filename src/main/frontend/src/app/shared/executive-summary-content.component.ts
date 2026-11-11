import { Component, OnInit } from '@angular/core';
import { BackofficeApiService } from '../core/service/api/backoffice-api.service';
import { FMT } from './labels';

interface MonthlyCount { month: string; count: number; }
interface PotentialCandidate { fullName: string; position: string | null; inProcess: boolean; }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/**
 * Isi ringkasan rekrutmen (kartu angka, grafik, interview, status review, kandidat potensial).
 * Dipakai bersama oleh dashboard recruiter dan halaman ringkasan pimpinan agar tampilannya identik.
 */
@Component({
  selector: 'app-executive-summary-content',
  template: `

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

      <section class="es-panel">
        <h2>Status Kandidat</h2>
        <p class="es-sub">Sebaran kandidat berdasarkan status review</p>
        <div class="es-donut-wrap">
          <div class="es-donut" [style.background]="donutBackground" role="img"
            [attr.aria-label]="'Sudah di review ' + reviewed + ' dari ' + total + ' kandidat'">
            <div><strong>{{ num(total) }}</strong><small>Kandidat</small></div>
          </div>
          <ul class="es-legend">
            <li><i class="dot done"></i><span>Sudah di Review</span><strong>{{ num(reviewed) }}</strong><em>{{ percent(reviewed) }}%</em></li>
            <li><i class="dot todo"></i><span>Belum di Review</span><strong>{{ num(unreviewed) }}</strong><em>{{ percent(unreviewed) }}%</em></li>
          </ul>
        </div>
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
  `,
  styles: [`
    :host { display: block; }

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
    .es-donut-wrap { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
    .es-donut { width: 150px; height: 150px; border-radius: 50%; display: grid; place-items: center; flex: none; }
    .es-donut > div { width: 98px; height: 98px; border-radius: 50%; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .es-donut strong { font-size: 22px; line-height: 1.1; }
    .es-donut small { color: #6f6561; font-size: 12px; }
    .es-legend { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; flex: 1; min-width: 200px; }
    .es-legend li { display: flex; align-items: center; gap: 10px; }
    .es-legend span { flex: 1; }
    .es-legend em { font-style: normal; background: #fbe4e5; color: #8a1118; border-radius: 999px; padding: 2px 10px; font-size: 12px; min-width: 48px; text-align: center; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .dot.done { background: #b91c24; }
    .dot.todo { background: #f1b6b9; }
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
export class ExecutiveSummaryContentComponent implements OnInit {
  readonly fmt = FMT;
  data: any = null;
  error = '';

  constructor(private api: BackofficeApiService) {}

  ngOnInit(): void {
    this.api.executiveSummary().subscribe({
      next: (data) => (this.data = data),
      error: () => (this.error = 'Gagal memuat ringkasan. Coba muat ulang halaman.'),
    });
  }

  get total(): number { return this.data?.totalCandidates ?? 0; }
  get reviewed(): number { return this.data?.reviewedCandidates ?? 0; }
  get unreviewed(): number { return this.data?.unreviewedCandidates ?? 0; }

  percent(value: number): number {
    return this.total ? Math.round((value / this.total) * 100) : 0;
  }

  get donutBackground(): string {
    if (!this.total) return '#f1e6e4';
    const deg = (this.reviewed / this.total) * 360;
    return `conic-gradient(#b91c24 0deg ${deg}deg, #f1b6b9 ${deg}deg 360deg)`;
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

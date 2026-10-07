import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackofficeOverlayDirective } from '../../shared/backoffice-overlay.directive';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';
import { FMT } from '../../shared/labels';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-backoffice-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule, BackofficeLayoutComponent, BackofficeOverlayDirective, IconComponent],
  template: `
    <app-backoffice-layout active="interviews">
      <div class="bo-head">
        <div>
          <h1>Interview</h1>
          <p>Jadwal interview kandidat. Ubah status setelah interview selesai untuk mencatat hasilnya.</p>
        </div>
        <div class="bo-actions">
          <button class="btn btn-primary" (click)="openCreate()"><app-icon name="plus" [size]="16"></app-icon> Jadwalkan interview</button>
        </div>
      </div>

      <div class="chips" role="tablist" aria-label="Filter interview">
        <button type="button" role="tab" class="btn btn-sm" *ngFor="let f of filters" [class.btn-primary]="filter === f.id" [class.btn-secondary]="filter !== f.id" [attr.aria-selected]="filter === f.id" (click)="filter = f.id">{{ f.label }} ({{ countFor(f.id) }})</button>
      </div>

      <section class="table-card responsive">
        <div class="table-meta"><span><strong>{{ visible.length }}</strong> interview</span><span *ngIf="loading">Memuat…</span></div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr><th>Jadwal</th><th>Kandidat</th><th>Cara dan tempat</th><th>Pewawancara</th><th>Status</th><th>Hasil</th><th><span class="sr-only">Aksi</span></th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of visible">
                <td><strong>{{ fmt.fullDate(item.scheduledAt) }}</strong><small>{{ fmt.time(item.scheduledAt) }} · {{ item.durationMinutes }} menit</small></td>
                <td><strong>{{ item.candidateName }}</strong><small>{{ item.jobTitle || 'Talent Pool' }}</small></td>
                <td style="max-width: 240px"><strong>{{ fmt.label(item.mode) }}</strong><small style="overflow-wrap: anywhere">{{ item.locationOrLink || '-' }}</small></td>
                <td>{{ item.interviewer }}</td>
                <td>
                  <select class="select-inline" [ngModel]="item.status" (ngModelChange)="changeStatus(item, $event)" [attr.aria-label]="'Status interview ' + item.candidateName">
                    <option *ngFor="let s of statuses" [value]="s">{{ fmt.label(s) }}</option>
                  </select>
                </td>
                <td>
                  <select class="select-inline" [(ngModel)]="item.result" [disabled]="item.status !== 'COMPLETED'" [attr.aria-label]="'Hasil interview ' + item.candidateName" style="min-width: 120px">
                    <option *ngFor="let r of results" [value]="r">{{ fmt.label(r) }}</option>
                  </select>
                </td>
                <td class="actions">
                  <button class="icon-btn" (click)="openEdit(item)" [attr.aria-label]="'Ubah interview ' + item.candidateName"><app-icon name="edit" [size]="16"></app-icon></button>
                  <button class="icon-btn" (click)="deleteInterview(item)" [attr.aria-label]="'Hapus interview ' + item.candidateName"><app-icon name="trash" [size]="16"></app-icon></button>
                </td>
              </tr>
              <tr *ngIf="!visible.length && !loading"><td colspan="7" class="empty-cell">Tidak ada interview di kategori ini.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="cards">
          <article *ngFor="let item of visible">
            <div class="card-head">
              <div><strong>{{ item.candidateName }}</strong><small>{{ item.jobTitle || 'Talent Pool' }}</small></div>
              <span class="tag" [ngClass]="'tag-' + fmt.tone(item.status)">{{ fmt.label(item.status) }}</span>
            </div>
            <div class="card-meta">
              <div><span>Jadwal</span>{{ fmt.fullDate(item.scheduledAt) }}, {{ fmt.time(item.scheduledAt) }}</div>
              <div><span>Cara</span>{{ fmt.label(item.mode) }}</div>
              <div><span>Pewawancara</span>{{ item.interviewer }}</div>
              <div><span>Tempat</span><span style="color: var(--ink); font-size: 13.5px; overflow-wrap: anywhere">{{ item.locationOrLink || '-' }}</span></div>
            </div>
            <div class="card-actions">
              <select class="select-inline" [ngModel]="item.status" (ngModelChange)="changeStatus(item, $event)" aria-label="Status">
                <option *ngFor="let s of statuses" [value]="s">{{ fmt.label(s) }}</option>
              </select>
              <select class="select-inline" [(ngModel)]="item.result" [disabled]="item.status !== 'COMPLETED'" aria-label="Hasil">
                <option *ngFor="let r of results" [value]="r">{{ fmt.label(r) }}</option>
              </select>
            </div>
            <div class="card-actions">
              <button class="btn btn-secondary btn-sm" (click)="openEdit(item)">Ubah</button>
              <button class="btn btn-ghost btn-sm" style="color: var(--negative)" (click)="deleteInterview(item)">Hapus</button>
            </div>
          </article>
          <p class="muted" style="padding: 32px 18px; text-align: center" *ngIf="!visible.length && !loading">Tidak ada interview.</p>
        </div>
      </section>

      <div class="drawer-backdrop" *ngIf="drawerOpen" (click)="closeOnBackdrop($event)">
        <aside class="drawer" [boOverlay]="true" (overlayClose)="closeDrawer()" role="dialog" aria-modal="true" aria-labelledby="interview-form-title">
          <header class="drawer-head">
            <div>
              <h2 id="interview-form-title">{{ editingId ? 'Ubah interview' : 'Jadwalkan interview' }}</h2>
              <p>{{ selectedCandidateName || 'Pilih kandidat dan atur jadwalnya.' }}</p>
            </div>
            <button type="button" class="icon-btn" (click)="closeDrawer()" aria-label="Tutup"><app-icon name="x"></app-icon></button>
          </header>

          <div class="drawer-body">
            <div class="form-stack">
              <label class="field">Kandidat
                <select [(ngModel)]="form.candidateId" [disabled]="!!lockedCandidateId">
                  <option [ngValue]="null">Pilih kandidat</option>
                  <option *ngFor="let candidate of candidates" [ngValue]="candidate.id">{{ candidate.fullName }}</option>
                </select>
              </label>
              <label class="field">Untuk lowongan
                <select [(ngModel)]="form.jobListingId" [disabled]="!!lockedJobId">
                  <option [ngValue]="null">Talent Pool (tanpa lowongan)</option>
                  <option *ngFor="let job of jobs" [ngValue]="job.id">{{ job.title }}</option>
                </select>
              </label>
              <div class="form-grid">
                <label class="field">Tanggal dan jam<input type="datetime-local" [(ngModel)]="form.scheduledAt"></label>
                <label class="field">Durasi (menit)<input type="number" min="15" max="480" [(ngModel)]="form.durationMinutes"></label>
                <label class="field">Cara interview
                  <select [(ngModel)]="form.mode">
                    <option value="ONLINE">Online</option>
                    <option value="ONSITE">Tatap muka</option>
                    <option value="PHONE">Telepon</option>
                  </select>
                </label>
                <label class="field">Pewawancara<input [(ngModel)]="form.interviewer" placeholder="Nama dan jabatan"></label>
              </div>
              <label class="field">{{ form.mode === 'ONLINE' ? 'Tautan meeting' : form.mode === 'PHONE' ? 'Nomor telepon' : 'Lokasi' }}
                <input [(ngModel)]="form.locationOrLink" [placeholder]="form.mode === 'ONLINE' ? 'https://meet.google.com/…' : form.mode === 'PHONE' ? '08xxxxxxxxxx' : 'Gedung Sarinah lantai …'">
              </label>
              <label class="field">Catatan <span class="opt">(opsional)</span><textarea [(ngModel)]="form.notes" rows="4"></textarea></label>
              <div class="alert alert-error" *ngIf="error" role="alert"><app-icon name="alert"></app-icon><span>{{ error }}</span></div>
            </div>
          </div>

          <footer class="drawer-foot">
            <button class="btn btn-secondary" (click)="closeDrawer()" [disabled]="saving">Batal</button>
            <button class="btn btn-primary" (click)="save()" [disabled]="saving">{{ saving ? 'Menyimpan…' : (editingId ? 'Simpan perubahan' : 'Simpan jadwal') }}</button>
          </footer>
        </aside>
      </div>
    </app-backoffice-layout>
  `,
})
export class BackofficeInterviewsComponent implements OnInit {
  readonly fmt = FMT;
  readonly statuses = ['SCHEDULED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED'];
  readonly results = ['PENDING', 'PASSED', 'FAILED', 'HOLD'];
  readonly filters = [
    { id: 'upcoming', label: 'Akan datang' },
    { id: 'COMPLETED', label: 'Selesai' },
    { id: 'CANCELLED', label: 'Dibatalkan' },
    { id: 'all', label: 'Semua' },
  ];
  filter = 'upcoming';
  rows: any[] = [];
  candidates: any[] = [];
  jobs: any[] = [];
  loading = false;
  saving = false;
  drawerOpen = false;
  editingId: string | null = null;
  lockedCandidateId: string | null = null;
  lockedJobId: string | null = null;
  selectedCandidateName = '';
  error = '';

  form: any = this.emptyForm();

  constructor(
    private api: BackofficeApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
    this.api.candidates('').subscribe({ next: (result) => this.candidates = result?.content || [] });
    this.api.jobListings('').subscribe({ next: (result) => this.jobs = result?.content || [] });

    const candidateId = this.route.snapshot.queryParamMap.get('candidateId');
    const jobId = this.route.snapshot.queryParamMap.get('jobId');
    if (candidateId) {
      setTimeout(() => this.openFromApplication(candidateId, jobId), 250);
    }
  }

  private matches(item: any, filter: string): boolean {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return item.status === 'SCHEDULED' || item.status === 'RESCHEDULED';
    return item.status === filter;
  }

  get visible(): any[] {
    return this.rows.filter((item) => this.matches(item, this.filter));
  }

  countFor(filter: string): number {
    return this.rows.filter((item) => this.matches(item, filter)).length;
  }

  load(): void {
    this.loading = true;
    this.api.interviews().subscribe({
      next: (result) => {
        this.rows = result?.content || [];
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  openFromApplication(candidateId: string, jobId: string | null): void {
    const existing = this.rows.find((item) =>
      item.candidateId === candidateId &&
      (!jobId || item.jobListingId === jobId) &&
      item.status !== 'CANCELLED'
    );

    if (existing) {
      this.openEdit(existing);
      return;
    }

    this.lockedCandidateId = candidateId;
    this.lockedJobId = jobId;
    this.form = {
      ...this.emptyForm(),
      candidateId,
      jobListingId: jobId,
    };
    this.selectedCandidateName =
      this.candidates.find((item) => item.id === candidateId)?.fullName || 'Kandidat';
    this.drawerOpen = true;
  }

  openCreate(): void {
    this.editingId = null;
    this.lockedCandidateId = null;
    this.lockedJobId = null;
    this.selectedCandidateName = '';
    this.form = this.emptyForm();
    this.error = '';
    this.drawerOpen = true;
  }

  openEdit(item: any): void {
    this.editingId = item.id;
    this.lockedCandidateId = item.candidateId;
    this.lockedJobId = item.jobListingId || null;
    this.selectedCandidateName = item.candidateName || '';
    this.form = {
      candidateId: item.candidateId,
      jobListingId: item.jobListingId || null,
      scheduledAt: this.toLocalDateTime(item.scheduledAt),
      durationMinutes: item.durationMinutes || 60,
      mode: item.mode || 'ONLINE',
      locationOrLink: item.locationOrLink || '',
      interviewer: item.interviewer || '',
      notes: item.notes || '',
    };
    this.error = '';
    this.drawerOpen = true;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.editingId = null;
    this.lockedCandidateId = null;
    this.lockedJobId = null;
    this.selectedCandidateName = '';
    this.error = '';

    if (this.route.snapshot.queryParamMap.has('candidateId')) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    }
  }

  closeOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('drawer-backdrop')) {
      this.closeDrawer();
    }
  }

  save(): void {
    this.error = '';

    if (!this.form.candidateId) {
      this.error = 'Pilih kandidat.';
      return;
    }
    if (!this.form.scheduledAt) {
      this.error = 'Isi tanggal dan jam interview.';
      return;
    }
    if (!this.form.interviewer?.trim()) {
      this.error = 'Isi nama pewawancara.';
      return;
    }
    if ((this.form.mode === 'ONLINE' || this.form.mode === 'ONSITE') && !this.form.locationOrLink?.trim()) {
      this.error = 'Isi tautan meeting atau lokasi interview.';
      return;
    }

    const payload = {
      candidateId: this.form.candidateId,
      jobListingId: this.form.jobListingId || null,
      scheduledAt: new Date(this.form.scheduledAt).toISOString(),
      durationMinutes: Number(this.form.durationMinutes || 60),
      mode: this.form.mode,
      locationOrLink: this.form.locationOrLink?.trim() || null,
      interviewer: this.form.interviewer.trim(),
      notes: this.form.notes?.trim() || null,
    };

    this.saving = true;
    const request = this.editingId
      ? this.api.updateInterview(this.editingId, payload)
      : this.api.createInterview(payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.closeDrawer();
        this.load();
      },
      error: (error) => {
        this.saving = false;
        this.error = error?.error?.message || 'Jadwal belum tersimpan. Periksa isian lalu coba lagi.';
      },
    });
  }

  deleteInterview(item: any): void {
    if (!window.confirm(`Hapus jadwal interview ${item.candidateName}?`)) return;

    this.api.deleteInterview(item.id).subscribe({
      next: () => this.load(),
      error: (error) => window.alert(error?.error?.message || 'Jadwal belum terhapus. Coba lagi.'),
    });
  }

  changeStatus(item: any, status: string): void {
    let result = item.result;
    if (status === 'COMPLETED' && (!result || result === 'PENDING')) {
      result = 'HOLD';
    }
    if (status === 'CANCELLED') result = 'PENDING';

    this.api.updateInterviewStatus(item.id, status, result, item.feedback || null).subscribe({
      next: (updated) => {
        item.status = updated.status;
        item.result = updated.result;
      },
    });
  }

  private emptyForm(): any {
    return {
      candidateId: null,
      jobListingId: null,
      scheduledAt: '',
      durationMinutes: 60,
      mode: 'ONLINE',
      locationOrLink: '',
      interviewer: '',
      notes: '',
    };
  }

  private toLocalDateTime(value: string): string {
    if (!value) return '';
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0,16);
  }
}

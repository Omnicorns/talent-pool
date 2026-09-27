import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';

@Component({
  selector: 'app-backoffice-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule, BackofficeLayoutComponent],
  template: `
    <app-backoffice-layout active="interviews">
      <div class="bo-page-head">
        <div>
          <span class="bo-kicker">INTERVIEW SCHEDULE</span>
          <h1>Interviews</h1>
          <p>Pantau jadwal interview kandidat, edit jadwal, dan update hasil prosesnya.</p>
        </div>
        <div class="bo-head-actions">
          <button class="bo-primary" (click)="openCreate()">＋ Tambah Interview</button>
        </div>
      </div>

      <section class="bo-table-card">
        <div class="bo-table-meta">
          <strong>{{ rows.length }} interview</strong>
          <span *ngIf="loading">Memuat...</span>
        </div>
        <div class="bo-table-wrap">
          <table class="bo-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job</th>
                <th>Schedule</th>
                <th>Mode</th>
                <th>Interviewer</th>
                <th>Status</th>
                <th>Result</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of rows">
                <td><strong>{{ item.candidateName }}</strong></td>
                <td>{{ item.jobTitle || 'General Talent Pool' }}</td>
                <td>
                  <strong>{{ item.scheduledAt | date:'dd MMM yyyy' }}</strong>
                  <small>{{ item.scheduledAt | date:'HH:mm' }} • {{ item.durationMinutes }} menit</small>
                </td>
                <td><span class="bo-badge">{{ item.mode }}</span><small>{{ item.locationOrLink || '-' }}</small></td>
                <td>{{ item.interviewer }}</td>
                <td>
                  <select class="bo-stage-select" [ngModel]="item.status" (ngModelChange)="changeStatus(item, $event)">
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="RESCHEDULED">Rescheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
                <td>
                  <select class="bo-stage-select" [(ngModel)]="item.result" [disabled]="item.status !== 'COMPLETED'">
                    <option value="PENDING">Pending</option>
                    <option value="PASSED">Passed</option>
                    <option value="FAILED">Failed</option>
                    <option value="HOLD">Hold</option>
                  </select>
                </td>
                <td>
                  <div class="bo-inline-actions">
                    <button class="bo-secondary" (click)="openEdit(item)">Edit</button>
                    <button class="bo-danger" (click)="deleteInterview(item)">Delete</button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!rows.length && !loading">
                <td colspan="8" class="bo-empty-cell">Belum ada jadwal interview.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="bo-mobile-list bo-interview-mobile-list">
        <article class="bo-mobile-card" *ngFor="let item of rows">
          <div class="bo-mobile-card-head">
            <div>
              <strong>{{ item.candidateName }}</strong>
              <small>{{ item.jobTitle || 'General Talent Pool' }}</small>
            </div>
            <span class="bo-badge">{{ item.mode }}</span>
          </div>

          <div class="bo-mobile-meta-grid">
            <div><span>Schedule</span><strong>{{ item.scheduledAt | date:'dd MMM yyyy, HH:mm' }}</strong></div>
            <div><span>Interviewer</span><strong>{{ item.interviewer }}</strong></div>
            <div><span>Location</span><strong>{{ item.locationOrLink || '-' }}</strong></div>
          </div>

          <div class="bo-mobile-controls">
            <label>Status
              <select class="bo-stage-select" [ngModel]="item.status" (ngModelChange)="changeStatus(item, $event)">
                <option value="SCHEDULED">Scheduled</option>
                <option value="RESCHEDULED">Rescheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </label>
            <label>Result
              <select class="bo-stage-select" [(ngModel)]="item.result" [disabled]="item.status !== 'COMPLETED'">
                <option value="PENDING">Pending</option>
                <option value="PASSED">Passed</option>
                <option value="FAILED">Failed</option>
                <option value="HOLD">Hold</option>
              </select>
            </label>
          </div>

          <div class="bo-mobile-card-actions">
            <button class="bo-secondary" (click)="openEdit(item)">Edit Interview</button>
            <button class="bo-danger" (click)="deleteInterview(item)">Delete</button>
          </div>
        </article>

        <div class="bo-empty-card" *ngIf="!rows.length && !loading">Belum ada jadwal interview.</div>
      </section>

      <div class="drawer-backdrop" *ngIf="drawerOpen" (click)="closeOnBackdrop($event)">
        <aside class="side-drawer">
          <header>
            <div>
              <span class="bo-kicker">INTERVIEW</span>
              <h2>{{ editingId ? 'Edit Interview' : 'Jadwalkan Interview' }}</h2>
              <p>{{ selectedCandidateName || 'Pilih kandidat dan detail jadwal interview.' }}</p>
            </div>
            <button (click)="closeDrawer()">×</button>
          </header>

          <div class="drawer-body">
            <div class="drawer-form">
              <label>Candidate
                <select [(ngModel)]="form.candidateId" [disabled]="!!lockedCandidateId">
                  <option [ngValue]="null">Pilih kandidat</option>
                  <option *ngFor="let candidate of candidates" [ngValue]="candidate.id">{{ candidate.fullName }}</option>
                </select>
              </label>

              <label>Job Listing
                <select [(ngModel)]="form.jobListingId" [disabled]="!!lockedJobId">
                  <option [ngValue]="null">General Talent Pool</option>
                  <option *ngFor="let job of jobs" [ngValue]="job.id">{{ job.title }}</option>
                </select>
              </label>

              <div class="drawer-grid">
                <label>Tanggal & Jam
                  <input type="datetime-local" [(ngModel)]="form.scheduledAt">
                </label>
                <label>Durasi
                  <input type="number" min="15" max="480" [(ngModel)]="form.durationMinutes">
                </label>
              </div>

              <div class="drawer-grid">
                <label>Mode
                  <select [(ngModel)]="form.mode">
                    <option value="ONLINE">Online</option>
                    <option value="ONSITE">Onsite</option>
                    <option value="PHONE">Phone</option>
                  </select>
                </label>
                <label>Interviewer
                  <input [(ngModel)]="form.interviewer" placeholder="Nama interviewer">
                </label>
              </div>

              <label>Lokasi / Link
                <input [(ngModel)]="form.locationOrLink" placeholder="Google Meet / Zoom / lokasi interview">
              </label>

              <label>Catatan
                <textarea [(ngModel)]="form.notes" placeholder="Catatan interview"></textarea>
              </label>

              <p class="form-error" *ngIf="error">{{ error }}</p>
            </div>
          </div>

          <footer>
            <button class="cancel-button" (click)="closeDrawer()" [disabled]="saving">Batal</button>
            <button class="primary-button" (click)="save()" [disabled]="saving">
              {{ saving ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Buat Jadwal Interview') }}
            </button>
          </footer>
        </aside>
      </div>
    </app-backoffice-layout>
  `,
})
export class BackofficeInterviewsComponent implements OnInit {
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
      this.candidates.find((item) => item.id === candidateId)?.fullName || 'Candidate';
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
      this.error = 'Candidate wajib dipilih.';
      return;
    }
    if (!this.form.scheduledAt) {
      this.error = 'Tanggal dan jam interview wajib diisi.';
      return;
    }
    if (!this.form.interviewer?.trim()) {
      this.error = 'Interviewer wajib diisi.';
      return;
    }
    if ((this.form.mode === 'ONLINE' || this.form.mode === 'ONSITE') && !this.form.locationOrLink?.trim()) {
      this.error = 'Link/lokasi wajib diisi untuk interview online atau onsite.';
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
        this.error = error?.error?.message || 'Interview gagal disimpan.';
      },
    });
  }

  deleteInterview(item: any): void {
    if (!window.confirm(`Hapus jadwal interview ${item.candidateName}?`)) return;

    this.api.deleteInterview(item.id).subscribe({
      next: () => this.load(),
      error: (error) => window.alert(error?.error?.message || 'Interview gagal dihapus.'),
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

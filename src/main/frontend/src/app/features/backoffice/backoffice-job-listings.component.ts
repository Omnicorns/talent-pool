import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BackofficeOverlayDirective } from '../../shared/backoffice-overlay.directive';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';
import { FMT } from '../../shared/labels';
import { IconComponent } from '../../shared/icon.component';
import { PaginationComponent } from '../../shared/pagination.component';

@Component({
  selector: 'app-backoffice-job-listings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BackofficeLayoutComponent, BackofficeOverlayDirective, IconComponent, PaginationComponent],
  template: `
    <app-backoffice-layout active="jobs">
      <div class="bo-head">
        <div>
          <h1>Lowongan</h1>
          <p>Buat lowongan, buka untuk pelamar, dan tutup saat posisi sudah terisi.</p>
        </div>
        <div class="bo-actions">
          <form (ngSubmit)="search()" role="search" class="bo-search">
            <span class="sr-only">Cari lowongan</span>
            <app-icon name="search" [size]="16"></app-icon>
            <input [(ngModel)]="q" name="q" placeholder="Cari posisi atau departemen">
          </form>
          <button class="btn btn-primary" (click)="openCreate()"><app-icon name="plus" [size]="16"></app-icon> Buat lowongan</button>
        </div>
      </div>

      <p class="muted" *ngIf="loading">Memuat lowongan…</p>

      <section class="job-cards">
        <article class="job-card" *ngFor="let job of rows">
          <div class="job-card-top">
            <span class="tag" [ngClass]="'tag-' + fmt.tone(job.status)">{{ fmt.label(job.status) }}</span>
            <button type="button" class="applicant-link" (click)="openApplicants(job)" [disabled]="!job.applicationCount" [attr.aria-label]="'Lihat ' + (job.applicationCount || 0) + ' pelamar untuk ' + job.title">
              <app-icon name="users" [size]="14"></app-icon> {{ job.applicationCount || 0 }} pelamar
            </button>
          </div>
          <div>
            <h2><button type="button" class="job-title-link" (click)="openApplicants(job)">{{ job.title }}</button></h2>
            <p class="dept">{{ job.department || 'Sarinah' }} · {{ job.location || '-' }}</p>
          </div>
          <dl class="facts">
            <div><dt>Kebutuhan</dt><dd>{{ job.openings }} orang</dd></div>
            <div><dt>Tipe</dt><dd>{{ fmt.label(job.employmentType) }}</dd></div>
            <div><dt>Batas lamaran</dt><dd>{{ job.applicationDeadline ? fmt.fullDate(job.applicationDeadline) : '-' }}</dd></div>
          </dl>
          <div class="job-card-actions">
            <button class="btn btn-ghost btn-sm danger-text" (click)="askDelete(job)" [attr.aria-label]="'Hapus ' + job.title"><app-icon name="trash" [size]="15"></app-icon> Hapus</button>
            <button class="btn btn-secondary btn-sm" (click)="openEdit(job)"><app-icon name="edit" [size]="15"></app-icon> Ubah</button>
            <button class="btn btn-primary btn-sm" *ngIf="job.status === 'DRAFT'" (click)="changeStatus(job, 'PUBLISHED')">Buka lowongan</button>
            <button class="btn btn-secondary btn-sm" *ngIf="job.status === 'PUBLISHED'" (click)="changeStatus(job, 'CLOSED')">Tutup lowongan</button>
            <button class="btn btn-secondary btn-sm" *ngIf="job.status === 'CLOSED'" (click)="changeStatus(job, 'DRAFT')"><app-icon name="undo" [size]="15"></app-icon> Jadikan draf</button>
            <button class="btn btn-ghost btn-sm" style="margin-left: auto; color: var(--negative)" *ngIf="!job.applicationCount" (click)="deleteJob(job)" [attr.aria-label]="'Hapus ' + job.title"><app-icon name="trash" [size]="15"></app-icon> Hapus</button>
          </div>
        </article>
      </section>

      <div class="empty" *ngIf="!rows.length && !loading">
        <strong>{{ q.trim() ? 'Tidak ada lowongan yang cocok' : 'Belum ada lowongan' }}</strong>
        {{ q.trim() ? 'Coba kata kunci lain.' : 'Buat lowongan pertama untuk mulai menerima pelamar.' }}
      </div>

      <div class="page-footer" *ngIf="total > 0">
        <app-pagination [page]="page" [size]="size" [total]="total" [sizes]="[8, 16, 40]" (pageChange)="goToPage($event)" (sizeChange)="changeSize($event)"></app-pagination>
      </div>

      <div class="drawer-backdrop" *ngIf="drawerOpen" (click)="closeOnBackdrop($event)">
        <aside class="drawer" [boOverlay]="true" (overlayClose)="closeDrawer()" role="dialog" aria-modal="true" aria-labelledby="job-form-title">
          <header class="drawer-head">
            <div>
              <h2 id="job-form-title">{{ editingId ? 'Ubah lowongan' : 'Buat lowongan' }}</h2>
              <p>Lowongan berstatus Dibuka langsung tampil di portal kandidat.</p>
            </div>
            <button type="button" class="icon-btn" (click)="closeDrawer()" aria-label="Tutup"><app-icon name="x"></app-icon></button>
          </header>

          <div class="drawer-body">
            <div class="form-stack">
              <label class="field">Nama posisi<input [(ngModel)]="form.title" placeholder="Contoh: Retail Operations Supervisor"></label>
              <div class="form-grid">
                <label class="field">Departemen<input [(ngModel)]="form.department" placeholder="Contoh: Retail"></label>
                <label class="field">Lokasi<input [(ngModel)]="form.location" placeholder="Contoh: Jakarta"></label>
                <label class="field">Tipe pekerjaan
                  <select [(ngModel)]="form.employmentType">
                    <option value="FULL_TIME">Penuh waktu</option>
                    <option value="PART_TIME">Paruh waktu</option>
                    <option value="CONTRACT">Kontrak</option>
                    <option value="INTERNSHIP">Magang</option>
                    <option value="TEMPORARY">Sementara</option>
                  </select>
                </label>
                <label class="field">Jumlah kebutuhan<input type="number" min="1" [(ngModel)]="form.openings"></label>
                <label class="field">Batas lamaran<input type="date" [(ngModel)]="form.applicationDeadline"></label>
                <label class="field">Status
                  <select [(ngModel)]="form.status">
                    <option value="DRAFT">Draf</option>
                    <option value="PUBLISHED">Dibuka</option>
                    <option value="CLOSED">Ditutup</option>
                  </select>
                </label>
              </div>
              <label class="field">Deskripsi<textarea rows="10" [(ngModel)]="form.description" placeholder="Tanggung jawab, kualifikasi, dan informasi lain untuk pelamar"></textarea></label>
              <div class="alert alert-error" *ngIf="error" role="alert"><app-icon name="alert"></app-icon><span>{{ error }}</span></div>
            </div>
          </div>

          <footer class="drawer-foot">
            <button class="btn btn-secondary" (click)="closeDrawer()" [disabled]="saving">Batal</button>
            <button class="btn btn-primary" (click)="save()" [disabled]="saving">{{ saving ? 'Menyimpan…' : (editingId ? 'Simpan perubahan' : 'Buat lowongan') }}</button>
          </footer>
        </aside>
      </div>

      <div class="drawer-backdrop" *ngIf="applicantsJob" (click)="closeApplicantsOnBackdrop($event)">
        <aside class="drawer xwide" [boOverlay]="true" (overlayClose)="closeApplicants()" role="dialog" aria-modal="true" aria-labelledby="applicants-title">
          <header class="drawer-head">
            <div>
              <h2 id="applicants-title">Pelamar {{ applicantsJob.title }}</h2>
              <p>{{ applicants.length }} pelamar · {{ potentialCount }} ditandai potensial</p>
            </div>
            <button type="button" class="icon-btn" (click)="closeApplicants()" aria-label="Tutup"><app-icon name="x"></app-icon></button>
          </header>
          <div class="drawer-body">
            <div class="applicant-toolbar">
              <button type="button" class="btn btn-secondary btn-sm" (click)="toggleAdd()" [attr.aria-expanded]="addOpen"><app-icon name="plus" [size]="15"></app-icon> Tambah kandidat</button>
            </div>

            <section class="add-panel" *ngIf="addOpen" aria-label="Tambah kandidat dari Talent Pool">
              <form class="add-search" (ngSubmit)="searchCandidates()" role="search">
                <label class="bo-search">
                  <span class="sr-only">Cari kandidat Talent Pool</span>
                  <app-icon name="search" [size]="16"></app-icon>
                  <input [(ngModel)]="addQ" name="addQ" placeholder="Cari nama atau email kandidat">
                </label>
                <button class="btn btn-secondary btn-sm" type="submit">Cari</button>
              </form>
              <div class="alert alert-error" *ngIf="addError" role="alert"><app-icon name="alert"></app-icon><span>{{ addError }}</span></div>
              <p class="muted" *ngIf="addLoading">Memuat kandidat…</p>
              <p class="muted" *ngIf="!addLoading && !addResults.length">Tidak ada kandidat yang cocok.</p>
              <ul class="add-list" *ngIf="addResults.length">
                <li *ngFor="let c of addResults">
                  <div>
                    <strong>{{ c.fullName }}</strong>
                    <small>{{ c.email }}{{ c.jobInterests?.length ? ' · ' + c.jobInterests.join(', ') : '' }}</small>
                  </div>
                  <button type="button" class="btn btn-primary btn-sm" *ngIf="!isApplicant(c.id); else already" (click)="addCandidate(c)" [disabled]="addingId === c.id">
                    {{ addingId === c.id ? 'Menambah…' : 'Tambah' }}
                  </button>
                  <ng-template #already><span class="tag tag-positive">Sudah di lowongan</span></ng-template>
                </li>
              </ul>
            </section>

            <div class="segmented applicant-filter" role="tablist" aria-label="Filter pelamar" *ngIf="applicants.length">
              <button type="button" role="tab" [class.active]="!onlyPotential" [attr.aria-selected]="!onlyPotential" (click)="onlyPotential = false">Semua ({{ applicants.length }})</button>
              <button type="button" role="tab" [class.active]="onlyPotential" [attr.aria-selected]="onlyPotential" (click)="onlyPotential = true">Potensial ({{ potentialCount }})</button>
            </div>
            <p class="muted" *ngIf="applicantsLoading">Memuat pelamar…</p>
            <div class="alert alert-error" *ngIf="applicantsError" role="alert"><app-icon name="alert"></app-icon><span>{{ applicantsError }}</span></div>
            <p class="muted" *ngIf="!applicantsLoading && !applicantsError && !applicants.length">Belum ada pelamar.</p>
            <p class="muted" *ngIf="applicants.length && onlyPotential && !potentialCount">Belum ada pelamar yang ditandai potensial.</p>

            <div class="table-wrap" *ngIf="visibleApplicants.length">
              <table class="table applicant-table">
                <thead><tr><th>Nama kandidat</th><th>Fungsi diminati</th><th>Pengalaman terakhir</th><th>Lokasi diminati</th><th>Review</th><th>Penilaian</th><th><span class="sr-only">CV</span></th></tr></thead>
                <tbody>
                  <tr *ngFor="let a of visibleApplicants">
                    <td style="min-width: 160px"><strong>{{ a.candidateName }}</strong><small>{{ a.candidate?.email }}</small><small>{{ a.addedByHr ? 'Ditambahkan' : 'Melamar' }} {{ fmt.fullDate(a.appliedAt) }} · {{ fmt.label(a.stage) }}</small><span class="source-tag" [class.hr]="a.addedByHr">{{ a.addedByHr ? 'Ditambahkan HC' : 'Dilamar sendiri' }}</span></td>
                    <td style="min-width: 140px">{{ a.candidate?.jobInterests?.length ? a.candidate.jobInterests.join(', ') : (a.candidate?.relatedPosition || '-') }}</td>
                    <td style="min-width: 170px">
                      <ng-container *ngIf="a.candidate?.lastExperience as exp; else noExp">
                        <strong>{{ exp.position }}</strong><small>{{ exp.company }}</small><small>{{ fmt.lastExperiencePeriod(exp) }}</small>
                      </ng-container>
                      <ng-template #noExp>-</ng-template>
                    </td>
                    <td style="min-width: 120px">{{ a.candidate?.preferredLocations?.length ? a.candidate.preferredLocations.join(', ') : '-' }}</td>
                    <td><span class="tag" [ngClass]="a.candidate?.reviewed ? 'tag-positive' : 'tag-neutral'">{{ a.candidate?.reviewed ? 'Sudah direview' : 'Belum review' }}</span></td>
                    <td>
                      <button type="button" class="potential-btn" [class.on]="a.potential" [attr.aria-pressed]="a.potential"
                        (click)="togglePotential(a)" [disabled]="a.saving" [attr.aria-label]="(a.potential ? 'Hapus tag potensial ' : 'Tandai potensial ') + a.candidateName">
                        <app-icon [name]="a.potential ? 'check' : 'plus'" [size]="14"></app-icon> {{ a.potential ? 'Potensial' : 'Tandai potensial' }}
                      </button>
                    </td>
                    <td class="actions">
                      <div class="row-actions">
                        <button class="icon-btn" (click)="api.viewCv(a.candidateId)" [disabled]="!a.candidate?.hasCv" [attr.aria-label]="'Lihat CV ' + a.candidateName" title="Lihat CV"><app-icon name="eye" [size]="16"></app-icon></button>
                        <button class="icon-btn" (click)="api.downloadCv(a.candidateId, 'CV-' + a.candidateName + '.pdf')" [disabled]="!a.candidate?.hasCv" [attr.aria-label]="'Unduh CV ' + a.candidateName" title="Unduh CV"><app-icon name="download" [size]="16"></app-icon></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <footer class="drawer-foot">
            <button class="btn btn-secondary" (click)="closeApplicants()">Tutup</button>
            <a class="btn btn-primary" routerLink="/backoffice/applications" (click)="closeApplicants()">Kelola tahap di Lamaran</a>
          </footer>
        </aside>
      </div>

      <div class="modal-backdrop" *ngIf="deleteTarget" (click)="deleteTarget = null">
        <section class="modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" (click)="$event.stopPropagation()" style="max-width: 440px">
          <header class="drawer-head"><div><h2 id="delete-title">Hapus lowongan?</h2><p>{{ deleteTarget.title }}</p></div></header>
          <div class="modal-body">
            <p>Lowongan yang dihapus tidak bisa dikembalikan. Lowongan yang sudah punya pelamar atau jadwal interview tidak bisa dihapus; tutup saja lowongannya.</p>
            <div class="alert alert-error" *ngIf="deleteError" role="alert"><app-icon name="alert"></app-icon><span>{{ deleteError }}</span></div>
          </div>
          <footer class="modal-foot">
            <button class="btn btn-secondary" (click)="deleteTarget = null" [disabled]="deleting">Batal</button>
            <button class="btn btn-danger" (click)="confirmDelete()" [disabled]="deleting">{{ deleting ? 'Menghapus…' : 'Hapus lowongan' }}</button>
          </footer>
        </section>
      </div>
    </app-backoffice-layout>
  `,
})
export class BackofficeJobListingsComponent implements OnInit {
  readonly fmt = FMT;
  rows: any[] = [];
  q = '';
  loading = false;
  saving = false;
  drawerOpen = false;
  editingId: string | null = null;
  error = '';

  form: any = this.emptyForm();

  constructor(public api: BackofficeApiService) {}

  ngOnInit(): void {
    this.load();
  }

  page = 0;
  size = 8;
  total = 0;

  search(): void {
    this.page = 0;
    this.load();
  }

  goToPage(page: number): void {
    this.page = page;
    this.load();
  }

  changeSize(size: number): void {
    this.size = size;
    this.page = 0;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.jobListings(this.q, this.page, this.size).subscribe({
      next: (result) => {
        this.total = result?.totalElements ?? 0;
        if (!(result?.content || []).length && this.page > 0) { this.page = Math.max(0, (result?.totalPages ?? 1) - 1); this.load(); return; }
        this.rows = result?.content || [];
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.error = '';
    this.drawerOpen = true;
  }

  openEdit(job: any): void {
    this.editingId = job.id;
    this.form = {
      title: job.title || '',
      department: job.department || '',
      location: job.location || '',
      employmentType: job.employmentType || 'FULL_TIME',
      description: job.description || '',
      openings: Number(job.openings || 1),
      applicationDeadline: job.applicationDeadline || '',
      status: job.status || 'DRAFT',
    };
    this.error = '';
    this.drawerOpen = true;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.editingId = null;
    this.error = '';
  }

  applicantsJob: any = null;
  applicants: any[] = [];
  applicantsLoading = false;
  applicantsError = '';

  openApplicants(job: any): void {
    this.applicantsJob = job;
    this.onlyPotential = false;
    this.applicants = [];
    this.applicantsError = '';
    this.applicantsLoading = true;
    this.addOpen = false;
    this.addError = '';
    this.api.jobApplications(job.id).subscribe({
      next: (result) => { this.applicants = result?.content || []; this.applicantsLoading = false; },
      error: () => { this.applicantsLoading = false; this.applicantsError = 'Daftar pelamar belum bisa dimuat. Coba lagi.'; },
    });
  }

  onlyPotential = false;
  deleteTarget: any = null;
  deleteError = '';
  deleting = false;

  get potentialCount(): number {
    return this.applicants.filter((a) => a.potential).length;
  }

  get visibleApplicants(): any[] {
    return this.onlyPotential ? this.applicants.filter((a) => a.potential) : this.applicants;
  }

  togglePotential(application: any): void {
    const next = !application.potential;
    application.saving = true;
    this.api.updateApplicationPotential(application.id, next).subscribe({
      next: (updated) => { application.potential = updated.potential; application.saving = false; },
      error: () => { application.saving = false; this.applicantsError = 'Tag belum tersimpan. Coba lagi.'; },
    });
  }

  askDelete(job: any): void {
    this.deleteTarget = job;
    this.deleteError = '';
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.deleting = true;
    this.api.deleteJobListing(this.deleteTarget.id).subscribe({
      next: () => { this.deleting = false; this.deleteTarget = null; this.load(); },
      error: (error) => { this.deleting = false; this.deleteError = error?.error?.message || 'Lowongan belum bisa dihapus. Coba lagi.'; },
    });
  }

  addOpen = false;
  addQ = '';
  addResults: any[] = [];
  addLoading = false;
  addError = '';
  addingId: string | null = null;

  isApplicant(candidateId: string): boolean {
    return this.applicants.some((a) => a.candidateId === candidateId);
  }

  toggleAdd(): void {
    this.addOpen = !this.addOpen;
    if (this.addOpen && !this.addResults.length) this.searchCandidates();
  }

  searchCandidates(): void {
    this.addLoading = true;
    this.addError = '';
    this.api.candidates(this.addQ).subscribe({
      next: (result) => { this.addResults = result?.content || []; this.addLoading = false; },
      error: () => { this.addLoading = false; this.addError = 'Daftar kandidat belum bisa dimuat. Coba lagi.'; },
    });
  }

  addCandidate(candidate: any): void {
    if (!this.applicantsJob) return;
    const job = this.applicantsJob;
    this.addingId = candidate.id;
    this.addError = '';
    this.api.moveCandidateToJobListing(candidate.id, job.id, 'NEW_CANDIDATE').subscribe({
      next: () => {
        this.addingId = null;
        this.api.jobApplications(job.id).subscribe({
          next: (result) => {
            this.applicants = result?.content || [];
            job.applicationCount = this.applicants.length;
          },
        });
      },
      error: (error) => {
        this.addingId = null;
        this.addError = error?.error?.message || 'Kandidat belum bisa ditambahkan. Coba lagi.';
      },
    });
  }

  closeApplicants(): void {
    this.applicantsJob = null;
  }

  closeApplicantsOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('drawer-backdrop')) this.closeApplicants();
  }

  closeOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('drawer-backdrop')) {
      this.closeDrawer();
    }
  }

  save(): void {
    this.error = '';

    if (!this.form.title?.trim()) {
      this.error = 'Isi nama posisi.';
      return;
    }

    if (!this.form.employmentType) {
      this.error = 'Pilih tipe pekerjaan.';
      return;
    }

    if (!this.form.openings || Number(this.form.openings) < 1) {
      this.error = 'Jumlah kebutuhan minimal 1 orang.';
      return;
    }

    const payload = {
      title: this.form.title.trim(),
      department: this.form.department?.trim() || null,
      location: this.form.location?.trim() || null,
      employmentType: this.form.employmentType,
      description: this.form.description?.trim() || null,
      openings: Number(this.form.openings),
      applicationDeadline: this.form.applicationDeadline || null,
      status: this.form.status,
    };

    this.saving = true;

    const request = this.editingId
      ? this.api.updateJobListing(this.editingId, payload)
      : this.api.createJobListing(payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.closeDrawer();
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || 'Lowongan belum tersimpan. Periksa isian lalu coba lagi.';
      },
    });
  }

  changeStatus(job: any, status: 'DRAFT' | 'PUBLISHED' | 'CLOSED'): void {
    const message =
      status === 'CLOSED'
        ? `Tutup lowongan "${job.title}"?`
        : status === 'PUBLISHED'
          ? `Buka lowongan "${job.title}" untuk pelamar?`
          : `Jadikan lowongan "${job.title}" sebagai draf?`;

    if (!window.confirm(message)) return;

    this.api.updateJobListingStatus(job.id, status).subscribe({
      next: (updated) => {
        Object.assign(job, updated);
      },
      error: (err) => {
        window.alert(err?.error?.message || 'Status lowongan belum berubah. Coba lagi.');
      },
    });
  }

  deleteJob(job: any): void {
    if (!window.confirm(`Hapus lowongan "${job.title}" secara permanen?`)) return;

    this.api.deleteJobListing(job.id).subscribe({
      next: () => this.load(),
      error: (err) => {
        window.alert(
          err?.error?.message ||
          'Lowongan yang sudah punya pelamar atau interview tidak bisa dihapus. Tutup lowongan sebagai gantinya.'
        );
      },
    });
  }

  private emptyForm(): any {
    return {
      title: '',
      department: '',
      location: '',
      employmentType: 'FULL_TIME',
      description: '',
      openings: 1,
      applicationDeadline: '',
      status: 'DRAFT',
    };
  }
}

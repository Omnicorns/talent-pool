import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackofficeOverlayDirective } from '../../shared/backoffice-overlay.directive';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';
import { FMT } from '../../shared/labels';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-backoffice-job-listings',
  standalone: true,
  imports: [CommonModule, FormsModule, BackofficeLayoutComponent, BackofficeOverlayDirective, IconComponent],
  template: `
    <app-backoffice-layout active="jobs">
      <div class="bo-head">
        <div>
          <h1>Lowongan</h1>
          <p>Buat lowongan, buka untuk pelamar, dan tutup saat posisi sudah terisi.</p>
        </div>
        <div class="bo-actions">
          <form (ngSubmit)="load()" role="search" class="bo-search">
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
            <small>{{ job.applicationCount || 0 }} pelamar</small>
          </div>
          <div>
            <h2>{{ job.title }}</h2>
            <p class="dept">{{ job.department || 'Sarinah' }} · {{ job.location || '-' }}</p>
          </div>
          <dl class="facts">
            <div><dt>Kebutuhan</dt><dd>{{ job.openings }} orang</dd></div>
            <div><dt>Tipe</dt><dd>{{ fmt.label(job.employmentType) }}</dd></div>
            <div><dt>Batas lamaran</dt><dd>{{ job.applicationDeadline ? fmt.fullDate(job.applicationDeadline) : '-' }}</dd></div>
          </dl>
          <div class="job-card-actions">
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

  constructor(private api: BackofficeApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.jobListings(this.q).subscribe({
      next: (result) => {
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

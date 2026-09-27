import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';

@Component({
  selector: 'app-backoffice-job-listings',
  standalone: true,
  imports: [CommonModule, FormsModule, BackofficeLayoutComponent],
  template: `
    <app-backoffice-layout active="jobs">
      <div class="bo-page-head">
        <div>
          <span class="bo-kicker">RECRUITMENT</span>
          <h1>Job Listings</h1>
          <p>Pantau posisi, status publikasi, deadline, dan jumlah pelamar.</p>
        </div>
        <div class="bo-head-actions">
          <input class="bo-search" [(ngModel)]="q" (keyup.enter)="load()" placeholder="Cari posisi atau departemen...">
          <button class="bo-primary" (click)="load()">Cari</button>
          <button class="bo-primary" (click)="openCreate()">＋ Tambah Lowongan</button>
        </div>
      </div>

      <section class="bo-card-grid">
        <article class="bo-job-card" *ngFor="let job of rows">
          <div class="bo-job-top">
            <span class="bo-badge"
              [class.green]="job.status === 'PUBLISHED'"
              [class.gray]="job.status === 'DRAFT'"
              [class.red]="job.status === 'CLOSED'">
              {{ job.status }}
            </span>
            <small>{{ job.applicationCount || 0 }} applications</small>
          </div>

          <h2>{{ job.title }}</h2>
          <p>{{ job.department || 'Sarinah' }} • {{ job.location || '-' }}</p>

          <div class="bo-job-info">
            <span><b>{{ job.openings }}</b><small>Openings</small></span>
            <span><b>{{ job.employmentType || '-' }}</b><small>Type</small></span>
            <span><b>{{ job.applicationDeadline || '-' }}</b><small>Deadline</small></span>
          </div>

          <div class="bo-job-actions">
            <button class="bo-secondary" (click)="openEdit(job)">Edit</button>

            <button
              class="bo-primary"
              *ngIf="job.status !== 'PUBLISHED'"
              (click)="changeStatus(job, 'PUBLISHED')">
              Publish
            </button>

            <button
              class="bo-warning"
              *ngIf="job.status === 'PUBLISHED'"
              (click)="changeStatus(job, 'CLOSED')">
              Close
            </button>

            <button
              class="bo-secondary"
              *ngIf="job.status === 'CLOSED'"
              (click)="changeStatus(job, 'DRAFT')">
              Reopen Draft
            </button>

            <button
              class="bo-danger"
              *ngIf="!job.applicationCount"
              (click)="deleteJob(job)">
              Delete
            </button>
          </div>
        </article>

        <div class="bo-empty-card" *ngIf="!rows.length && !loading">Belum ada job listing.</div>
      </section>

      <div class="drawer-backdrop" *ngIf="drawerOpen" (click)="closeOnBackdrop($event)">
        <aside class="side-drawer">
          <header>
            <div>
              <span class="bo-kicker">JOB LISTING</span>
              <h2>{{ editingId ? 'Edit Lowongan' : 'Tambah Lowongan' }}</h2>
              <p>Isi detail posisi dan status publikasi.</p>
            </div>
            <button (click)="closeDrawer()">×</button>
          </header>

          <div class="drawer-body">
            <div class="drawer-form">
              <label>Judul Posisi
                <input [(ngModel)]="form.title" placeholder="Contoh: Backend Engineer">
              </label>

              <div class="drawer-grid">
                <label>Department
                  <input [(ngModel)]="form.department" placeholder="Technology">
                </label>
                <label>Location
                  <input [(ngModel)]="form.location" placeholder="Jakarta">
                </label>
              </div>

              <div class="drawer-grid">
                <label>Employment Type
                  <select [(ngModel)]="form.employmentType">
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="TEMPORARY">Temporary</option>
                  </select>
                </label>

                <label>Openings
                  <input type="number" min="1" [(ngModel)]="form.openings">
                </label>
              </div>

              <div class="drawer-grid">
                <label>Application Deadline
                  <input type="date" [(ngModel)]="form.applicationDeadline">
                </label>
                <label>Status
                  <select [(ngModel)]="form.status">
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </label>
              </div>

              <label>Deskripsi
                <textarea rows="8" [(ngModel)]="form.description" placeholder="Deskripsi pekerjaan, tanggung jawab, dan requirements..."></textarea>
              </label>

              <p class="form-error" *ngIf="error">{{ error }}</p>
            </div>
          </div>

          <footer>
            <button class="cancel-button" (click)="closeDrawer()" [disabled]="saving">Batal</button>
            <button class="primary-button" (click)="save()" [disabled]="saving">
              {{ saving ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Tambah Lowongan') }}
            </button>
          </footer>
        </aside>
      </div>
    </app-backoffice-layout>
  `,
})
export class BackofficeJobListingsComponent implements OnInit {
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
      this.error = 'Judul posisi wajib diisi.';
      return;
    }

    if (!this.form.employmentType) {
      this.error = 'Employment type wajib dipilih.';
      return;
    }

    if (!this.form.openings || Number(this.form.openings) < 1) {
      this.error = 'Jumlah opening minimal 1.';
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
        this.error = err?.error?.message || 'Job listing gagal disimpan.';
      },
    });
  }

  changeStatus(job: any, status: 'DRAFT' | 'PUBLISHED' | 'CLOSED'): void {
    const message =
      status === 'CLOSED'
        ? `Tutup lowongan "${job.title}"?`
        : status === 'PUBLISHED'
          ? `Publish lowongan "${job.title}"?`
          : `Ubah lowongan "${job.title}" menjadi Draft?`;

    if (!window.confirm(message)) return;

    this.api.updateJobListingStatus(job.id, status).subscribe({
      next: (updated) => {
        Object.assign(job, updated);
      },
      error: (err) => {
        window.alert(err?.error?.message || 'Status lowongan gagal diperbarui.');
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
          'Lowongan tidak dapat dihapus. Jika sudah memiliki kandidat/interview, gunakan Close.'
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

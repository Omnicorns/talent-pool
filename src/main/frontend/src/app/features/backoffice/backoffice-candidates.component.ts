import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TalentProfileDetailsComponent } from '../../shared/talent-profile-details.component';
import { BackofficeOverlayDirective } from '../../shared/backoffice-overlay.directive';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';
import { FMT } from '../../shared/labels';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-backoffice-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule, BackofficeLayoutComponent, TalentProfileDetailsComponent, BackofficeOverlayDirective, IconComponent],
  template: `
    <app-backoffice-layout active="candidates">
      <div class="bo-head">
        <div>
          <h1>Kandidat</h1>
          <p>Semua profil di Talent Pool, termasuk yang belum melamar lowongan.</p>
        </div>
        <form class="bo-actions" (ngSubmit)="load()" role="search">
          <label class="bo-search">
            <span class="sr-only">Cari kandidat</span>
            <app-icon name="search" [size]="16"></app-icon>
            <input [(ngModel)]="q" name="q" placeholder="Cari nama, email, atau posisi">
          </label>
          <button class="btn btn-secondary" type="submit">Cari</button>
        </form>
      </div>

      <section class="table-card responsive">
        <div class="table-meta">
          <span><strong>{{ rows.length }}</strong> kandidat<ng-container *ngIf="q.trim()"> untuk “{{ q.trim() }}”</ng-container></span>
          <span *ngIf="loading">Memuat…</span>
        </div>

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr><th>Kandidat</th><th>Posisi</th><th>Pengalaman</th><th>Status</th><th>Sumber</th><th><span class="sr-only">Aksi</span></th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of rows">
                <td>
                  <div class="person">
                    <span class="avatar">
                      <img *ngIf="pictureUrls[item.id]; else tableInitials" [src]="pictureUrls[item.id]" alt="">
                      <ng-template #tableInitials>{{ fmt.initials(item.fullName) }}</ng-template>
                    </span>
                    <div><strong>{{ item.fullName }}</strong><small>{{ item.email }}</small></div>
                  </div>
                </td>
                <td style="min-width: 180px"><strong>{{ item.relatedPosition || '-' }}</strong><small>{{ item.industry || '' }}</small></td>
                <td>{{ fmt.experience(item.experienceMonths) }}</td>
                <td>
                  <select class="select-inline" [ngModel]="item.status" (ngModelChange)="changeStatus(item, $event)" [attr.aria-label]="'Status ' + item.fullName">
                    <option *ngFor="let status of statuses" [value]="status">{{ fmt.label(status) }}</option>
                  </select>
                </td>
                <td>{{ item.source || '-' }}</td>
                <td class="actions"><button class="btn btn-secondary btn-sm" (click)="openCandidate(item)">Lihat profil</button></td>
              </tr>
              <tr *ngIf="!rows.length && !loading"><td colspan="6" class="empty-cell">{{ q.trim() ? 'Tidak ada kandidat yang cocok dengan pencarian.' : 'Belum ada kandidat di Talent Pool.' }}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="cards">
          <article *ngFor="let item of rows">
            <div class="card-head">
              <div class="person" style="min-width: 0">
                <span class="avatar">
                  <img *ngIf="pictureUrls[item.id]; else mobileInitials" [src]="pictureUrls[item.id]" alt="">
                  <ng-template #mobileInitials>{{ fmt.initials(item.fullName) }}</ng-template>
                </span>
                <div><strong>{{ item.fullName }}</strong><small>{{ item.email }}</small></div>
              </div>
            </div>
            <div class="card-meta">
              <div><span>Posisi</span>{{ item.relatedPosition || '-' }}</div>
              <div><span>Pengalaman</span>{{ fmt.experience(item.experienceMonths) }}</div>
              <div><span>Sumber</span>{{ item.source || '-' }}</div>
            </div>
            <div class="card-actions">
              <select class="select-inline" [ngModel]="item.status" (ngModelChange)="changeStatus(item, $event)" [attr.aria-label]="'Status ' + item.fullName">
                <option *ngFor="let status of statuses" [value]="status">{{ fmt.label(status) }}</option>
              </select>
              <button class="btn btn-secondary btn-sm" (click)="openCandidate(item)">Lihat profil</button>
            </div>
          </article>
          <p class="empty-cell muted" style="padding: 32px 18px; text-align: center" *ngIf="!rows.length && !loading">Belum ada kandidat.</p>
        </div>
      </section>

      <div class="drawer-backdrop bo-candidate-backdrop" *ngIf="drawerOpen" (click)="closeOnBackdrop($event)">
        <aside class="drawer wide" [boOverlay]="true" (overlayClose)="closeDrawer()" role="dialog" aria-modal="true" aria-label="Profil kandidat">
          <header class="drawer-head">
            <div class="candidate-sheet" *ngIf="selected; else headLoading">
              <span class="avatar avatar-md">
                <img *ngIf="pictureUrls[selected.id]; else drawerInitials" [src]="pictureUrls[selected.id]" alt="">
                <ng-template #drawerInitials>{{ fmt.initials(selected.fullName) }}</ng-template>
              </span>
              <div>
                <h2>{{ selected.fullName }}</h2>
                <p>{{ selected.relatedJobPositions?.join(', ') || selected.jobPosition || 'Kandidat Talent Pool' }}</p>
                <span class="tag" [ngClass]="'tag-' + fmt.tone(selected.status)">{{ fmt.label(selected.status) }}</span>
              </div>
            </div>
            <ng-template #headLoading><h2>Profil kandidat</h2></ng-template>
            <button type="button" class="icon-btn" (click)="closeDrawer()" aria-label="Tutup"><app-icon name="x"></app-icon></button>
          </header>

          <div class="drawer-body" *ngIf="selected; else detailLoading">
            <div class="button-row">
              <button class="btn btn-primary" (click)="downloadCv()" [disabled]="!selected.cvOriginalName"><app-icon name="download" [size]="16"></app-icon> {{ selected.cvOriginalName ? 'Unduh CV' : 'CV belum ada' }}</button>
              <button class="btn btn-secondary" (click)="showInterviewForm = !showInterviewForm" [attr.aria-expanded]="showInterviewForm"><app-icon name="calendar" [size]="16"></app-icon> Jadwalkan interview</button>
              <a class="btn btn-ghost" [href]="'mailto:' + selected.email"><app-icon name="mail" [size]="16"></app-icon> Email</a>
            </div>

            <section class="drawer-section" *ngIf="showInterviewForm">
              <h3>Jadwalkan interview</h3>
              <div class="form-grid">
                <label class="field">Tanggal dan jam<input type="datetime-local" [(ngModel)]="interviewForm.scheduledAt"></label>
                <label class="field">Durasi (menit)<input type="number" min="15" max="480" [(ngModel)]="interviewForm.durationMinutes"></label>
                <label class="field">Cara interview
                  <select [(ngModel)]="interviewForm.mode">
                    <option value="ONLINE">Online</option>
                    <option value="ONSITE">Tatap muka</option>
                    <option value="PHONE">Telepon</option>
                  </select>
                </label>
                <label class="field">Pewawancara<input [(ngModel)]="interviewForm.interviewer" placeholder="Nama dan jabatan"></label>
                <label class="field span-2">{{ interviewForm.mode === 'ONLINE' ? 'Tautan meeting' : interviewForm.mode === 'PHONE' ? 'Nomor telepon' : 'Lokasi' }}<input [(ngModel)]="interviewForm.locationOrLink"></label>
                <label class="field span-2">Untuk lowongan
                  <select [(ngModel)]="interviewForm.jobListingId">
                    <option [ngValue]="null">Talent Pool (tanpa lowongan)</option>
                    <option *ngFor="let job of jobs" [ngValue]="job.id">{{ job.title }}</option>
                  </select>
                </label>
                <label class="field span-2">Catatan <span class="opt">(opsional)</span><textarea [(ngModel)]="interviewForm.notes" rows="3"></textarea></label>
              </div>
              <div class="alert alert-error" *ngIf="interviewError" role="alert"><app-icon name="alert"></app-icon><span>{{ interviewError }}</span></div>
              <div class="button-row">
                <button class="btn btn-primary" (click)="scheduleInterview()" [disabled]="scheduling">{{ scheduling ? 'Menyimpan…' : 'Simpan jadwal' }}</button>
                <button class="btn btn-ghost" (click)="showInterviewForm = false">Batal</button>
              </div>
            </section>

            <section class="drawer-section">
              <h3>Masukkan ke lowongan</h3>
              <p class="muted" style="font-size: 14px" *ngIf="selected.movedToJobListing">Kandidat ini sudah pernah dimasukkan ke lowongan.</p>
              <div class="form-grid" *ngIf="jobs.length; else noJobs">
                <label class="field">Lowongan
                  <select [(ngModel)]="moveForm.jobListingId">
                    <option value="">Pilih lowongan yang dibuka</option>
                    <option *ngFor="let job of jobs" [value]="job.id">{{ job.title }}</option>
                  </select>
                </label>
                <label class="field">Mulai dari tahap
                  <select [(ngModel)]="moveForm.hiringStage">
                    <option value="NEW_CANDIDATE">Baru</option>
                    <option value="SCREENING">Screening</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="OFFER">Penawaran</option>
                  </select>
                </label>
              </div>
              <ng-template #noJobs><p class="muted" style="font-size: 14px">Belum ada lowongan yang dibuka.</p></ng-template>
              <div class="alert alert-error" *ngIf="moveError" role="alert"><app-icon name="alert"></app-icon><span>{{ moveError }}</span></div>
              <div class="alert alert-success" *ngIf="moveSuccess" role="status"><app-icon name="check"></app-icon><span>{{ moveSuccess }}</span></div>
              <div class="button-row" *ngIf="jobs.length">
                <button type="button" class="btn btn-secondary" (click)="moveToJobListing()" [disabled]="moving">{{ moving ? 'Menyimpan…' : 'Masukkan ke lowongan' }}</button>
              </div>
            </section>

            <section class="drawer-section" *ngIf="selected.tools?.length">
              <h3>Tools yang dikuasai</h3>
              <div class="chips"><span class="chip" *ngFor="let tool of selected.tools">{{ tool }}</span></div>
            </section>

            <section class="drawer-section">
              <h3>Kontak</h3>
              <dl class="facts two">
                <div><dt>Email</dt><dd>{{ selected.email || '-' }}</dd></div>
                <div><dt>WhatsApp</dt><dd>{{ selected.phone || '-' }}</dd></div>
                <div><dt>Tanggal lahir</dt><dd>{{ selected.birthDate ? fmt.fullDate(selected.birthDate) : '-' }}</dd></div>
                <div><dt>Ekspektasi gaji</dt><dd>{{ fmt.salaryRange(selected.expectedSalary, selected.profileDetails?.expectedSalaryMax) }}</dd></div>
              </dl>
            </section>

            <section class="drawer-section" *ngIf="selected.about">
              <h3>Tentang kandidat</h3>
              <p class="about-copy" style="font-size: 14.5px">{{ selected.about }}</p>
            </section>

            <section class="drawer-section">
              <h3>Pengalaman kerja</h3>
              <article class="detail-item" *ngFor="let exp of selected.workExperiences">
                <strong>{{ exp.position }}, {{ exp.companyName }}</strong>
                <span>{{ fmt.monthYear(exp.startDate) }} – {{ exp.currentJob ? 'sekarang' : fmt.monthYear(exp.endDate) }}</span>
                <p *ngIf="exp.description">{{ exp.description }}</p>
                <div class="chips" style="margin-top: 8px" *ngIf="exp.details?.skills?.length || exp.details?.tools?.length">
                  <span class="chip" *ngFor="let skill of (exp.details?.skills || []).concat(exp.details?.tools || [])">{{ skill }}</span>
                </div>
              </article>
              <p class="muted" style="font-size: 14px" *ngIf="!selected.workExperiences?.length">Belum ada pengalaman kerja.</p>
            </section>

            <section class="drawer-section">
              <h3>Pendidikan dan pelatihan</h3>
              <article class="detail-item" *ngFor="let edu of selected.educations">
                <strong>{{ edu.institution }}</strong>
                <span>{{ edu.level || '-' }}{{ edu.major ? ', ' + edu.major : '' }} · {{ edu.startYear || '-' }}–{{ edu.endYear || '-' }}{{ edu.ipk ? ' · IPK ' + edu.ipk : '' }}</span>
                <p *ngIf="edu.description">{{ edu.description }}</p>
              </article>
              <article class="detail-item" *ngFor="let cert of selected.profileDetails?.trainingCertifications || []">
                <strong>{{ cert.name }}</strong>
                <span>{{ cert.issuingOrganization }} · berlaku sampai {{ fmt.fullDate(cert.expiryDate) }}</span>
              </article>
            </section>

            <section class="drawer-section">
              <h3>Data pribadi</h3>
              <app-talent-profile-details [profile]="selected" [backoffice]="true"></app-talent-profile-details>
            </section>

            <section class="drawer-section" *ngIf="selected.portfolios?.length">
              <h3>Portofolio</h3>
              <a class="link" *ngFor="let item of selected.portfolios" [href]="item.url" target="_blank" rel="noreferrer">
                {{ item.title || item.originalName || 'Portofolio' }} <app-icon name="arrow-up-right" [size]="14"></app-icon>
              </a>
            </section>
          </div>

          <ng-template #detailLoading>
            <div class="full-loading">Memuat profil kandidat…</div>
          </ng-template>
        </aside>
      </div>
    </app-backoffice-layout>
  `,
})
export class BackofficeCandidatesComponent implements OnInit, OnDestroy {
  readonly fmt = FMT;
  rows: any[] = [];
  jobs: any[] = [];
  pictureUrls: Record<string, string> = {};
  q = '';
  loading = false;
  drawerOpen = false;
  selected: any = null;
  showInterviewForm = false;
  scheduling = false;
  interviewError = '';
  moving = false;
  moveError = '';
  moveSuccess = '';
  moveForm = { jobListingId: '', hiringStage: 'NEW_CANDIDATE' };
  statuses = ['AVAILABLE','SCREENED','POTENTIAL','ARCHIVED','REJECTED','SPAM','BLOCKED','WITHDRAWN','HIRED'];

  interviewForm: any = {
    jobListingId: null,
    scheduledAt: '',
    durationMinutes: 60,
    mode: 'ONLINE',
    locationOrLink: '',
    interviewer: '',
    notes: '',
  };

  constructor(private api: BackofficeApiService) {}

  ngOnInit(): void {
    this.load();
    this.api.jobListings('').subscribe({ next: (result) => this.jobs = (result?.content || []).filter((job: any) => job.status === 'PUBLISHED') });
  }

  ngOnDestroy(): void {
    Object.values(this.pictureUrls).forEach((url) => URL.revokeObjectURL(url));
  }

  load(): void {
    this.loading = true;
    this.api.candidates(this.q).subscribe({
      next: (result) => {
        Object.values(this.pictureUrls).forEach((url) => URL.revokeObjectURL(url));
        this.pictureUrls = {};
        this.rows = result?.content || [];
        this.rows.forEach((item) => this.loadPicture(item.id));
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  private loadPicture(id: string): void {
    this.api.candidatePicture(id).subscribe({
      next: (blob) => {
        if (!blob.size) return;
        const previous = this.pictureUrls[id];
        if (previous) URL.revokeObjectURL(previous);
        this.pictureUrls[id] = URL.createObjectURL(blob);
      },
    });
  }

  openCandidate(item: any): void {
    this.drawerOpen = true;
    this.selected = null;
    this.showInterviewForm = false;
    this.interviewError = '';
    this.moveError = '';
    this.moveSuccess = '';
    this.moveForm = { jobListingId: '', hiringStage: 'NEW_CANDIDATE' };
    this.api.candidateDetail(item.id).subscribe({
      next: (detail) => this.selected = detail,
      error: () => this.closeDrawer(),
    });
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.selected = null;
    this.showInterviewForm = false;
  }

  closeOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('bo-candidate-backdrop')) this.closeDrawer();
  }

  downloadCv(): void {
    if (!this.selected?.id) return;
    this.api.candidateCv(this.selected.id).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = this.selected.cvOriginalName || 'candidate-cv';
        anchor.click();
        URL.revokeObjectURL(url);
      },
    });
  }

  scheduleInterview(): void {
    if (!this.selected?.id || !this.interviewForm.scheduledAt || !this.interviewForm.interviewer.trim()) {
      this.interviewError = 'Isi tanggal, jam, dan nama pewawancara.';
      return;
    }

    this.scheduling = true;
    this.interviewError = '';
    this.api.createInterview({
      candidateId: this.selected.id,
      jobListingId: this.interviewForm.jobListingId || null,
      scheduledAt: new Date(this.interviewForm.scheduledAt).toISOString(),
      durationMinutes: Number(this.interviewForm.durationMinutes || 60),
      mode: this.interviewForm.mode,
      locationOrLink: this.interviewForm.locationOrLink || null,
      interviewer: this.interviewForm.interviewer.trim(),
      notes: this.interviewForm.notes || null,
    }).subscribe({
      next: () => {
        this.scheduling = false;
        this.showInterviewForm = false;
        this.interviewForm = { jobListingId: null, scheduledAt: '', durationMinutes: 60, mode: 'ONLINE', locationOrLink: '', interviewer: '', notes: '' };
      },
      error: (error) => {
        this.scheduling = false;
        this.interviewError = error?.error?.message || 'Jadwal interview belum tersimpan. Periksa isian lalu coba lagi.';
      },
    });
  }

  moveToJobListing(): void {
    if (!this.selected?.id || !this.moveForm.jobListingId) {
      this.moveError = 'Pilih lowongan terlebih dahulu.';
      return;
    }
    this.moving = true;
    this.moveError = '';
    this.moveSuccess = '';
    this.api.moveCandidateToJobListing(this.selected.id, this.moveForm.jobListingId, this.moveForm.hiringStage).subscribe({
      next: (updated) => {
        this.selected = updated;
        const row = this.rows.find((item) => item.id === updated.id);
        if (row) row.movedToJobListing = updated.movedToJobListing;
        this.moving = false;
        this.moveSuccess = 'Kandidat dimasukkan ke lowongan.';
      },
      error: (error) => {
        this.moving = false;
        this.moveError = error?.error?.message || 'Kandidat belum berhasil dimasukkan ke lowongan. Coba lagi.';
      },
    });
  }

  changeStatus(item: any, status: string): void {
    this.api.updateCandidateStatus(item.id, status).subscribe({ next: (updated) => item.status = updated.status });
  }

  initials(name: string): string {
    return String(name || 'T').split(/\s+/).filter(Boolean).slice(0,2).map((x) => x[0]).join('').toUpperCase();
  }

  experience(months: number): string {
    if (!months) return '-';
    const years = Math.floor(months / 12);
    const rest = months % 12;
    if (!years) return `${rest} bln`;
    return rest ? `${years} th ${rest} bln` : `${years} th`;
  }
}

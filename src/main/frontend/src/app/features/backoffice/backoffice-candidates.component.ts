import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TalentProfileDetailsComponent } from '../../shared/talent-profile-details.component';
import { BackofficeOverlayDirective } from '../../shared/backoffice-overlay.directive';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';

@Component({
  selector: 'app-backoffice-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule, BackofficeLayoutComponent, TalentProfileDetailsComponent, BackofficeOverlayDirective],
  template: `
    <app-backoffice-layout active="candidates">
      <div class="bo-page-head">
        <div>
          <span class="bo-kicker">TALENT DATABASE</span>
          <h1>Candidates</h1>
          <p>Kelola kandidat, lihat profil lengkap, CV, dan jadwalkan interview.</p>
        </div>
        <div class="bo-head-actions">
          <input class="bo-search" [(ngModel)]="q" (keyup.enter)="load()" placeholder="Cari nama, email, posisi...">
          <button class="bo-primary" (click)="load()">Cari</button>
        </div>
      </div>

      <section class="bo-table-card">
        <div class="bo-table-meta">
          <strong>{{ rows.length }} candidate</strong>
          <span *ngIf="loading">Memuat...</span>
        </div>

        <div class="bo-table-wrap">
          <table class="bo-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Position</th>
                <th>Experience</th>
                <th>Tools</th>
                <th>Status</th>
                <th>Source</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of rows">
                <td>
                  <div class="bo-person">
                    <span class="bo-person-avatar">
                      <img *ngIf="pictureUrls[item.id]; else tableInitials" [src]="pictureUrls[item.id]" [alt]="'Foto ' + item.fullName">
                      <ng-template #tableInitials>{{ initials(item.fullName) }}</ng-template>
                    </span>
                    <div><strong>{{ item.fullName }}</strong><small>{{ item.email }}</small></div>
                  </div>
                </td>
                <td><strong>{{ item.relatedPosition || '-' }}</strong><small>{{ item.industry || '-' }}</small></td>
                <td>{{ experience(item.experienceMonths) }}</td>
                <td><div class="bo-tags"><span *ngFor="let tool of item.tools?.slice(0,3)">{{ tool }}</span></div></td>
                <td>
                  <select class="bo-status-select" [ngModel]="item.status" (ngModelChange)="changeStatus(item, $event)">
                    <option *ngFor="let status of statuses" [value]="status">{{ status }}</option>
                  </select>
                </td>
                <td>{{ item.source || '-' }}</td>
                <td><button class="bo-row-action" (click)="openCandidate(item)">Lihat Profil →</button></td>
              </tr>
              <tr *ngIf="!rows.length && !loading"><td colspan="7" class="bo-empty-cell">Belum ada kandidat.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="bo-mobile-list bo-candidate-mobile-list">
        <article class="bo-mobile-card" *ngFor="let item of rows">
          <div class="bo-mobile-card-head">
            <div class="bo-person">
              <span class="bo-person-avatar">
                <img *ngIf="pictureUrls[item.id]; else mobileInitials" [src]="pictureUrls[item.id]" [alt]="'Foto ' + item.fullName">
                <ng-template #mobileInitials>{{ initials(item.fullName) }}</ng-template>
              </span>
              <div><strong>{{ item.fullName }}</strong><small>{{ item.email }}</small></div>
            </div>
            <span class="bo-badge green">{{ item.status }}</span>
          </div>

          <div class="bo-mobile-meta-grid">
            <div><span>Position</span><strong>{{ item.relatedPosition || '-' }}</strong></div>
            <div><span>Experience</span><strong>{{ experience(item.experienceMonths) }}</strong></div>
            <div><span>Source</span><strong>{{ item.source || '-' }}</strong></div>
          </div>

          <div class="bo-tags" *ngIf="item.tools?.length">
            <span *ngFor="let tool of item.tools?.slice(0,4)">{{ tool }}</span>
          </div>

          <div class="bo-mobile-card-actions">
            <select class="bo-status-select" [ngModel]="item.status" (ngModelChange)="changeStatus(item, $event)">
              <option *ngFor="let status of statuses" [value]="status">{{ status }}</option>
            </select>
            <button class="bo-primary" (click)="openCandidate(item)">Lihat Profil</button>
          </div>
        </article>

        <div class="bo-empty-card" *ngIf="!rows.length && !loading">Belum ada kandidat.</div>
      </section>

      <div class="drawer-backdrop bo-candidate-backdrop" *ngIf="drawerOpen" (click)="closeOnBackdrop($event)">
        <aside class="side-drawer bo-candidate-drawer" [boOverlay]="true" (overlayClose)="closeDrawer()" aria-label="Profil kandidat">
          <header>
            <div>
              <span class="bo-kicker">CANDIDATE PROFILE</span>
              <h2>{{ selected?.fullName || 'Candidate' }}</h2>
              <p>{{ selected?.email || '-' }} • {{ selected?.phone || '-' }}</p>
            </div>
            <button type="button" (click)="closeDrawer()" aria-label="Tutup panel">×</button>
          </header>

          <div class="drawer-body" *ngIf="selected; else detailLoading">
            <div class="bo-candidate-summary">
              <span class="bo-candidate-avatar-lg">
                <img *ngIf="pictureUrls[selected.id]; else drawerInitials" [src]="pictureUrls[selected.id]" [alt]="'Foto ' + selected.fullName">
                <ng-template #drawerInitials>{{ initials(selected.fullName) }}</ng-template>
              </span>
              <div>
                <h3>{{ selected.fullName }}</h3>
                <p>{{ selected.relatedJobPositions?.join(', ') || selected.jobPosition || 'Talent Pool Candidate' }}</p>
                <span class="bo-badge green">{{ selected.status || '-' }}</span>
              </div>
            </div>

            <div class="bo-candidate-actions">
              <button class="bo-primary" (click)="downloadCv()" [disabled]="!selected.cvOriginalName">Lihat / Download CV</button>
              <button class="bo-secondary" (click)="showInterviewForm = !showInterviewForm">Jadwalkan Interview</button>
            </div>

            <section class="bo-detail-section bo-move-candidate">
              <div class="section-title"><h2>Masukkan ke Job Listing</h2></div>
              <p *ngIf="selected.movedToJobListing" class="bo-move-success">Kandidat ini sudah pernah ditempatkan ke lowongan.</p>
              <div class="drawer-form">
                <label>Lowongan aktif
                  <select [(ngModel)]="moveForm.jobListingId">
                    <option value="">Pilih job listing</option>
                    <option *ngFor="let job of jobs" [value]="job.id">{{ job.title }}</option>
                  </select>
                </label>
                <label>Tahap rekrutmen
                  <select [(ngModel)]="moveForm.hiringStage">
                    <option value="NEW_CANDIDATE">Kandidat Baru</option>
                    <option value="SCREENING">Screening</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="OFFER">Offer</option>
                  </select>
                </label>
                <button type="button" class="bo-primary" (click)="moveToJobListing()" [disabled]="moving || !jobs.length">
                  {{ moving ? 'Menyimpan...' : 'Masukkan Kandidat' }}
                </button>
                <p class="form-error" *ngIf="moveError">{{ moveError }}</p>
                <p class="bo-move-success" *ngIf="moveSuccess">{{ moveSuccess }}</p>
                <p class="empty-state" *ngIf="!jobs.length">Belum ada job listing aktif yang bisa dipilih.</p>
              </div>
            </section>

            <app-talent-profile-details [profile]="selected" [backoffice]="true"></app-talent-profile-details>
            <section class="bo-detail-section" *ngIf="showInterviewForm">
              <div class="section-title"><h2>Jadwalkan Interview</h2></div>
              <div class="drawer-form">
                <div class="drawer-grid">
                  <label>Tanggal & Jam<input type="datetime-local" [(ngModel)]="interviewForm.scheduledAt"></label>
                  <label>Durasi (menit)<input type="number" min="15" max="480" [(ngModel)]="interviewForm.durationMinutes"></label>
                </div>
                <div class="drawer-grid">
                  <label>Mode
                    <select [(ngModel)]="interviewForm.mode">
                      <option value="ONLINE">Online</option>
                      <option value="ONSITE">Onsite</option>
                      <option value="PHONE">Phone</option>
                    </select>
                  </label>
                  <label>Interviewer<input [(ngModel)]="interviewForm.interviewer" placeholder="Nama interviewer"></label>
                </div>
                <label>Lokasi / Link<input [(ngModel)]="interviewForm.locationOrLink" placeholder="Meeting link atau lokasi"></label>
                <label>Job Listing
                  <select [(ngModel)]="interviewForm.jobListingId">
                    <option [ngValue]="null">Tanpa job listing</option>
                    <option *ngFor="let job of jobs" [ngValue]="job.id">{{ job.title }}</option>
                  </select>
                </label>
                <label>Catatan<textarea [(ngModel)]="interviewForm.notes" placeholder="Catatan untuk interview"></textarea></label>
                <button class="bo-primary" (click)="scheduleInterview()" [disabled]="scheduling">
                  {{ scheduling ? 'Menyimpan...' : 'Simpan Jadwal Interview' }}
                </button>
                <p class="form-error" *ngIf="interviewError">{{ interviewError }}</p>
              </div>
            </section>

            <section class="bo-detail-section">
              <div class="section-title"><h2>About</h2></div>
              <p>{{ selected.about || '-' }}</p>
            </section>

            <section class="bo-detail-section">
              <div class="section-title"><h2>Data Pribadi</h2></div>
              <div class="info-grid">
                <article><span>Email</span><strong>{{ selected.email || '-' }}</strong></article>
                <article><span>WhatsApp</span><strong>{{ selected.phone || '-' }}</strong></article>
                <article><span>Birth Date</span><strong>{{ selected.birthDate || '-' }}</strong></article>
                <article><span>Religion</span><strong>{{ selected.religion || '-' }}</strong></article>
              </div>
            </section>

            <section class="bo-detail-section">
              <div class="section-title"><h2>Work Experience</h2></div>
              <article class="bo-detail-item" *ngFor="let exp of selected.workExperiences">
                <strong>{{ exp.position }} • {{ exp.companyName }}</strong>
                <span>{{ exp.startDate }} — {{ exp.currentJob ? 'Sekarang' : (exp.endDate || '-') }}</span>
                <p>{{ exp.description || '-' }}</p>
              </article>
              <div class="empty-state" *ngIf="!selected.workExperiences?.length">Belum ada pengalaman kerja.</div>
            </section>

            <section class="bo-detail-section">
              <div class="section-title"><h2>Education</h2></div>
              <article class="bo-detail-item" *ngFor="let edu of selected.educations">
                <strong>{{ edu.institution }}</strong>
                <span>{{ edu.level || '-' }} • {{ edu.major || '-' }} • {{ edu.startYear || '-' }} — {{ edu.endYear || '-' }}</span>
                <p>{{ edu.description || '-' }}</p>
              </article>
            </section>

            <section class="bo-detail-section">
              <div class="section-title"><h2>Tools & Skills</h2></div>
              <div class="bo-tags"><span *ngFor="let tool of selected.tools">{{ tool }}</span></div>
            </section>

            <section class="bo-detail-section">
              <div class="section-title"><h2>Portfolio</h2></div>
              <a class="bo-portfolio-link" *ngFor="let item of selected.portfolios" [href]="item.url" target="_blank" rel="noreferrer">
                {{ item.title || item.originalName || 'Portfolio' }} ↗
              </a>
            </section>
          </div>

          <ng-template #detailLoading>
            <div class="full-loading bo-drawer-loading">Memuat profil kandidat...</div>
          </ng-template>
        </aside>
      </div>
    </app-backoffice-layout>
  `,
})
export class BackofficeCandidatesComponent implements OnInit, OnDestroy {
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
      this.interviewError = 'Tanggal/jam dan interviewer wajib diisi.';
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
        this.interviewError = error?.error?.message || 'Jadwal interview gagal disimpan.';
      },
    });
  }

  moveToJobListing(): void {
    if (!this.selected?.id || !this.moveForm.jobListingId) {
      this.moveError = 'Pilih job listing terlebih dahulu.';
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
        this.moveSuccess = 'Kandidat berhasil dimasukkan ke job listing.';
      },
      error: (error) => {
        this.moving = false;
        this.moveError = error?.error?.message || 'Kandidat gagal dimasukkan ke job listing.';
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

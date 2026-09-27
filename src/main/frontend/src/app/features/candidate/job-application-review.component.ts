import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CareerHeaderComponent } from '../../shared/career-header.component';
import { CandidateProfile, JobApplication, JobListing } from '../../core/models/talent.models';
import { TalentPortalService } from '../../core/service/api/talent-portal.service';

@Component({
  selector: 'app-job-application-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CareerHeaderComponent],
  template: `
    <div class="portal-page">
      <app-career-header active="portal"></app-career-header>

      <main class="apply-review-page" *ngIf="job && profile; else loadingTpl">
        <a [routerLink]="['/jobs', job.id]" class="back-link">← Kembali ke Detail Lowongan</a>

        <div class="apply-steps">
          <span class="done">1</span><b>Lowongan</b>
          <i></i>
          <span class="active">2</span><b>Review Lamaran</b>
          <i></i>
          <span>3</span><b>Selesai</b>
        </div>

        <section class="apply-review-grid">
          <article class="apply-review-card">
            <div class="apply-sarinah-brand">
              <img src="images/sarinah.png" alt="Sarinah">
              <div>
                <strong>Sarinah Career</strong>
                <span>Talent Recruitment</span>
              </div>
            </div>
            <span class="bo-kicker">REVIEW APPLICATION</span>
            <h1>{{ job.title }}</h1>
            <p class="apply-subtitle">{{ job.department || 'Sarinah' }} • {{ job.location || '-' }} • {{ job.employmentType || '-' }}</p>

            <div class="apply-profile-check">
              <div>
                <strong>{{ profile.fullName }}</strong>
                <span>{{ profile.email }} • {{ profile.phone || '-' }}</span>
              </div>
              <a routerLink="/portal">Edit Profil</a>
            </div>

            <div class="apply-checklist">
              <div [class.ok]="!!profile.cvOriginalName">
                <span>{{ profile.cvOriginalName ? '✓' : '!' }}</span>
                <div><strong>CV</strong><small>{{ profile.cvOriginalName || 'CV belum tersedia' }}</small></div>
              </div>
              <div [class.ok]="!!profile.phone">
                <span>{{ profile.phone ? '✓' : '!' }}</span>
                <div><strong>Kontak</strong><small>{{ profile.phone || 'Nomor WhatsApp belum tersedia' }}</small></div>
              </div>
              <div [class.ok]="profile.workExperiences.length > 0 || profile.educations.length > 0">
                <span>{{ (profile.workExperiences.length || profile.educations.length) ? '✓' : '!' }}</span>
                <div><strong>Profil Karier</strong><small>Pengalaman dan pendidikan kandidat</small></div>
              </div>
            </div>

            <label class="apply-notes">Catatan untuk recruiter <span>(opsional)</span>
              <textarea [(ngModel)]="notes" maxlength="2000" placeholder="Tambahkan informasi singkat yang relevan dengan posisi ini..."></textarea>
            </label>

            <label class="apply-confirm">
              <input type="checkbox" [(ngModel)]="confirmed">
              <span>Saya memastikan data profil dan CV yang digunakan untuk lamaran ini sudah benar.</span>
            </label>

            <p class="form-error" *ngIf="error">{{ error }}</p>

            <button class="primary-button apply-submit" [disabled]="submitting || !confirmed || !canApply" (click)="submit()">
              {{ submitting ? 'Mengirim Lamaran...' : 'Kirim Lamaran →' }}
            </button>
          </article>

          <aside class="apply-job-summary">
            <span class="bo-badge green">PUBLISHED</span>
            <h2>{{ job.title }}</h2>
            <p>{{ job.department || 'Sarinah' }}</p>
            <div><span>Location</span><strong>{{ job.location || '-' }}</strong></div>
            <div><span>Type</span><strong>{{ job.employmentType || '-' }}</strong></div>
            <div><span>Deadline</span><strong>{{ job.applicationDeadline || '-' }}</strong></div>
            <small>Setelah dikirim, status lamaran dapat dipantau dari Talent Pool → Lamaran Saya.</small>
          </aside>
        </section>
      </main>

      <ng-template #loadingTpl>
        <div class="full-loading">{{ error || 'Menyiapkan lamaran...' }}</div>
      </ng-template>
    </div>
  `,
})
export class JobApplicationReviewComponent implements OnInit {
  job: JobListing | null = null;
  profile: CandidateProfile | null = null;
  existing: JobApplication | null = null;
  notes = '';
  confirmed = false;
  submitting = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private portal: TalentPortalService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Lowongan tidak ditemukan.';
      return;
    }

    this.portal.job(id).subscribe({
      next: (job) => this.job = job,
      error: (error) => this.error = error?.error?.message || 'Lowongan tidak tersedia.',
    });

    this.portal.profile().subscribe({
      next: (profile) => this.profile = profile,
      error: () => this.error = 'Profil kandidat gagal dimuat.',
    });

    this.portal.applications().subscribe({
      next: (result) => {
        this.existing = (result.content || []).find((item) => item.jobListingId === id) || null;
        if (this.existing) {
          this.error = 'Anda sudah pernah melamar lowongan ini.';
        }
      },
    });
  }

  get canApply(): boolean {
    return !!this.profile?.cvOriginalName
      && !!this.profile?.phone
      && !this.existing;
  }

  submit(): void {
    if (!this.job || !this.canApply || !this.confirmed || this.submitting) return;

    this.submitting = true;
    this.error = '';

    this.portal.apply(this.job.id, this.notes).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/portal'], { queryParams: { applied: this.job?.id } });
      },
      error: (error) => {
        this.submitting = false;
        this.error = error?.error?.message || 'Lamaran gagal dikirim.';
      },
    });
  }
}

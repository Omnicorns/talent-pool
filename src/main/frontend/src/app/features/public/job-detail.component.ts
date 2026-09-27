import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CareerHeaderComponent } from '../../shared/career-header.component';
import { PublicJobService } from '../../core/service/api/public-job.service';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';
import { JobListing } from '../../core/models/talent.models';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CareerHeaderComponent],
  template: `
    <div class="page-shell">
      <app-career-header active="open"></app-career-header>

      <main class="job-detail-page" *ngIf="job; else loadingTpl">
        <a routerLink="/open-positions" class="back-link">← Kembali ke Open Positions</a>

        <section class="job-detail-hero">
          <div>
            <span class="bo-kicker">OPEN POSITION</span>
            <h1>{{ job.title }}</h1>
            <p>{{ job.department || 'Sarinah' }} • {{ job.location || 'Jakarta' }} • {{ job.employmentType || '-' }}</p>
          </div>
          <div class="job-detail-cta">
            <small *ngIf="job.applicationDeadline">Batas lamaran {{ job.applicationDeadline | date:'dd MMM yyyy' }}</small>
            <button class="primary-button" (click)="startApply()">Apply Sekarang →</button>
          </div>
        </section>

        <section class="job-detail-grid">
          <article class="job-detail-main">
            <div class="job-detail-section">
              <h2>Tentang Posisi</h2>
              <p>{{ job.description || 'Deskripsi lowongan belum tersedia.' }}</p>
            </div>

            <div class="job-detail-section" *ngIf="job.requirements">
              <h2>Requirements</h2>
              <p>{{ job.requirements }}</p>
            </div>
          </article>

          <aside class="job-detail-summary">
            <h3>Ringkasan Lowongan</h3>
            <div><span>Department</span><strong>{{ job.department || '-' }}</strong></div>
            <div><span>Location</span><strong>{{ job.location || '-' }}</strong></div>
            <div><span>Employment Type</span><strong>{{ job.employmentType || '-' }}</strong></div>
            <div><span>Deadline</span><strong>{{ job.applicationDeadline || '-' }}</strong></div>
          </aside>
        </section>
      </main>

      <ng-template #loadingTpl>
        <div class="full-loading">{{ error || 'Memuat detail lowongan...' }}</div>
      </ng-template>
    </div>
  `,
})
export class JobDetailComponent implements OnInit {
  job: JobListing | null = null;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobs: PublicJobService,
    public auth: TalentAuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Lowongan tidak ditemukan.';
      return;
    }

    this.jobs.detail(id).subscribe({
      next: (job) => this.job = job,
      error: (error) => this.error = error?.error?.message || 'Lowongan tidak tersedia.',
    });
  }

  startApply(): void {
    if (!this.job) return;

    const returnUrl = `/jobs/${this.job.id}/apply`;

    if (!this.auth.authenticated) {
      this.router.navigate(['/sign-in'], { queryParams: { returnUrl } });
      return;
    }

    if (this.auth.session?.onboardingCompleted === false) {
      this.router.navigate(['/onboarding'], { queryParams: { returnUrl } });
      return;
    }

    this.router.navigateByUrl(returnUrl);
  }
}

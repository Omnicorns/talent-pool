import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CareerHeaderComponent } from '../../shared/career-header.component';
import { CareerFooterComponent } from '../../shared/career-footer.component';
import { IconComponent } from '../../shared/icon.component';
import { PublicJobService } from '../../core/service/api/public-job.service';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';
import { JobListing } from '../../core/models/talent.models';
import { FMT } from '../../shared/labels';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CareerHeaderComponent, CareerFooterComponent, IconComponent],
  template: `
    <div class="site">
      <app-career-header active="open"></app-career-header>

      <main class="job-page" *ngIf="job; else loadingTpl">
        <div class="container">
          <a routerLink="/" fragment="open-positions" class="back-link"><app-icon name="arrow-left" [size]="16"></app-icon> Semua lowongan</a>

          <header class="job-head">
            <div>
              <p class="dept">{{ job.department || 'Sarinah' }}</p>
              <h1>{{ job.title }}</h1>
              <div class="job-head-meta">
                <span><app-icon name="pin" [size]="16"></app-icon>{{ job.location || 'Jakarta' }}</span>
                <span><app-icon name="briefcase" [size]="16"></app-icon>{{ fmt.label(job.employmentType) }}</span>
                <span *ngIf="job.applicationDeadline"><app-icon name="calendar" [size]="16"></app-icon>Lamar sebelum {{ fmt.fullDate(job.applicationDeadline) }}</span>
              </div>
            </div>
            <div class="job-head-cta">
              <button class="btn btn-primary btn-lg" (click)="startApply()">Lamar posisi ini</button>
            </div>
          </header>

          <div class="job-layout">
            <article class="prose">
              <h2>Tentang posisi</h2>
              <p>{{ job.description || 'Deskripsi lowongan belum tersedia.' }}</p>
              <ng-container *ngIf="job.requirements">
                <h2>Kualifikasi</h2>
                <p>{{ job.requirements }}</p>
              </ng-container>
            </article>

            <aside class="job-aside" aria-label="Ringkasan lowongan">
              <h2>Ringkasan</h2>
              <dl class="facts">
                <div><dt>Departemen</dt><dd>{{ job.department || '-' }}</dd></div>
                <div><dt>Lokasi</dt><dd>{{ job.location || '-' }}</dd></div>
                <div><dt>Tipe pekerjaan</dt><dd>{{ fmt.label(job.employmentType) }}</dd></div>
                <div><dt>Batas lamaran</dt><dd>{{ job.applicationDeadline ? fmt.fullDate(job.applicationDeadline) : 'Tanpa batas' }}</dd></div>
              </dl>
              <button class="btn btn-primary btn-block" (click)="startApply()">Lamar posisi ini</button>
            </aside>
          </div>
        </div>
      </main>

      <ng-template #loadingTpl>
        <main class="full-loading">
          <ng-container *ngIf="!error">Memuat lowongan…</ng-container>
          <ng-container *ngIf="error">
            <strong>{{ error }}</strong>
            <a routerLink="/" fragment="open-positions" class="btn btn-secondary">Lihat lowongan lain</a>
          </ng-container>
        </main>
      </ng-template>
      <app-career-footer></app-career-footer>
    </div>
  `,
})
export class JobDetailComponent implements OnInit {
  readonly fmt = FMT;
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
      error: (error) => this.error = error?.error?.message || 'Lowongan ini sudah tidak tersedia.',
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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CareerHeaderComponent } from '../../shared/career-header.component';
import { TalentAuthService } from '../../core/service/api/talent-auth.service';
import { PublicJobService } from '../../core/service/api/public-job.service';
import { JobListing } from '../../core/models/talent.models';

@Component({
  selector: 'app-open-positions',
  standalone: true,
  imports: [CommonModule, RouterLink, CareerHeaderComponent],
  template: `
    <div class="page-shell">
      <app-career-header active="open"></app-career-header>

      <main class="jobs-page">
        <div class="page-title">
          <span>OPEN POSITIONS</span>
          <h1>Find your next opportunity.</h1>
          <p>Temukan posisi yang sesuai dengan pengalaman dan minat Anda.</p>
        </div>

        <div *ngIf="loading" class="empty-state">Memuat lowongan...</div>
        <div *ngIf="error" class="error-state">{{ error }}</div>

        <div class="job-list" *ngIf="!loading">
          <article class="job-card" *ngFor="let job of jobs">
            <div>
              <small>{{ job.department || 'Sarinah' }}</small>
              <h2>{{ job.title }}</h2>
              <p>{{ job.location || 'Jakarta' }} • {{ job.employmentType || 'Full Time' }}</p>
            </div>
            <a [routerLink]="['/jobs', job.id]" class="job-action">
              Lihat Detail →
            </a>
          </article>
          <div class="empty-state" *ngIf="!jobs.length && !error">Belum ada posisi yang tersedia.</div>
        </div>
      </main>
    </div>
  `,
})
export class OpenPositionsComponent implements OnInit {
  jobs: JobListing[] = [];
  loading = true;
  error = '';

  constructor(private jobsApi: PublicJobService, public auth: TalentAuthService) {}

  ngOnInit(): void {
    this.jobsApi.list().subscribe({
      next: (result: any) => {
        this.jobs = Array.isArray(result) ? result : (result?.content || []);
        this.loading = false;
      },
      error: (error) => {
        this.error = error?.error?.message || 'Lowongan gagal dimuat.';
        this.loading = false;
      },
    });
  }
}

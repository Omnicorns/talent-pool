import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicJobService } from '../../core/service/api/public-job.service';
import { JobListing } from '../../core/models/talent.models';

@Component({
  selector: 'app-open-positions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="positions-content">
        <div class="section-head">
          <span>OPEN POSITIONS</span>
          <h2>Find your next opportunity.</h2>
          <p>Temukan posisi yang sesuai dengan pengalaman dan minat Anda.</p>
        </div>

        <div *ngIf="loading" class="empty-state" role="status">Memuat lowongan...</div>
        <div *ngIf="error" class="error-state" role="alert">
          <p>{{ error }}</p>
          <button type="button" class="outline-button" (click)="loadJobs()">Coba Lagi</button>
        </div>

        <div class="job-list" *ngIf="!loading">
          <article class="job-card" *ngFor="let job of jobs">
            <div>
              <small>{{ job.department || 'Sarinah' }}</small>
              <h3>{{ job.title }}</h3>
              <p>{{ job.location || 'Jakarta' }} • {{ job.employmentType || 'Full Time' }}</p>
            </div>
            <a [routerLink]="['/jobs', job.id]" class="job-action">
              Lihat Detail →
            </a>
          </article>
          <div class="empty-state" *ngIf="!jobs.length && !error">Belum ada posisi yang tersedia.</div>
        </div>
    </div>
  `,
})
export class OpenPositionsComponent implements OnInit {
  jobs: JobListing[] = [];
  loading = true;
  error = '';

  constructor(private jobsApi: PublicJobService) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading = true;
    this.error = '';
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

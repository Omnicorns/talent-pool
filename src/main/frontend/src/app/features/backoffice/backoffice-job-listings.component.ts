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
        </div>
      </div>

      <section class="bo-card-grid">
        <article class="bo-job-card" *ngFor="let job of rows">
          <div class="bo-job-top">
            <span class="bo-badge" [class.green]="job.status === 'PUBLISHED'" [class.gray]="job.status === 'DRAFT'">{{ job.status }}</span>
            <small>{{ job.applicationCount || 0 }} applications</small>
          </div>
          <h2>{{ job.title }}</h2>
          <p>{{ job.department || 'Sarinah' }} • {{ job.location || '-' }}</p>
          <div class="bo-job-info">
            <span><b>{{ job.openings }}</b><small>Openings</small></span>
            <span><b>{{ job.employmentType || '-' }}</b><small>Type</small></span>
            <span><b>{{ job.applicationDeadline || '-' }}</b><small>Deadline</small></span>
          </div>
        </article>

        <div class="bo-empty-card" *ngIf="!rows.length && !loading">Belum ada job listing.</div>
      </section>
    </app-backoffice-layout>
  `,
})
export class BackofficeJobListingsComponent implements OnInit {
  rows: any[] = [];
  q = '';
  loading = false;

  constructor(private api: BackofficeApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.jobListings(this.q).subscribe({
      next: (result) => { this.rows = result?.content || []; this.loading = false; },
      error: () => this.loading = false,
    });
  }
}

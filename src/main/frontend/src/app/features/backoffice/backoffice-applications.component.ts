import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';

@Component({
  selector: 'app-backoffice-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BackofficeLayoutComponent],
  template: `
    <app-backoffice-layout active="applications">
      <div class="bo-page-head">
        <div>
          <span class="bo-kicker">PIPELINE</span>
          <h1>Applications</h1>
          <p>Pantau kandidat per posisi dan pindahkan tahapan rekrutmen langsung dari tabel.</p>
        </div>
      </div>

      <section class="bo-table-card">
        <div class="bo-table-meta"><strong>{{ rows.length }} application</strong><span *ngIf="loading">Memuat...</span></div>
        <div class="bo-table-wrap">
          <table class="bo-table">
            <thead><tr><th>Candidate</th><th>Position</th><th>Stage</th><th>Status</th><th>Applied</th><th>Action</th></tr></thead>
            <tbody>
              <tr *ngFor="let item of rows">
                <td><strong>{{ item.candidateName }}</strong></td>
                <td>{{ item.jobTitle }}</td>
                <td>
                  <select class="bo-stage-select" [ngModel]="item.stage" (ngModelChange)="changeStage(item, $event)">
                    <option *ngFor="let stage of stages" [value]="stage">{{ label(stage) }}</option>
                  </select>
                </td>
                <td><span class="bo-badge" [class.green]="item.status === 'ACTIVE' || item.status === 'HIRED'" [class.red]="item.status === 'REJECTED'">{{ item.status }}</span></td>
                <td>{{ item.appliedAt | date:'dd MMM yyyy' }}</td>
                <td>
                  <a
                    *ngIf="item.stage === 'INTERVIEW'"
                    routerLink="/backoffice/interviews"
                    [queryParams]="{ candidateId: item.candidateId, jobId: item.jobListingId }"
                    class="bo-link-action">
                    Jadwalkan / Edit Interview →
                  </a>
                </td>
              </tr>
              <tr *ngIf="!rows.length && !loading"><td colspan="5" class="bo-empty-cell">Belum ada application.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="bo-mobile-list bo-application-mobile-list">
        <article class="bo-mobile-card" *ngFor="let item of rows">
          <div class="bo-mobile-card-head">
            <div>
              <strong>{{ item.candidateName }}</strong>
              <small>{{ item.jobTitle }}</small>
            </div>
            <span class="bo-badge"
                  [class.green]="item.status === 'ACTIVE' || item.status === 'HIRED'"
                  [class.red]="item.status === 'REJECTED'">
              {{ item.status }}
            </span>
          </div>

          <div class="bo-mobile-meta-grid">
            <div><span>Applied</span><strong>{{ item.appliedAt | date:'dd MMM yyyy' }}</strong></div>
            <div><span>Stage</span><strong>{{ label(item.stage) }}</strong></div>
          </div>

          <label class="bo-mobile-field">Update Stage
            <select class="bo-stage-select" [ngModel]="item.stage" (ngModelChange)="changeStage(item, $event)">
              <option *ngFor="let stage of stages" [value]="stage">{{ label(stage) }}</option>
            </select>
          </label>

          <a
            *ngIf="item.stage === 'INTERVIEW'"
            routerLink="/backoffice/interviews"
            [queryParams]="{ candidateId: item.candidateId, jobId: item.jobListingId }"
            class="bo-primary bo-mobile-interview-link">
            Jadwalkan / Edit Interview
          </a>
        </article>

        <div class="bo-empty-card" *ngIf="!rows.length && !loading">Belum ada application.</div>
      </section>
    </app-backoffice-layout>
  `,
})
export class BackofficeApplicationsComponent implements OnInit {
  rows: any[] = [];
  loading = false;
  stages = ['NEW_CANDIDATE','SCREENING','INTERVIEW','OFFER','HIRED','REJECTED'];

  constructor(private api: BackofficeApiService) {}

  ngOnInit(): void {
    this.loading = true;
    this.api.applications().subscribe({
      next: (result) => { this.rows = result?.content || []; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  changeStage(item: any, stage: string): void {
    this.api.updateApplicationStage(item.id, stage).subscribe({
      next: (updated) => {
        item.stage = updated.stage;
        item.status = updated.status;
      },
    });
  }

  label(value: string): string {
    return String(value || '').toLowerCase().replaceAll('_',' ').replace(/\b\w/g,(c) => c.toUpperCase());
  }
}

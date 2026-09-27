import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';

@Component({
  selector: 'app-backoffice-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, BackofficeLayoutComponent],
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
            <thead><tr><th>Candidate</th><th>Position</th><th>Stage</th><th>Status</th><th>Applied</th></tr></thead>
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
              </tr>
              <tr *ngIf="!rows.length && !loading"><td colspan="5" class="bo-empty-cell">Belum ada application.</td></tr>
            </tbody>
          </table>
        </div>
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

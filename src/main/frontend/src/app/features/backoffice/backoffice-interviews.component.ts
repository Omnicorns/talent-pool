import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';

@Component({
  selector: 'app-backoffice-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule, BackofficeLayoutComponent],
  template: `
    <app-backoffice-layout active="interviews">
      <div class="bo-page-head">
        <div>
          <span class="bo-kicker">INTERVIEW SCHEDULE</span>
          <h1>Interviews</h1>
          <p>Pantau jadwal interview kandidat dan update hasil prosesnya.</p>
        </div>
      </div>

      <section class="bo-table-card">
        <div class="bo-table-meta">
          <strong>{{ rows.length }} interview</strong>
          <span *ngIf="loading">Memuat...</span>
        </div>
        <div class="bo-table-wrap">
          <table class="bo-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job</th>
                <th>Schedule</th>
                <th>Mode</th>
                <th>Interviewer</th>
                <th>Status</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of rows">
                <td><strong>{{ item.candidateName }}</strong></td>
                <td>{{ item.jobTitle || 'General Talent Pool' }}</td>
                <td>
                  <strong>{{ item.scheduledAt | date:'dd MMM yyyy' }}</strong>
                  <small>{{ item.scheduledAt | date:'HH:mm' }} • {{ item.durationMinutes }} menit</small>
                </td>
                <td><span class="bo-badge">{{ item.mode }}</span><small>{{ item.locationOrLink || '-' }}</small></td>
                <td>{{ item.interviewer }}</td>
                <td>
                  <select class="bo-stage-select" [ngModel]="item.status" (ngModelChange)="changeStatus(item, $event)">
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="RESCHEDULED">Rescheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
                <td>
                  <select class="bo-stage-select" [(ngModel)]="item.result" [disabled]="item.status !== 'COMPLETED'">
                    <option value="PENDING">Pending</option>
                    <option value="PASSED">Passed</option>
                    <option value="FAILED">Failed</option>
                    <option value="HOLD">Hold</option>
                  </select>
                </td>
              </tr>
              <tr *ngIf="!rows.length && !loading">
                <td colspan="7" class="bo-empty-cell">Belum ada jadwal interview.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="bo-mobile-list bo-interview-mobile-list">
        <article class="bo-mobile-card" *ngFor="let item of rows">
          <div class="bo-mobile-card-head">
            <div>
              <strong>{{ item.candidateName }}</strong>
              <small>{{ item.jobTitle || 'General Talent Pool' }}</small>
            </div>
            <span class="bo-badge">{{ item.mode }}</span>
          </div>

          <div class="bo-mobile-meta-grid">
            <div><span>Schedule</span><strong>{{ item.scheduledAt | date:'dd MMM yyyy, HH:mm' }}</strong></div>
            <div><span>Interviewer</span><strong>{{ item.interviewer }}</strong></div>
            <div><span>Location</span><strong>{{ item.locationOrLink || '-' }}</strong></div>
          </div>

          <div class="bo-mobile-controls">
            <label>Status
              <select class="bo-stage-select" [ngModel]="item.status" (ngModelChange)="changeStatus(item, $event)">
                <option value="SCHEDULED">Scheduled</option>
                <option value="RESCHEDULED">Rescheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </label>
            <label>Result
              <select class="bo-stage-select" [(ngModel)]="item.result" [disabled]="item.status !== 'COMPLETED'">
                <option value="PENDING">Pending</option>
                <option value="PASSED">Passed</option>
                <option value="FAILED">Failed</option>
                <option value="HOLD">Hold</option>
              </select>
            </label>
          </div>
        </article>

        <div class="bo-empty-card" *ngIf="!rows.length && !loading">Belum ada jadwal interview.</div>
      </section>
    </app-backoffice-layout>
  `,
})
export class BackofficeInterviewsComponent implements OnInit {
  rows: any[] = [];
  loading = false;

  constructor(private api: BackofficeApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.interviews().subscribe({
      next: (result) => {
        this.rows = result?.content || [];
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  changeStatus(item: any, status: string): void {
    let result = item.result;
    if (status === 'COMPLETED' && (!result || result === 'PENDING')) {
      result = 'HOLD';
    }
    if (status === 'CANCELLED') result = 'PENDING';

    this.api.updateInterviewStatus(item.id, status, result, item.feedback || null).subscribe({
      next: (updated) => {
        item.status = updated.status;
        item.result = updated.result;
      },
    });
  }
}

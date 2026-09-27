import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';

@Component({
  selector: 'app-backoffice-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule, BackofficeLayoutComponent],
  template: `
    <app-backoffice-layout active="candidates">
      <div class="bo-page-head">
        <div>
          <span class="bo-kicker">TALENT DATABASE</span>
          <h1>Candidates</h1>
          <p>Kelola kandidat, status talent, posisi terkait, dan kompetensi.</p>
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
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of rows">
                <td>
                  <div class="bo-person">
                    <span class="bo-person-avatar">{{ initials(item.fullName) }}</span>
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
              </tr>
              <tr *ngIf="!rows.length && !loading"><td colspan="6" class="bo-empty-cell">Belum ada kandidat.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </app-backoffice-layout>
  `,
})
export class BackofficeCandidatesComponent implements OnInit {
  rows: any[] = [];
  q = '';
  loading = false;
  statuses = ['AVAILABLE','SCREENED','POTENTIAL','ARCHIVED','REJECTED','SPAM','BLOCKED','WITHDRAWN','HIRED'];

  constructor(private api: BackofficeApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.api.candidates(this.q).subscribe({
      next: (result) => { this.rows = result?.content || []; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  changeStatus(item: any, status: string): void {
    this.api.updateCandidateStatus(item.id, status).subscribe({
      next: (updated) => item.status = updated.status,
    });
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

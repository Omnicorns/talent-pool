import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';
import { FMT } from '../../shared/labels';
import { IconComponent } from '../../shared/icon.component';
import { PaginationComponent } from '../../shared/pagination.component';

@Component({
  selector: 'app-backoffice-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BackofficeLayoutComponent, IconComponent, PaginationComponent],
  template: `
    <app-backoffice-layout active="applications">
      <div class="bo-head">
        <div>
          <h1>Lamaran</h1>
          <p>Pindahkan tahap kandidat langsung dari daftar. Kandidat di tahap Interview bisa langsung dijadwalkan.</p>
        </div>
      </div>

      <div class="chips" role="tablist" aria-label="Filter tahap">
        <button type="button" role="tab" class="btn btn-sm" [class.btn-primary]="stageFilter === ''" [class.btn-secondary]="stageFilter !== ''" [attr.aria-selected]="stageFilter === ''" (click)="setStage('')">Semua ({{ allCount }})</button>
        <button type="button" role="tab" class="btn btn-sm" *ngFor="let stage of stages" [class.btn-primary]="stageFilter === stage" [class.btn-secondary]="stageFilter !== stage" [attr.aria-selected]="stageFilter === stage" (click)="setStage(stage)">{{ fmt.label(stage) }} ({{ countFor(stage) }})</button>
      </div>

      <section class="table-card responsive">
        <div class="table-meta"><span><strong>{{ total }}</strong> lamaran</span><span *ngIf="loading">Memuat…</span></div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Kandidat</th><th>Lowongan</th><th>Tahap</th><th>Status</th><th>Tanggal melamar</th><th><span class="sr-only">Aksi</span></th></tr></thead>
            <tbody>
              <tr *ngFor="let item of visible">
                <td><strong>{{ item.candidateName }}</strong></td>
                <td>{{ item.jobTitle }}</td>
                <td>
                  <select class="select-inline" [ngModel]="item.stage" (ngModelChange)="changeStage(item, $event)" [attr.aria-label]="'Tahap ' + item.candidateName">
                    <option *ngFor="let stage of stages" [value]="stage">{{ fmt.label(stage) }}</option>
                  </select>
                </td>
                <td><span class="tag" [ngClass]="'tag-' + fmt.tone(item.status)">{{ fmt.label(item.status) }}</span></td>
                <td>{{ fmt.fullDate(item.appliedAt) }}</td>
                <td class="actions">
                  <a *ngIf="item.stage === 'INTERVIEW'" routerLink="/backoffice/interviews" [queryParams]="{ candidateId: item.candidateId, jobId: item.jobListingId }" class="btn btn-secondary btn-sm">
                    <app-icon name="calendar" [size]="15"></app-icon> Atur interview
                  </a>
                </td>
              </tr>
              <tr *ngIf="!visible.length && !loading"><td colspan="6" class="empty-cell">{{ stageFilter ? 'Tidak ada lamaran di tahap ini.' : 'Belum ada lamaran masuk.' }}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="cards">
          <article *ngFor="let item of visible">
            <div class="card-head">
              <div><strong>{{ item.candidateName }}</strong><small>{{ item.jobTitle }}</small></div>
              <span class="tag" [ngClass]="'tag-' + fmt.tone(item.status)">{{ fmt.label(item.status) }}</span>
            </div>
            <div class="card-meta"><div><span>Tanggal melamar</span>{{ fmt.fullDate(item.appliedAt) }}</div></div>
            <div class="card-actions">
              <select class="select-inline" [ngModel]="item.stage" (ngModelChange)="changeStage(item, $event)" [attr.aria-label]="'Tahap ' + item.candidateName">
                <option *ngFor="let stage of stages" [value]="stage">{{ fmt.label(stage) }}</option>
              </select>
              <a *ngIf="item.stage === 'INTERVIEW'" routerLink="/backoffice/interviews" [queryParams]="{ candidateId: item.candidateId, jobId: item.jobListingId }" class="btn btn-secondary btn-sm">Atur interview</a>
            </div>
          </article>
          <p class="muted" style="padding: 32px 18px; text-align: center" *ngIf="!visible.length && !loading">Tidak ada lamaran.</p>
        </div>

        <app-pagination [page]="page" [size]="size" [total]="total" (pageChange)="goToPage($event)" (sizeChange)="changeSize($event)"></app-pagination>
      </section>
    </app-backoffice-layout>
  `,
})
export class BackofficeApplicationsComponent implements OnInit {
  readonly fmt = FMT;
  rows: any[] = [];
  loading = false;
  stageFilter = '';

  page = 0;
  size = 10;
  total = 0;
  counts: Record<string, number> = {};

  /** Server-side: baris yang tampil sudah difilter tahap dan dipaginasi oleh API. */
  get visible(): any[] {
    return this.rows;
  }

  get allCount(): number {
    return Object.values(this.counts).reduce((sum, n) => sum + n, 0);
  }

  countFor(stage: string): number {
    return this.counts[stage] ?? 0;
  }
  stages = ['NEW_CANDIDATE','SCREENING','INTERVIEW','OFFER','HIRED','REJECTED'];

  constructor(private api: BackofficeApiService) {}

  ngOnInit(): void {
    this.load();
  }

  setStage(stage: string): void {
    this.stageFilter = stage;
    this.page = 0;
    this.load();
  }

  goToPage(page: number): void {
    this.page = page;
    this.load();
  }

  changeSize(size: number): void {
    this.size = size;
    this.page = 0;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.applicationStageCounts().subscribe({ next: (counts) => this.counts = counts || {} });
    this.api.applications(this.page, this.size, this.stageFilter).subscribe({
      next: (result) => {
        this.total = result?.totalElements ?? 0;
        if (!(result?.content || []).length && this.page > 0) { this.page = Math.max(0, (result?.totalPages ?? 1) - 1); this.load(); return; }
        this.rows = result?.content || [];
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  changeStage(item: any, stage: string): void {
    this.api.updateApplicationStage(item.id, stage).subscribe({
      next: (updated) => {
        item.stage = updated.stage;
        item.status = updated.status;
        this.load();
      },
    });
  }

  label(value: string): string {
    return String(value || '').toLowerCase().replaceAll('_',' ').replace(/\b\w/g,(c) => c.toUpperCase());
  }
}

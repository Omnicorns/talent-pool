import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';
import { FMT } from '../../shared/labels';
import { IconComponent } from '../../shared/icon.component';
import { PaginationComponent } from '../../shared/pagination.component';
import { ColumnFilterComponent } from '../../shared/column-filter.component';
import { TableFilters } from '../../shared/table-filters';

@Component({
    selector: 'app-backoffice-applications',
    imports: [CommonModule, FormsModule, RouterLink, BackofficeLayoutComponent, IconComponent, PaginationComponent, ColumnFilterComponent],
    template: `
    <app-backoffice-layout active="applications">
      <div class="bo-head">
        <div>
          <h1>Pipeline</h1>
          <p>Pindahkan tahap kandidat langsung dari daftar. Kandidat di tahap Interview bisa langsung dijadwalkan.</p>
        </div>
      </div>
    
      <div class="chips" role="tablist" aria-label="Filter tahap">
        <button type="button" role="tab" class="btn btn-sm" [class.btn-primary]="stageFilter === ''" [class.btn-secondary]="stageFilter !== ''" [attr.aria-selected]="stageFilter === ''" (click)="setStage('')">Semua ({{ allCount }})</button>
        @for (stage of stageOptions; track stage) {
          <button type="button" role="tab" class="btn btn-sm" [class.btn-primary]="stageFilter === stage" [class.btn-secondary]="stageFilter !== stage" [attr.aria-selected]="stageFilter === stage" (click)="setStage(stage)">{{ fmt.label(stage) }} ({{ countFor(stage) }})</button>
        }
      </div>
    
      <section class="table-card responsive">
        <div class="table-meta"><span><strong>{{ total }}</strong> lamaran</span>@if (loading) {
        <span>Memuat…</span>
      }</div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr>
            @for (col of tf.cols; track col) {
              <th><app-column-filter [label]="col.label" [options]="tf.options(byStage, col.key)" [selected]="tf.filters[col.key] ?? null" [sort]="tf.sortFor(col.key)" (selectedChange)="tf.setFilter(col.key, $event); page = 0" (sortChange)="tf.setSort(col.key, $event)"></app-column-filter></th>
            }
            <th><span class="sr-only">Aksi</span></th>
          </tr></thead>
          <tbody>
            @for (item of visible; track item) {
              <tr>
                <td><strong>{{ item.candidateName }}</strong></td>
                <td>{{ item.jobTitle }}</td>
                <td>
                  <select class="select-inline" [ngModel]="viewStage(item)" (ngModelChange)="changeStage(item, $event)" [attr.aria-label]="'Tahap ' + item.candidateName">
                    @for (stage of stageOptions; track stage) {
                      <option [value]="stage">{{ fmt.label(stage) }}</option>
                    }
                  </select>
                </td>
                <td><span class="tag" [ngClass]="'tag-' + fmt.tone(item.status)">{{ fmt.label(item.status) }}</span></td>
                <td>{{ fmt.fullDate(item.appliedAt) }}</td>
                <td class="actions">
                  <button type="button" class="btn btn-ghost btn-sm" (click)="openHistory(item)" [attr.aria-label]="'Riwayat tahap ' + item.candidateName"><app-icon name="clock" [size]="15"></app-icon> Riwayat</button>
                  @if (item.stage === 'INTERVIEW') {
                    <a routerLink="/backoffice/interviews" [queryParams]="{ candidateId: item.candidateId, jobId: item.jobListingId }" class="btn btn-secondary btn-sm">
                      <app-icon name="calendar" [size]="15"></app-icon> Atur interview
                    </a>
                  }
                </td>
              </tr>
            }
            @if (!visible.length && !loading) {
              <tr><td colspan="6" class="empty-cell">{{ stageFilter ? 'Tidak ada lamaran di tahap ini.' : 'Belum ada lamaran masuk.' }}</td></tr>
            }
          </tbody>
        </table>
      </div>
    
      <div class="cards">
        @for (item of visible; track item) {
          <article>
            <div class="card-head">
              <div><strong>{{ item.candidateName }}</strong><small>{{ item.jobTitle }}</small></div>
              <span class="tag" [ngClass]="'tag-' + fmt.tone(item.status)">{{ fmt.label(item.status) }}</span>
            </div>
            <div class="card-meta"><div><span>Tanggal melamar</span>{{ fmt.fullDate(item.appliedAt) }}</div></div>
            <div class="card-actions">
              <button type="button" class="btn btn-ghost btn-sm" (click)="openHistory(item)"><app-icon name="clock" [size]="15"></app-icon> Riwayat</button>
              <select class="select-inline" [ngModel]="viewStage(item)" (ngModelChange)="changeStage(item, $event)" [attr.aria-label]="'Tahap ' + item.candidateName">
                @for (stage of stageOptions; track stage) {
                  <option [value]="stage">{{ fmt.label(stage) }}</option>
                }
              </select>
              @if (item.stage === 'INTERVIEW') {
                <a routerLink="/backoffice/interviews" [queryParams]="{ candidateId: item.candidateId, jobId: item.jobListingId }" class="btn btn-secondary btn-sm">Atur interview</a>
              }
            </div>
          </article>
        }
        @if (!visible.length && !loading) {
          <p class="muted" style="padding: 32px 18px; text-align: center">Tidak ada lamaran.</p>
        }
      </div>
    
      <app-pagination [page]="page" [size]="size" [total]="total" (pageChange)="goToPage($event)" (sizeChange)="changeSize($event)"></app-pagination>
    </section>
    @if (historyItem) {
      <div class="modal-backdrop" (click)="closeHistory()">
        <section class="modal" role="dialog" aria-modal="true" aria-labelledby="history-title" (click)="$event.stopPropagation()" style="max-width: 520px">
          <header class="drawer-head">
            <div><h2 id="history-title">Riwayat tahap</h2><p>{{ historyItem.candidateName }} · {{ historyItem.jobTitle }}</p></div>
            <button type="button" class="icon-btn" (click)="closeHistory()" aria-label="Tutup"><app-icon name="x"></app-icon></button>
          </header>
          <div class="modal-body">
            @if (historyLoading) {
              <p class="muted">Memuat riwayat…</p>
            }
            @if (historyError) {
              <div class="alert alert-error" role="alert"><app-icon name="alert"></app-icon><span>{{ historyError }}</span></div>
            }
            @if (!historyLoading && history.length) {
              <ol class="history-list">
                @for (entry of history; track entry; let last = $last) {
                  <li [class.current]="last">
                    <span class="history-dot" aria-hidden="true"></span>
                    <div>
                      <strong>{{ stageText(entry) }}</strong>
                      <span class="muted"> · {{ eventLabel(entry.eventType) }}</span>
                      <small class="muted" style="display: block">{{ fmt.fullDate(entry.changedAt) }} · {{ fmt.time(entry.changedAt) }}</small>
                      @if (entry.notes) {
                        <p style="margin: 4px 0 0; font-size: 14px">{{ entry.notes }}</p>
                      }
                    </div>
                  </li>
                }
              </ol>
            }
          </div>
          <footer class="modal-foot"><button class="btn btn-secondary" (click)="closeHistory()">Tutup</button></footer>
        </section>
      </div>
    }
    </app-backoffice-layout>
    `
})
export class BackofficeApplicationsComponent implements OnInit {
  readonly fmt = FMT;
  /** Semua lamaran (maks. 500 terbaru) dimuat sekali; filter kolom dan paginasi berjalan di klien. */
  all: any[] = [];
  loading = false;
  stageFilter = '';

  page = 0;
  size = 10;
  /** Tahap akhir "tidak lanjut" dipisah: Ditolak (REJECTED) dan Mengundurkan Diri (status WITHDRAWN). */
  stageOptions = ['NEW_CANDIDATE','SCREENING','INTERVIEW','OFFER','HIRED','REJECTED','WITHDRAWN'];

  viewStage(item: any): string {
    return item.status === 'WITHDRAWN' ? 'WITHDRAWN' : item.stage;
  }

  historyItem: any = null;
  history: any[] = [];
  historyLoading = false;
  historyError = '';

  openHistory(item: any): void {
    this.historyItem = item;
    this.history = [];
    this.historyError = '';
    this.historyLoading = true;
    this.api.applicationHistory(item.id).subscribe({
      next: (list) => { this.history = list || []; this.historyLoading = false; },
      error: () => { this.historyError = 'Riwayat belum bisa dimuat. Coba lagi.'; this.historyLoading = false; },
    });
  }

  closeHistory(): void {
    this.historyItem = null;
  }

  eventLabel(type: string): string {
    return ({ APPLIED: 'Melamar', STAGE_CHANGED: 'Pindah tahap', WITHDRAWN: 'Mengundurkan diri', CURRENT_STATUS: 'Kondisi saat ini' } as Record<string, string>)[type] || type;
  }

  /** Nama tahap pada riwayat; "tidak lanjut" dibedakan oleh statusnya. */
  stageText(entry: any): string {
    return FMT.label(entry.status === 'WITHDRAWN' ? 'WITHDRAWN' : entry.stage);
  }

  readonly tf = new TableFilters<any>([
    { key: 'kandidat', label: 'Kandidat', value: (r) => r.candidateName || '' },
    { key: 'lowongan', label: 'Lowongan', value: (r) => r.jobTitle || '' },
    { key: 'tahap', label: 'Tahap', value: (r) => FMT.label(r.status === 'WITHDRAWN' ? 'WITHDRAWN' : r.stage) },
    { key: 'status', label: 'Status', value: (r) => FMT.label(r.status) },
    { key: 'tanggal', label: 'Tanggal melamar', value: (r) => FMT.fullDate(r.appliedAt), sortValue: (r) => String(r.appliedAt) },
  ]);

  get byStage(): any[] {
    return this.stageFilter ? this.all.filter((r) => this.viewStage(r) === this.stageFilter) : this.all;
  }

  get filtered(): any[] {
    return this.tf.apply(this.byStage);
  }

  get total(): number {
    return this.filtered.length;
  }

  get visible(): any[] {
    const rows = this.filtered;
    const lastPage = Math.max(0, Math.ceil(rows.length / this.size) - 1);
    if (this.page > lastPage) this.page = lastPage;
    return rows.slice(this.page * this.size, (this.page + 1) * this.size);
  }

  get allCount(): number {
    return this.all.length;
  }

  countFor(stage: string): number {
    return this.all.filter((r) => this.viewStage(r) === stage).length;
  }

  constructor(private api: BackofficeApiService) {}

  ngOnInit(): void {
    this.load();
  }

  setStage(stage: string): void {
    this.stageFilter = stage;
    this.tf.clear();
    this.page = 0;
  }

  goToPage(page: number): void {
    this.page = page;
  }

  changeSize(size: number): void {
    this.size = size;
    this.page = 0;
  }

  load(): void {
    this.loading = true;
    this.api.applications(0, 500, '').subscribe({
      next: (result) => {
        this.all = result?.content || [];
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  changeStage(item: any, stage: string): void {
    const withdrawn = stage === 'WITHDRAWN';
    this.api.updateApplicationStage(item.id, withdrawn ? 'REJECTED' : stage, withdrawn ? 'WITHDRAWN' : null).subscribe({
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

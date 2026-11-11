import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CandidateProfileSectionsComponent } from '../../shared/candidate-profile-sections.component';
import { BackofficeOverlayDirective } from '../../shared/backoffice-overlay.directive';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';
import { FMT } from '../../shared/labels';
import { IconComponent } from '../../shared/icon.component';
import { PaginationComponent } from '../../shared/pagination.component';
import { ColumnFilterComponent, SortDir } from '../../shared/column-filter.component';

type ColKey = 'name' | 'fungsi' | 'pengalaman' | 'lokasi' | 'review';

@Component({
    selector: 'app-backoffice-candidates',
    imports: [CommonModule, FormsModule, BackofficeLayoutComponent, CandidateProfileSectionsComponent, BackofficeOverlayDirective, IconComponent, PaginationComponent, ColumnFilterComponent],
    template: `
    <app-backoffice-layout active="candidates">
      <div class="bo-head">
        <div>
          <h1>Kandidat</h1>
          <p>Semua profil di Talent Pool, termasuk yang belum melamar lowongan.</p>
        </div>
        <form class="bo-actions" (ngSubmit)="search()" role="search">
          <label class="bo-search">
            <span class="sr-only">Cari kandidat</span>
            <app-icon name="search" [size]="16"></app-icon>
            <input [(ngModel)]="q" name="q" placeholder="Cari nama, email, atau posisi">
          </label>
          <button class="btn btn-secondary" type="submit">Cari</button>
        </form>
      </div>
    
      <section class="table-card responsive">
        <div class="table-meta">
          <span><strong>{{ total }}</strong> kandidat@if (q.trim()) {
          untuk “{{ q.trim() }}”
        }</span>
        @if (hasFilters) {
          <button type="button" class="filter-reset" (click)="clearFilters()">Hapus semua filter</button>
        }
        @if (loading) {
          <span>Memuat…</span>
        }
      </div>
    
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              @for (col of columns; track col) {
                <th><app-column-filter [label]="col.label" [options]="options(col.key)" [selected]="filters[col.key]" [sort]="sort?.key === col.key ? sort!.dir : null" (selectedChange)="setFilter(col.key, $event)" (sortChange)="setSort(col.key, $event)"></app-column-filter></th>
              }
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            @for (item of rows; track item) {
              <tr>
                <td>
                  <div class="person">
                    <span class="avatar">
                      @if (pictureUrls[item.id]) {
                        <img [src]="pictureUrls[item.id]" alt="">
                      } @else {
                        {{ fmt.initials(item.fullName) }}
                      }
                    </span>
                    <div><strong>{{ item.fullName }}</strong><small>{{ item.email }}</small></div>
                  </div>
                </td>
                <td style="min-width: 100px">
                  {{ item.jobInterests?.length ? item.jobInterests.join(', ') : (item.relatedPosition || '-') }}
                </td>
                <td style="min-width: 160px">
                  @if (item.lastExperience; as exp) {
                    <strong>{{ exp.position }}</strong>
                    <small>{{ exp.company }}</small>
                    <small>{{ fmt.lastExperiencePeriod(exp) }}</small>
                  } @else {
                    <span class="muted">-</span>
                  }
                </td>
                <td style="min-width: 100px">{{ item.preferredLocations?.length ? item.preferredLocations.join(', ') : '-' }}</td>
                <td>
                  <select class="select-inline" [ngModel]="item.reviewed ? 'yes' : 'no'" (ngModelChange)="changeReview(item, $event === 'yes')" [attr.aria-label]="'Status review ' + item.fullName">
                    <option value="no">Belum review</option><option value="yes">Sudah direview</option>
                  </select>
                </td>
                <td class="actions sticky-actions">
                  <div class="row-actions">
                    <button class="btn btn-secondary btn-sm" (click)="openCandidate(item)">Lihat profil</button>
                  </div>
                </td>
              </tr>
            }
            @if (!rows.length && !loading) {
              <tr><td colspan="6" class="empty-cell">{{ q.trim() || hasFilters ? 'Tidak ada kandidat yang cocok dengan pencarian atau filter.' : 'Belum ada kandidat di Talent Pool.' }}</td></tr>
            }
          </tbody>
        </table>
      </div>
    
      <div class="cards">
        @for (item of rows; track item) {
          <article>
            <div class="card-head">
              <div class="person" style="min-width: 0">
                <span class="avatar">
                  @if (pictureUrls[item.id]) {
                    <img [src]="pictureUrls[item.id]" alt="">
                  } @else {
                    {{ fmt.initials(item.fullName) }}
                  }
                </span>
                <div><strong>{{ item.fullName }}</strong><small>{{ item.email }}</small></div>
              </div>
            </div>
            <div class="card-meta">
              <div><span>Fungsi diminati</span>{{ item.jobInterests?.length ? item.jobInterests.join(', ') : (item.relatedPosition || '-') }}</div>
              <div><span>Pengalaman terakhir</span>{{ item.lastExperience ? item.lastExperience.position + ' · ' + item.lastExperience.company : '-' }}</div>
              <div><span>Lokasi diminati</span>{{ item.preferredLocations?.length ? item.preferredLocations.join(', ') : '-' }}</div>
            </div>
            <div class="card-actions">
              <select class="select-inline" [ngModel]="item.reviewed ? 'yes' : 'no'" (ngModelChange)="changeReview(item, $event === 'yes')" [attr.aria-label]="'Status review ' + item.fullName">
                <option value="no">Belum review</option><option value="yes">Sudah direview</option>
              </select>
              <button class="btn btn-secondary btn-sm" (click)="openCandidate(item)">Lihat profil</button>
            </div>
          </article>
        }
        @if (!rows.length && !loading) {
          <p class="empty-cell muted" style="padding: 32px 18px; text-align: center">Belum ada kandidat.</p>
        }
      </div>
    
      <app-pagination [page]="page" [size]="size" [total]="total" (pageChange)="goToPage($event)" (sizeChange)="changeSize($event)"></app-pagination>
    </section>
    
    @if (drawerOpen) {
      <div class="drawer-backdrop bo-candidate-backdrop" (click)="closeOnBackdrop($event)">
        <aside class="drawer wide" [boOverlay]="true" (overlayClose)="closeDrawer()" role="dialog" aria-modal="true" aria-label="Profil kandidat">
          <header class="drawer-head">
            @if (selected) {
              <div class="candidate-sheet">
                <span class="avatar avatar-md">
                  @if (pictureUrls[selected.id]) {
                    <img [src]="pictureUrls[selected.id]" alt="">
                  } @else {
                    {{ fmt.initials(selected.fullName) }}
                  }
                </span>
                <div>
                  <h2>{{ selected.fullName }}</h2>
                  <p>{{ selected.relatedJobPositions?.join(', ') || selected.jobPosition || 'Kandidat Talent Pool' }}</p>
                  <span class="tag" [ngClass]="isReviewed(selected.id) ? 'tag-positive' : 'tag-neutral'">{{ isReviewed(selected.id) ? 'Sudah direview' : 'Belum review' }}</span>
                </div>
              </div>
            } @else {
              <h2>Profil kandidat</h2>
            }
            <button type="button" class="icon-btn" (click)="closeDrawer()" aria-label="Tutup"><app-icon name="x"></app-icon></button>
          </header>
          @if (selected) {
            <div class="drawer-body">
              <div class="button-row">
                <button class="btn btn-primary" (click)="downloadCv()" [disabled]="!selected.cvOriginalName"><app-icon name="download" [size]="16"></app-icon> {{ selected.cvOriginalName ? 'Unduh CV' : 'CV belum ada' }}</button>
                <button class="btn btn-secondary" (click)="api.viewCv(selected.id)" [disabled]="!selected.cvOriginalName"><app-icon name="eye" [size]="16"></app-icon> Lihat CV</button>
                <button class="btn btn-secondary" (click)="showInterviewForm = !showInterviewForm" [attr.aria-expanded]="showInterviewForm"><app-icon name="calendar" [size]="16"></app-icon> Jadwalkan interview</button>
                <a class="btn btn-ghost" [href]="'mailto:' + selected.email"><app-icon name="mail" [size]="16"></app-icon> Email</a>
              </div>
              @if (showInterviewForm) {
                <section class="drawer-section">
                  <h3>Jadwalkan interview</h3>
                  <div class="form-grid">
                    <label class="field">Tanggal dan jam<input type="datetime-local" [(ngModel)]="interviewForm.scheduledAt"></label>
                    <label class="field">Durasi (menit)<input type="number" min="15" max="480" [(ngModel)]="interviewForm.durationMinutes"></label>
                    <label class="field">Cara interview
                      <select [(ngModel)]="interviewForm.mode">
                        <option value="ONLINE">Online</option>
                        <option value="ONSITE">Tatap muka</option>
                        <option value="PHONE">Telepon</option>
                      </select>
                    </label>
                    <label class="field">Pewawancara<input [(ngModel)]="interviewForm.interviewer" placeholder="Nama dan jabatan"></label>
                    <label class="field span-2">{{ interviewForm.mode === 'ONLINE' ? 'Tautan meeting' : interviewForm.mode === 'PHONE' ? 'Nomor telepon' : 'Lokasi' }}<input [(ngModel)]="interviewForm.locationOrLink"></label>
                    <label class="field span-2">Untuk lowongan
                      <select [(ngModel)]="interviewForm.jobListingId">
                        <option [ngValue]="null">Talent Pool (tanpa lowongan)</option>
                        @for (job of jobs; track job) {
                          <option [ngValue]="job.id">{{ job.title }}</option>
                        }
                      </select>
                    </label>
                    <label class="field span-2">Catatan <span class="opt">(opsional)</span><textarea [(ngModel)]="interviewForm.notes" rows="3"></textarea></label>
                  </div>
                  @if (interviewError) {
                    <div class="alert alert-error" role="alert"><app-icon name="alert"></app-icon><span>{{ interviewError }}</span></div>
                  }
                  <div class="button-row">
                    <button class="btn btn-primary" (click)="scheduleInterview()" [disabled]="scheduling">{{ scheduling ? 'Menyimpan…' : 'Simpan jadwal' }}</button>
                    <button class="btn btn-ghost" (click)="showInterviewForm = false">Batal</button>
                  </div>
                </section>
              }
              @if (appliedJobs.length) {
                <section class="drawer-section" aria-label="Lowongan yang dilamar">
                  <h3>Lowongan yang dilamar</h3>
                  <ul class="applied-list">
                    @for (a of appliedJobs; track a) {
                      <li>
                        <div><strong>{{ a.jobTitle }}</strong><small>{{ a.addedByHr ? 'Ditambahkan HC' : 'Melamar' }} {{ fmt.fullDate(a.appliedAt) }}</small></div>
                        <span class="tag tag-neutral">{{ fmt.label(a.stage) }}</span>
                      </li>
                    }
                  </ul>
                </section>
              }
              <section class="drawer-section" id="move-section">
                <h3>Masukkan ke lowongan</h3>
                @if (selected.movedToJobListing) {
                  <p class="muted" style="font-size: 14px">Kandidat ini sudah pernah dimasukkan ke lowongan.</p>
                }
                @if (jobs.length) {
                  <div class="form-grid">
                    <label class="field">Lowongan
                      <select [(ngModel)]="moveForm.jobListingId">
                        <option value="">Pilih lowongan yang dibuka</option>
                        @for (job of jobs; track job) {
                          <option [value]="job.id">{{ job.title }}</option>
                        }
                      </select>
                    </label>
                  </div>
                } @else {
                  <p class="muted" style="font-size: 14px">Belum ada lowongan yang dibuka.</p>
                }
                @if (moveError) {
                  <div class="alert alert-error" role="alert"><app-icon name="alert"></app-icon><span>{{ moveError }}</span></div>
                }
                @if (moveSuccess) {
                  <div class="alert alert-success" role="status"><app-icon name="check"></app-icon><span>{{ moveSuccess }}</span></div>
                }
                @if (jobs.length) {
                  <div class="button-row">
                    <button type="button" class="btn btn-secondary" (click)="moveToJobListing()" [disabled]="moving">{{ moving ? 'Menyimpan…' : 'Masukkan ke lowongan' }}</button>
                  </div>
                }
              </section>
              <app-candidate-profile-sections [selected]="selected"></app-candidate-profile-sections>
            </div>
          } @else {
            <div class="full-loading">Memuat profil kandidat…</div>
          }
        </aside>
      </div>
    }
    </app-backoffice-layout>
    `
})
export class BackofficeCandidatesComponent implements OnInit, OnDestroy {
  readonly fmt = FMT;
  rows: any[] = [];
  jobs: any[] = [];
  pictureUrls: Record<string, string> = {};
  q = '';
  loading = false;
  drawerOpen = false;
  selected: any = null;
  showInterviewForm = false;
  scheduling = false;
  interviewError = '';
  moving = false;
  moveError = '';
  moveSuccess = '';
  moveForm = { jobListingId: '', hiringStage: 'NEW_CANDIDATE' };
  statuses = ['AVAILABLE','SCREENED','POTENTIAL','ARCHIVED','REJECTED','SPAM','BLOCKED','WITHDRAWN','HIRED'];

  interviewForm: any = {
    jobListingId: null,
    scheduledAt: '',
    durationMinutes: 60,
    mode: 'ONLINE',
    locationOrLink: '',
    interviewer: '',
    notes: '',
  };

  appliedJobs: any[] = [];

  constructor(public api: BackofficeApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.load();
    const candidateId = this.route.snapshot.queryParamMap.get('candidateId');
    if (candidateId) this.openCandidate({ id: candidateId });
    this.api.jobListings('', 0, 200).subscribe({ next: (result) => this.jobs = (result?.content || []).filter((job: any) => job.status === 'PUBLISHED') });
  }

  ngOnDestroy(): void {
    Object.values(this.pictureUrls).forEach((url) => URL.revokeObjectURL(url));
  }

  page = 0;
  size = 10;
  total = 0;
  all: any[] = [];

  readonly columns: { key: ColKey; label: string }[] = [
    { key: 'name', label: 'Nama kandidat' },
    { key: 'fungsi', label: 'Fungsi yang diminati' },
    { key: 'pengalaman', label: 'Pengalaman terakhir' },
    { key: 'lokasi', label: 'Lokasi kerja diminati' },
    { key: 'review', label: 'Status review' },
  ];
  filters: Record<ColKey, string[] | null> = { name: null, fungsi: null, pengalaman: null, lokasi: null, review: null };
  sort: { key: ColKey; dir: SortDir } | null = null;
  private optionCache: Partial<Record<ColKey, string[]>> = {};
  private static readonly EMPTY = '(Kosong)';

  get hasFilters(): boolean {
    return Object.values(this.filters).some((f) => f !== null);
  }

  private values(item: any, key: ColKey): string[] {
    const blank = BackofficeCandidatesComponent.EMPTY;
    let list: string[] = [];
    switch (key) {
      case 'name': list = [item.fullName]; break;
      case 'fungsi': list = item.jobInterests?.length ? item.jobInterests : [item.relatedPosition]; break;
      case 'pengalaman': list = [item.lastExperience?.position]; break;
      case 'lokasi': list = item.preferredLocations || []; break;
      case 'review': list = [item.reviewed ? 'Sudah direview' : 'Belum review']; break;
    }
    list = list.map((v) => (v || '').trim()).filter(Boolean);
    return list.length ? list : [blank];
  }

  options(key: ColKey): string[] {
    return this.optionCache[key] ||= this.computeOptions(key);
  }

  private computeOptions(key: ColKey): string[] {
    const set = new Set<string>();
    this.all.forEach((item) => this.values(item, key).forEach((v) => set.add(v)));
    const blank = BackofficeCandidatesComponent.EMPTY;
    const list = [...set].filter((v) => v !== blank).sort((a, b) => a.localeCompare(b, 'id'));
    return set.has(blank) ? [...list, blank] : list;
  }

  setFilter(key: ColKey, selected: string[] | null): void {
    this.filters = { ...this.filters, [key]: selected };
    this.page = 0;
    this.recompute();
  }

  setSort(key: ColKey, dir: SortDir): void {
    this.sort = dir ? { key, dir } : null;
    this.page = 0;
    this.recompute();
  }

  clearFilters(): void {
    this.filters = { name: null, fungsi: null, pengalaman: null, lokasi: null, review: null };
    this.page = 0;
    this.recompute();
  }

  private recompute(): void {
    const blank = BackofficeCandidatesComponent.EMPTY;
    let view = this.all.filter((item) =>
      this.columns.every(({ key }) => {
        const selected = this.filters[key];
        return selected === null || this.values(item, key).some((v) => selected.includes(v));
      }));
    if (this.sort) {
      const { key, dir } = this.sort;
      const sign = dir === 'asc' ? 1 : -1;
      const keyOf = (item: any) => [...this.values(item, key)].sort((a, b) => a.localeCompare(b, 'id'))[0];
      view = [...view].sort((a, b) => {
        const x = keyOf(a), y = keyOf(b);
        if (x === blank && y !== blank) return 1;
        if (y === blank && x !== blank) return -1;
        return sign * x.localeCompare(y, 'id');
      });
    }
    this.total = view.length;
    const lastPage = Math.max(0, Math.ceil(view.length / this.size) - 1);
    if (this.page > lastPage) this.page = lastPage;
    this.rows = view.slice(this.page * this.size, (this.page + 1) * this.size);
    this.rows.forEach((item) => { if (!this.pictureUrls[item.id]) this.loadPicture(item.id); });
  }

  search(): void {
    this.page = 0;
    this.load();
  }

  goToPage(page: number): void {
    this.page = page;
    this.recompute();
  }

  changeSize(size: number): void {
    this.size = size;
    this.page = 0;
    this.recompute();
  }

  load(): void {
    this.loading = true;
    // Filter, urutan, dan paginasi dilakukan di browser, jadi seluruh kandidat (maks. 2000) dimuat sekali.
    this.api.candidates(this.q, 0, 2000).subscribe({
      next: (result) => {
        this.all = result?.content || [];
        this.optionCache = {};
        this.filters = { name: null, fungsi: null, pengalaman: null, lokasi: null, review: null };
        this.recompute();
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  private loadPicture(id: string): void {
    this.api.candidatePicture(id).subscribe({
      next: (blob) => {
        if (!blob.size) return;
        const previous = this.pictureUrls[id];
        if (previous) URL.revokeObjectURL(previous);
        this.pictureUrls[id] = URL.createObjectURL(blob);
      },
    });
  }

  isReviewed(id: string): boolean {
    return !!this.all.find((row) => row.id === id)?.reviewed;
  }

  changeReview(item: any, reviewed: boolean): void {
    const previous = item.reviewed;
    item.reviewed = reviewed;
    delete this.optionCache.review;
    this.api.updateCandidateReview(item.id, reviewed).subscribe({ error: () => item.reviewed = previous });
  }

  openCandidate(item: any, focusMove = false): void {
    this.drawerOpen = true;
    this.selected = null;
    this.showInterviewForm = false;
    this.interviewError = '';
    this.moveError = '';
    this.moveSuccess = '';
    this.moveForm = { jobListingId: '', hiringStage: 'NEW_CANDIDATE' };
    this.appliedJobs = [];
    this.api.candidateApplications(item.id).subscribe({ next: (list) => this.appliedJobs = list || [] });
    this.api.candidateDetail(item.id).subscribe({
      next: (detail) => {
        this.selected = detail;
        if (focusMove) setTimeout(() => document.getElementById('move-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      },
      error: () => this.closeDrawer(),
    });
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.selected = null;
    this.showInterviewForm = false;
  }

  closeOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('bo-candidate-backdrop')) this.closeDrawer();
  }

  downloadCv(): void {
    if (!this.selected?.id) return;
    this.api.candidateCv(this.selected.id).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = this.selected.cvOriginalName || 'candidate-cv';
        anchor.click();
        URL.revokeObjectURL(url);
      },
    });
  }

  scheduleInterview(): void {
    if (!this.selected?.id || !this.interviewForm.scheduledAt || !this.interviewForm.interviewer.trim()) {
      this.interviewError = 'Isi tanggal, jam, dan nama pewawancara.';
      return;
    }

    this.scheduling = true;
    this.interviewError = '';
    this.api.createInterview({
      candidateId: this.selected.id,
      jobListingId: this.interviewForm.jobListingId || null,
      scheduledAt: new Date(this.interviewForm.scheduledAt).toISOString(),
      durationMinutes: Number(this.interviewForm.durationMinutes || 60),
      mode: this.interviewForm.mode,
      locationOrLink: this.interviewForm.locationOrLink || null,
      interviewer: this.interviewForm.interviewer.trim(),
      notes: this.interviewForm.notes || null,
    }).subscribe({
      next: () => {
        this.scheduling = false;
        this.showInterviewForm = false;
        this.interviewForm = { jobListingId: null, scheduledAt: '', durationMinutes: 60, mode: 'ONLINE', locationOrLink: '', interviewer: '', notes: '' };
      },
      error: (error) => {
        this.scheduling = false;
        this.interviewError = error?.error?.message || 'Jadwal interview belum tersimpan. Periksa isian lalu coba lagi.';
      },
    });
  }

  moveToJobListing(): void {
    if (!this.selected?.id || !this.moveForm.jobListingId) {
      this.moveError = 'Pilih lowongan terlebih dahulu.';
      return;
    }
    this.moving = true;
    this.moveError = '';
    this.moveSuccess = '';
    this.api.moveCandidateToJobListing(this.selected.id, this.moveForm.jobListingId, this.moveForm.hiringStage).subscribe({
      next: (updated) => {
        this.selected = updated;
        const row = this.all.find((item) => item.id === updated.id);
        if (row) row.movedToJobListing = updated.movedToJobListing;
        this.moving = false;
        this.moveSuccess = 'Kandidat dimasukkan ke lowongan.';
      },
      error: (error) => {
        this.moving = false;
        this.moveError = error?.error?.message || 'Kandidat belum berhasil dimasukkan ke lowongan. Coba lagi.';
      },
    });
  }

  changeStatus(item: any, status: string): void {
    this.api.updateCandidateStatus(item.id, status).subscribe({ next: (updated) => item.status = updated.status });
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

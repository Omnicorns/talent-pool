import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeOverlayDirective } from '../../shared/backoffice-overlay.directive';
import { IconComponent } from '../../shared/icon.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';
import { DEFAULT_LIFE_PROGRAMS } from '../public/site-defaults';

@Component({
  selector: 'app-backoffice-banners',
  standalone: true,
  imports: [CommonModule, FormsModule, BackofficeLayoutComponent, BackofficeOverlayDirective, IconComponent],
  template: `
    <app-backoffice-layout active="banners">
      <div class="bo-head">
        <div>
          <h1>Banner</h1>
          <p>Atur gambar yang tampil di landing page: foto utama (hero) dan foto Life at Sarinah.</p>
        </div>
        <div class="bo-actions">
          <button class="btn btn-secondary" type="button" (click)="load()"><app-icon name="history" [size]="16"></app-icon> Muat ulang</button>
          <button class="btn btn-primary" type="button" (click)="openForm()"><app-icon name="plus" [size]="16"></app-icon> Tambah gambar</button>
        </div>
      </div>

      <section class="table-card responsive">
        <div class="table-meta"><span><strong>{{ rows.length }}</strong> gambar</span><span *ngIf="loading">Memuat…</span></div>
        <div class="alert alert-error" *ngIf="error" role="alert" style="margin: 0 18px 12px"><app-icon name="alert"></app-icon><span>{{ error }}</span></div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>#</th><th>Gambar</th><th>Nama</th><th>Kategori</th><th>Urutan</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              <tr *ngFor="let b of rows; let i = index">
                <td>{{ i + 1 }}</td>
                <td><img class="banner-thumb" *ngIf="thumbs[b.id]" [src]="thumbs[b.id]" [alt]="b.name"></td>
                <td><strong>{{ b.name }}</strong></td>
                <td>{{ categoryLabel(b) }}</td>
                <td>{{ b.sequence }}</td>
                <td><span class="tag" [ngClass]="b.active ? 'tag-positive' : 'tag-neutral'">{{ b.active ? 'Aktif' : 'Nonaktif' }}</span></td>
                <td class="actions">
                  <div class="row-actions">
                    <button class="icon-btn" (click)="openPreview(b)" [attr.aria-label]="'Lihat ' + b.name" title="Lihat"><app-icon name="eye" [size]="16"></app-icon></button>
                    <button class="icon-btn" (click)="openForm(b)" [attr.aria-label]="'Ubah ' + b.name" title="Ubah"><app-icon name="edit" [size]="16"></app-icon></button>
                    <button class="icon-btn" (click)="deleteTarget = b; deleteError = ''" [attr.aria-label]="'Hapus ' + b.name" title="Hapus"><app-icon name="trash" [size]="16"></app-icon></button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!rows.length && !loading"><td colspan="7" class="empty-cell">Belum ada gambar. Landing page memakai foto bawaan sampai Mas menambahkan gambar di sini.</td></tr>
            </tbody>
          </table>
        </div>
        <div class="cards">
          <article *ngFor="let b of rows">
            <div class="card-head"><div class="person"><img class="banner-thumb" *ngIf="thumbs[b.id]" [src]="thumbs[b.id]" [alt]="b.name"><div><strong>{{ b.name }}</strong><small>{{ categoryLabel(b) }} · urutan {{ b.sequence }}</small></div></div>
              <span class="tag" [ngClass]="b.active ? 'tag-positive' : 'tag-neutral'">{{ b.active ? 'Aktif' : 'Nonaktif' }}</span></div>
            <div class="card-actions">
              <button class="btn btn-secondary btn-sm" (click)="openForm(b)">Ubah</button>
              <button class="btn btn-secondary btn-sm" (click)="deleteTarget = b; deleteError = ''">Hapus</button>
            </div>
          </article>
        </div>
      </section>

      <div class="drawer-backdrop" *ngIf="formOpen" (click)="closeOnBackdrop($event)">
        <aside class="drawer" [boOverlay]="true" (overlayClose)="formOpen = false" role="dialog" aria-modal="true" aria-labelledby="banner-form-title">
          <header class="drawer-head">
            <div><h2 id="banner-form-title">{{ editing ? 'Ubah gambar' : 'Tambah gambar' }}</h2><p>Gambar tampil di landing page bila statusnya aktif.</p></div>
            <button type="button" class="icon-btn" (click)="formOpen = false" aria-label="Tutup"><app-icon name="x"></app-icon></button>
          </header>
          <form class="drawer-body" (ngSubmit)="save()" #f="ngForm">
            <div class="form-grid">
              <label class="field span-2">Nama gambar<input [(ngModel)]="form.name" name="name" required maxlength="200" placeholder="Contoh: Foto hero Oktober"></label>
              <label class="field">Kategori
                <select [(ngModel)]="form.category" name="category">
                  <option value="HERO">Hero (foto utama)</option>
                  <option value="LIFE">Life at Sarinah</option>
                  <option value="LOGO_PARTNER">Logo header (kiri)</option>
                  <option value="LOGO_BRAND">Logo Sarinah (header kanan, footer, login)</option>
                  <option value="LOGIN_IMAGE">Gambar halaman login</option>
                </select>
              </label>
              <label class="field" *ngIf="form.category === 'LIFE'">Program (kartu)
                <select [(ngModel)]="form.groupKey" name="groupKey" required>
                  <option value="">Pilih program</option>
                  <option *ngFor="let p of programs" [value]="p.key">{{ p.title }}</option>
                </select>
              </label>
              <label class="field">Urutan<input type="number" min="1" max="999" [(ngModel)]="form.sequence" name="sequence" required></label>
              <label class="field span-2">Teks alternatif <span class="opt">(untuk pembaca layar, opsional)</span><input [(ngModel)]="form.altText" name="altText" maxlength="300"></label>
              <label class="check span-2"><input type="checkbox" [(ngModel)]="form.active" name="active"><span>Aktif (tampil di landing page)</span></label>
              <div class="field span-2">
                <span>Gambar <span class="opt" *ngIf="editing">(kosongkan untuk tetap memakai gambar saat ini)</span></span>
                <input type="file" accept="image/jpeg,image/png,image/webp" (change)="pick($event)" aria-label="Pilih gambar">
                <small class="muted">JPG, PNG, atau WebP, maksimal 5 MB. Foto Life at Sarinah paling pas rasio 3:2 (mis. 1200 × 800 px); hero rasio sekitar 4:3. Logo paling pas PNG transparan; bila ada beberapa logo aktif di kategori yang sama, yang urutannya terkecil dipakai.</small>
                <img class="banner-preview" *ngIf="previewUrl" [src]="previewUrl" alt="Pratinjau gambar">
              </div>
            </div>
            <div class="alert alert-error" *ngIf="formError" role="alert"><app-icon name="alert"></app-icon><span>{{ formError }}</span></div>
          </form>
          <footer class="drawer-foot">
            <button class="btn btn-secondary" type="button" (click)="formOpen = false">Batal</button>
            <button class="btn btn-primary" type="button" (click)="save()" [disabled]="saving">{{ saving ? 'Menyimpan…' : 'Simpan' }}</button>
          </footer>
        </aside>
      </div>

      <div class="drawer-backdrop" *ngIf="viewing" (click)="viewing = null">
        <aside class="drawer wide" [boOverlay]="true" (overlayClose)="viewing = null" role="dialog" aria-modal="true" aria-label="Pratinjau gambar" (click)="$event.stopPropagation()">
          <header class="drawer-head"><div><h2>{{ viewing.name }}</h2><p>{{ categoryLabel(viewing) }}</p></div>
            <button type="button" class="icon-btn" (click)="viewing = null" aria-label="Tutup"><app-icon name="x"></app-icon></button></header>
          <div class="drawer-body"><img class="banner-preview" *ngIf="thumbs[viewing.id]" [src]="thumbs[viewing.id]" [alt]="viewing.name"></div>
        </aside>
      </div>

      <div class="modal-backdrop" *ngIf="deleteTarget" (click)="deleteTarget = null">
        <section class="modal" role="alertdialog" aria-modal="true" aria-labelledby="del-banner" (click)="$event.stopPropagation()" style="max-width: 440px">
          <header class="drawer-head"><div><h2 id="del-banner">Hapus gambar?</h2><p>{{ deleteTarget.name }}</p></div></header>
          <div class="modal-body">
            <p>Gambar yang dihapus tidak bisa dikembalikan. Bila ingin menyembunyikan saja, ubah statusnya menjadi nonaktif.</p>
            <div class="alert alert-error" *ngIf="deleteError" role="alert"><app-icon name="alert"></app-icon><span>{{ deleteError }}</span></div>
          </div>
          <footer class="modal-foot">
            <button class="btn btn-secondary" (click)="deleteTarget = null" [disabled]="deleting">Batal</button>
            <button class="btn btn-danger" (click)="confirmDelete()" [disabled]="deleting">{{ deleting ? 'Menghapus…' : 'Hapus gambar' }}</button>
          </footer>
        </section>
      </div>
    </app-backoffice-layout>
  `,
})
export class BackofficeBannersComponent implements OnInit, OnDestroy {
  rows: any[] = [];
  thumbs: Record<string, string> = {};
  programs: Array<{ key: string; title: string }> = DEFAULT_LIFE_PROGRAMS;
  loading = false;
  error = '';

  formOpen = false;
  editing: any = null;
  form = this.blankForm();
  file: File | null = null;
  previewUrl = '';
  formError = '';
  saving = false;
  viewing: any = null;
  deleteTarget: any = null;
  deleteError = '';
  deleting = false;

  constructor(private api: BackofficeApiService) {}

  ngOnInit(): void {
    this.load();
    this.api.siteContent('LIFE_PROGRAMS').subscribe({
      next: (c) => { if (Array.isArray(c?.value) && c.value.length) this.programs = c.value; },
    });
  }

  ngOnDestroy(): void {
    Object.values(this.thumbs).forEach((url) => URL.revokeObjectURL(url));
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
  }

  private blankForm() {
    return { name: '', category: 'LIFE', groupKey: '', altText: '', sequence: 1, active: true };
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.api.siteBanners().subscribe({
      next: (rows) => {
        this.rows = rows || [];
        this.loading = false;
        this.rows.forEach((b) => this.loadThumb(b));
      },
      error: () => { this.loading = false; this.error = 'Daftar gambar belum bisa dimuat. Coba lagi.'; },
    });
  }

  private loadThumb(b: any): void {
    this.api.siteBannerImage(b.id).subscribe({
      next: (blob) => {
        const old = this.thumbs[b.id];
        if (old) URL.revokeObjectURL(old);
        this.thumbs = { ...this.thumbs, [b.id]: URL.createObjectURL(blob) };
      },
    });
  }

  categoryLabel(b: any): string {
    if (b.category === 'HERO') return 'Hero (foto utama)';
    if (b.category === 'LOGO_PARTNER') return 'Logo header (kiri)';
    if (b.category === 'LOGO_BRAND') return 'Logo Sarinah';
    if (b.category === 'LOGIN_IMAGE') return 'Gambar halaman login';
    const program = this.programs.find((p) => p.key === b.groupKey);
    return 'Life at Sarinah · ' + (program?.title || b.groupKey);
  }

  openForm(b?: any): void {
    this.editing = b || null;
    this.form = b ? { name: b.name, category: b.category, groupKey: b.groupKey || '', altText: b.altText || '', sequence: b.sequence, active: b.active } : this.blankForm();
    this.file = null;
    this.setPreview(null);
    this.formError = '';
    this.formOpen = true;
  }

  closeOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('drawer-backdrop')) this.formOpen = false;
  }

  openPreview(b: any): void {
    this.viewing = b;
  }

  pick(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] || null;
    this.formError = '';
    if (file && file.size > 5 * 1024 * 1024) {
      this.formError = 'Ukuran gambar maksimal 5 MB.';
      (event.target as HTMLInputElement).value = '';
      this.file = null;
      this.setPreview(null);
      return;
    }
    this.file = file;
    this.setPreview(file);
  }

  private setPreview(file: File | null): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = file ? URL.createObjectURL(file) : '';
  }

  save(): void {
    this.formError = '';
    if (!this.form.name.trim()) { this.formError = 'Nama wajib diisi.'; return; }
    if (this.form.category === 'LIFE' && !this.form.groupKey) { this.formError = 'Pilih program Life at Sarinah.'; return; }
    if (!this.editing && !this.file) { this.formError = 'Pilih gambar yang akan diunggah.'; return; }
    const data = new FormData();
    data.append('name', this.form.name.trim());
    data.append('category', this.form.category);
    if (this.form.category === 'LIFE') data.append('groupKey', this.form.groupKey);
    data.append('altText', this.form.altText || '');
    data.append('sequence', String(this.form.sequence || 1));
    data.append('active', String(this.form.active));
    if (this.file) data.append('image', this.file);
    this.saving = true;
    this.api.saveSiteBanner(this.editing?.id || null, data).subscribe({
      next: () => { this.saving = false; this.formOpen = false; this.load(); },
      error: (err) => { this.saving = false; this.formError = err?.error?.message || 'Gambar belum tersimpan. Coba lagi.'; },
    });
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.deleting = true;
    this.api.deleteSiteBanner(this.deleteTarget.id).subscribe({
      next: () => { this.deleting = false; this.deleteTarget = null; this.load(); },
      error: (err) => { this.deleting = false; this.deleteError = err?.error?.message || 'Gambar belum bisa dihapus.'; },
    });
  }
}

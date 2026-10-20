import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackofficeLayoutComponent } from '../../shared/backoffice-layout.component';
import { BackofficeOverlayDirective } from '../../shared/backoffice-overlay.directive';
import { IconComponent } from '../../shared/icon.component';
import { BackofficeApiService } from '../../core/service/api/backoffice-api.service';
import { DEFAULT_CONTENT } from '../public/site-defaults';

interface Field { name: string; label: string; type: 'text' | 'textarea' | 'icon'; max: number; }
interface Schema { kind: 'object' | 'list'; fields: Field[]; itemLabel?: string; min?: number; max?: number; hint?: string; }

const ICON_CHOICES = [
  { value: 'users', label: 'Tim' }, { value: 'sprout', label: 'Tumbuh' }, { value: 'building', label: 'Gedung' },
  { value: 'shield', label: 'Perisai' }, { value: 'heart', label: 'Hati' }, { value: 'award', label: 'Penghargaan' },
  { value: 'globe', label: 'Dunia' }, { value: 'grad', label: 'Pendidikan' },
];

const SCHEMAS: Record<string, Schema> = {
  HERO: { kind: 'object', fields: [
    { name: 'title', label: 'Judul utama', type: 'text', max: 150 },
    { name: 'subtitle', label: 'Kalimat pendukung', type: 'textarea', max: 300 },
    { name: 'primaryCta', label: 'Teks tombol utama', type: 'text', max: 40 },
    { name: 'secondaryCta', label: 'Teks tombol kedua', type: 'text', max: 40 },
  ], hint: 'Foto hero diatur di menu Banner.' },
  VALUES: { kind: 'list', itemLabel: 'Poin', min: 1, max: 6, fields: [
    { name: 'icon', label: 'Ikon', type: 'icon', max: 20 },
    { name: 'title', label: 'Judul', type: 'text', max: 80 },
    { name: 'text', label: 'Keterangan', type: 'textarea', max: 250 },
  ] },
  LIFE_HEADING: { kind: 'object', fields: [
    { name: 'eyebrow', label: 'Label kecil', type: 'text', max: 60 },
    { name: 'title', label: 'Judul', type: 'text', max: 100 },
    { name: 'tagline', label: 'Tagline', type: 'text', max: 200 },
    { name: 'lead', label: 'Kalimat pembuka', type: 'textarea', max: 300 },
  ] },
  LIFE_PROGRAMS: { kind: 'list', itemLabel: 'Program', min: 1, max: 8, fields: [
    { name: 'title', label: 'Nama program', type: 'text', max: 80 },
    { name: 'description', label: 'Deskripsi', type: 'textarea', max: 250 },
  ], hint: 'Foto tiap program diatur di menu Banner. Menghapus program menyembunyikan foto-fotonya dari landing page.' },
  FAQ: { kind: 'list', itemLabel: 'Pertanyaan', min: 1, max: 20, fields: [
    { name: 'q', label: 'Pertanyaan', type: 'text', max: 200 },
    { name: 'a', label: 'Jawaban', type: 'textarea', max: 800 },
  ] },
};

@Component({
  selector: 'app-backoffice-site-content',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, BackofficeLayoutComponent, BackofficeOverlayDirective, IconComponent],
  template: `
    <app-backoffice-layout active="site">
      <div class="bo-head">
        <div>
          <h1>Konten</h1>
          <p>Atur teks di landing page. Bagian yang belum diubah memakai teks bawaan.</p>
        </div>
        <div class="bo-actions">
          <button class="btn btn-secondary" type="button" (click)="load()"><app-icon name="history" [size]="16"></app-icon> Muat ulang</button>
        </div>
      </div>

      <section class="table-card responsive">
        <div class="alert alert-error" *ngIf="error" role="alert" style="margin: 12px 18px"><app-icon name="alert"></app-icon><span>{{ error }}</span></div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>#</th><th>Nama</th><th>Kunci</th><th>Kategori</th><th>Terakhir diubah</th><th>Aksi</th></tr></thead>
            <tbody>
              <tr *ngFor="let c of rows; let i = index">
                <td>{{ i + 1 }}</td>
                <td><strong>{{ c.name }}</strong></td>
                <td>{{ c.key }}</td>
                <td><span class="tag tag-info">{{ c.category }}</span></td>
                <td>{{ c.updatedAt ? (c.updatedAt | date: 'dd MMM yyyy HH:mm') : 'Bawaan (belum diubah)' }}</td>
                <td class="actions"><div class="row-actions"><button class="icon-btn" (click)="open(c)" [attr.aria-label]="'Ubah ' + c.name" title="Ubah"><app-icon name="edit" [size]="16"></app-icon></button></div></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="cards">
          <article *ngFor="let c of rows">
            <div class="card-head"><div><strong>{{ c.name }}</strong><small>{{ c.category }} · {{ c.updatedAt ? (c.updatedAt | date: 'dd MMM yyyy HH:mm') : 'Bawaan' }}</small></div></div>
            <div class="card-actions"><button class="btn btn-secondary btn-sm" (click)="open(c)">Ubah</button></div>
          </article>
        </div>
      </section>

      <div class="drawer-backdrop" *ngIf="current" (click)="closeOnBackdrop($event)">
        <aside class="drawer wide" [boOverlay]="true" (overlayClose)="current = null" role="dialog" aria-modal="true" aria-labelledby="content-title">
          <header class="drawer-head">
            <div><h2 id="content-title">{{ current.name }}</h2><p>{{ schema.hint || 'Perubahan tampil di landing page setelah disimpan.' }}</p></div>
            <button type="button" class="icon-btn" (click)="current = null" aria-label="Tutup"><app-icon name="x"></app-icon></button>
          </header>
          <div class="drawer-body">
            <p class="muted" *ngIf="loadingDetail">Memuat…</p>
            <div class="content-editor" *ngIf="!loadingDetail">
              <ng-container *ngIf="schema.kind === 'object'">
                <ng-container *ngTemplateOutlet="fields; context: { $implicit: objectValue, prefix: 'o' }"></ng-container>
              </ng-container>
              <ng-container *ngIf="schema.kind === 'list'">
                <article class="content-item" *ngFor="let item of listValue; let i = index">
                  <div class="content-item-head">
                    <strong>{{ schema.itemLabel }} {{ i + 1 }}</strong>
                    <div class="content-item-actions">
                      <button type="button" class="icon-btn" (click)="move(i, -1)" [disabled]="i === 0" aria-label="Naikkan"><app-icon name="chevron-up" [size]="16"></app-icon></button>
                      <button type="button" class="icon-btn" (click)="move(i, 1)" [disabled]="i === listValue.length - 1" aria-label="Turunkan"><app-icon name="chevron-down" [size]="16"></app-icon></button>
                      <button type="button" class="icon-btn" (click)="removeItem(i)" [disabled]="listValue.length <= (schema.min || 1)" aria-label="Hapus"><app-icon name="trash" [size]="16"></app-icon></button>
                    </div>
                  </div>
                  <ng-container *ngTemplateOutlet="fields; context: { $implicit: item, prefix: 'i' + i }"></ng-container>
                </article>
                <button type="button" class="btn btn-secondary" (click)="addItem()" *ngIf="listValue.length < (schema.max || 20)"><app-icon name="plus" [size]="16"></app-icon> Tambah {{ schema.itemLabel?.toLowerCase() }}</button>
              </ng-container>
              <div class="alert alert-error" *ngIf="saveError" role="alert"><app-icon name="alert"></app-icon><span>{{ saveError }}</span></div>
              <div class="alert alert-success" *ngIf="saved" role="status"><app-icon name="check"></app-icon><span>Tersimpan. Landing page sudah memakai teks ini.</span></div>
            </div>
          </div>
          <footer class="drawer-foot">
            <button class="btn btn-ghost" type="button" (click)="resetDefault()" [disabled]="loadingDetail">Kembalikan ke bawaan</button>
            <button class="btn btn-secondary" type="button" (click)="current = null">Tutup</button>
            <button class="btn btn-primary" type="button" (click)="save()" [disabled]="saving || loadingDetail">{{ saving ? 'Menyimpan…' : 'Simpan' }}</button>
          </footer>
        </aside>
      </div>

      <ng-template #fields let-item let-prefix="prefix">
        <div class="form-grid">
          <label class="field span-2" *ngFor="let f of schema.fields">{{ f.label }}
            <textarea *ngIf="f.type === 'textarea'" rows="3" [maxlength]="f.max" [(ngModel)]="item[f.name]" [name]="prefix + f.name"></textarea>
            <select *ngIf="f.type === 'icon'" [(ngModel)]="item[f.name]" [name]="prefix + f.name">
              <option *ngFor="let ic of icons" [value]="ic.value">{{ ic.label }}</option>
            </select>
            <input *ngIf="f.type === 'text'" [maxlength]="f.max" [(ngModel)]="item[f.name]" [name]="prefix + f.name">
          </label>
        </div>
      </ng-template>
    </app-backoffice-layout>
  `,
})
export class BackofficeSiteContentComponent implements OnInit {
  rows: any[] = [];
  error = '';
  current: any = null;
  loadingDetail = false;
  saving = false;
  saved = false;
  saveError = '';
  objectValue: any = {};
  listValue: any[] = [];
  readonly icons = ICON_CHOICES;

  constructor(private api: BackofficeApiService) {}

  get schema(): Schema {
    return SCHEMAS[this.current?.key] || { kind: 'object', fields: [] };
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.error = '';
    this.api.siteContents().subscribe({
      next: (rows) => this.rows = rows || [],
      error: () => this.error = 'Daftar konten belum bisa dimuat. Coba lagi.',
    });
  }

  open(row: any): void {
    this.current = row;
    this.saved = false;
    this.saveError = '';
    this.loadingDetail = true;
    this.api.siteContent(row.key).subscribe({
      next: (detail) => { this.setValue(detail?.value ?? DEFAULT_CONTENT[row.key]); this.loadingDetail = false; },
      error: () => { this.setValue(DEFAULT_CONTENT[row.key]); this.loadingDetail = false; this.saveError = 'Isi tersimpan belum bisa dimuat; ditampilkan isi bawaan.'; },
    });
  }

  private setValue(value: any): void {
    const copy = JSON.parse(JSON.stringify(value ?? (this.schema.kind === 'list' ? [] : {})));
    if (this.schema.kind === 'list') this.listValue = Array.isArray(copy) ? copy : [];
    else this.objectValue = copy;
  }

  resetDefault(): void {
    this.setValue(DEFAULT_CONTENT[this.current.key]);
    this.saved = false;
  }

  closeOnBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('drawer-backdrop')) this.current = null;
  }

  move(i: number, delta: number): void {
    const j = i + delta;
    if (j < 0 || j >= this.listValue.length) return;
    [this.listValue[i], this.listValue[j]] = [this.listValue[j], this.listValue[i]];
  }

  removeItem(i: number): void {
    this.listValue.splice(i, 1);
  }

  addItem(): void {
    const item: any = {};
    this.schema.fields.forEach((f) => item[f.name] = f.type === 'icon' ? ICON_CHOICES[0].value : '');
    if (this.current.key === 'LIFE_PROGRAMS') item.key = 'program-' + Math.random().toString(36).slice(2, 8);
    this.listValue.push(item);
  }

  save(): void {
    this.saveError = '';
    this.saved = false;
    const value = this.schema.kind === 'list' ? this.listValue : this.objectValue;
    const items = this.schema.kind === 'list' ? this.listValue : [this.objectValue];
    const textFields = this.schema.fields.filter((f) => f.type !== 'icon');
    if (items.some((item) => textFields.some((f) => !String(item[f.name] ?? '').trim()))) {
      this.saveError = 'Semua kolom wajib diisi.';
      return;
    }
    this.saving = true;
    this.api.saveSiteContent(this.current.key, value).subscribe({
      next: (detail) => {
        this.saving = false;
        this.saved = true;
        const row = this.rows.find((r) => r.key === this.current.key);
        if (row) row.updatedAt = detail?.updatedAt;
      },
      error: (err) => { this.saving = false; this.saveError = err?.error?.message || 'Konten belum tersimpan. Coba lagi.'; },
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrganizationItem, TalentProfileDetails } from '../core/models/talent.models';
import { IconComponent } from './icon.component';
import { TALENT_OPTIONS } from './talent-options';
import { WordLimitDirective, wordCount } from './word-limit.directive';

/** Pemeriksaan Pengalaman Organisasi (opsional): bila ada item, peran, nama, dan tanggal wajib valid. Mengembalikan pesan galat atau ''. */
export function organizationsError(details: TalentProfileDetails | null | undefined, today: string): string {
  for (const o of details?.organizations || []) {
    if (!o.role || !o.name?.trim()) return 'Peran dan nama organisasi wajib diisi, atau hapus organisasi yang kosong.';
    if (!o.startDate || o.startDate > today) return 'Tanggal mulai organisasi wajib diisi dan tidak boleh di masa depan.';
    if (!o.currentlyActive && (!o.endDate || o.endDate < o.startDate || o.endDate > today)) return 'Tanggal selesai organisasi wajib diisi dan tidak boleh sebelum tanggal mulai.';
    if (wordCount(o.description) > 120) return 'Deskripsi dan pencapaian organisasi maksimal 120 kata.';
  }
  return '';
}

/** Pengalaman organisasi: peran, nama, tingkat, jenis, periode, dan deskripsi pencapaian. */
@Component({
  selector: 'app-organizations-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, WordLimitDirective],
  template: `
    <div class="ach-empty" *ngIf="!items.length">
      <app-icon name="users" [size]="26"></app-icon>
      <strong>Belum ada pengalaman organisasi</strong>
      <span>Tambahkan organisasi yang pernah atau sedang Anda ikuti. Bagian ini opsional.</span>
      <button type="button" class="btn btn-secondary btn-sm" (click)="add()"><app-icon name="plus" [size]="16"></app-icon> Tambah organisasi</button>
    </div>
    <article class="repeat" *ngFor="let o of items; let i = index">
      <div class="repeat-head">
        <strong>Organisasi {{ i + 1 }}</strong>
        <button type="button" class="btn btn-ghost btn-sm" (click)="remove(i)"><app-icon name="trash" [size]="16"></app-icon> Hapus</button>
      </div>
      <div class="form-grid">
        <label class="field">Peran *
          <select [(ngModel)]="o.role" [name]="'or' + i"><option value="">Pilih peran</option><option *ngFor="let r of options.orgRoles" [value]="r">{{ r }}</option></select>
        </label>
        <label class="field">Nama organisasi *<input [(ngModel)]="o.name" maxlength="200" [name]="'on' + i" placeholder="Contoh: BEM Fakultas Ekonomi"></label>
        <label class="field">Tingkat organisasi
          <select [(ngModel)]="o.level" [name]="'ol' + i"><option value="">Pilih tingkat organisasi</option><option *ngFor="let l of options.orgLevels" [value]="l">{{ l }}</option></select>
        </label>
        <label class="field">Jenis organisasi
          <select [(ngModel)]="o.type" [name]="'ot' + i"><option value="">Pilih jenis organisasi</option><option *ngFor="let t of options.orgTypes" [value]="t">{{ t }}</option></select>
        </label>
        <label class="check span-2"><input type="checkbox" [(ngModel)]="o.currentlyActive" (ngModelChange)="o.currentlyActive && (o.endDate = '')" [name]="'oa' + i"> Masih aktif</label>
        <label class="field">Tanggal mulai *<input type="date" [(ngModel)]="o.startDate" [max]="today" [name]="'os' + i"></label>
        <label class="field">Tanggal selesai<span *ngIf="!o.currentlyActive"> *</span><input type="date" [(ngModel)]="o.endDate" [min]="o.startDate || null" [max]="today" [disabled]="o.currentlyActive" [name]="'oe' + i"></label>
        <label class="field span-2">Deskripsi dan pencapaian<textarea [(ngModel)]="o.description" [wordLimit]="120" rows="4" [name]="'od' + i" placeholder="Tanggung jawab dan pencapaian Anda di organisasi ini"></textarea></label>
      </div>
    </article>
    <button type="button" class="btn btn-secondary add-row" *ngIf="items.length && items.length < 20" (click)="add()"><app-icon name="plus" [size]="16"></app-icon> Tambah organisasi</button>
  `,
})
export class OrganizationsEditorComponent {
  @Input({ required: true }) details!: TalentProfileDetails;
  @Input() today = new Date().toLocaleDateString('en-CA');
  readonly options = TALENT_OPTIONS;

  get items(): OrganizationItem[] { return this.details.organizations ||= []; }

  add(): void { this.items.push({ key: crypto.randomUUID(), role: '', name: '', level: '', type: '', currentlyActive: false, startDate: '', endDate: '', description: '' }); }
  remove(i: number): void { this.items.splice(i, 1); }
}

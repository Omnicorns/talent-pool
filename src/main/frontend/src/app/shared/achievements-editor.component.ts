
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AwardItem, ProjectItem, TalentProfileDetails } from '../core/models/talent.models';
import { IconComponent } from './icon.component';
import { TALENT_OPTIONS } from './talent-options';
import { WordLimitDirective, wordCount } from './word-limit.directive';

const MAX_ITEMS = 20;

/** Pemeriksaan My Achievements (opsional): bila ada item, nama dan kategori wajib terisi. Mengembalikan pesan galat atau ''. */
export function achievementsError(details: TalentProfileDetails | null | undefined, today: string): string {
  for (const p of details?.projects || []) {
    if (!p.name?.trim() || !p.category) return 'Nama dan kategori proyek wajib diisi, atau hapus proyek yang kosong.';
    if (p.startDate && p.endDate && p.endDate < p.startDate) return 'Tanggal selesai proyek tidak boleh sebelum tanggal mulai.';
    if (wordCount(p.description) > 80) return 'Deskripsi proyek maksimal 80 kata.';
  }
  for (const a of details?.awards || []) {
    if (!a.name?.trim() || !a.category || !a.level) return 'Nama, kategori, dan tingkat penghargaan wajib diisi, atau hapus penghargaan yang kosong.';
    if (a.achievementDate && a.achievementDate > today) return 'Tanggal penghargaan tidak boleh di masa depan.';
    if (wordCount(a.description) > 80) return 'Deskripsi penghargaan maksimal 80 kata.';
  }
  return '';
}

export const projectDocKey = (p: { key?: string | null }) => `project:${p.key}:attachment`;
export const awardDocKey = (a: { key?: string | null }) => `award:${a.key}:proof`;

/** "My Achievements": tab Projects dan Awards, tiap item berisi kategori pilihan dan lampiran (PDF). */
@Component({
    selector: 'app-achievements-editor',
    imports: [FormsModule, IconComponent, WordLimitDirective],
    template: `
    <section class="ach" aria-labelledby="ach-title">
      <header class="ach-head">
        <h3 id="ach-title">My Achievements <span class="opt">(opsional)</span></h3>
        <p>Tampilkan proyek, penghargaan, dan pencapaian Anda.</p>
      </header>
      <div class="ach-tabs" role="tablist" aria-label="My Achievements">
        <button type="button" role="tab" id="ach-tab-projects" [attr.aria-selected]="tab === 'projects'" [class.on]="tab === 'projects'" (click)="tab = 'projects'">Projects <span class="ach-count">{{ projects.length }}</span></button>
        <button type="button" role="tab" id="ach-tab-awards" [attr.aria-selected]="tab === 'awards'" [class.on]="tab === 'awards'" (click)="tab = 'awards'">Awards <span class="ach-count">{{ awards.length }}</span></button>
      </div>
    
      @if (tab === 'projects') {
        <div role="tabpanel" aria-labelledby="ach-tab-projects">
          <p class="ach-sub"><strong>My Projects</strong><span class="ach-pill">{{ projects.length }} Projects</span></p>
          @if (!projects.length) {
            <div class="ach-empty">
              <app-icon name="folder" [size]="26"></app-icon>
              <strong>Belum ada proyek</strong>
              <span>Tambahkan proyek yang pernah Anda selesaikan selama studi.</span>
              <button type="button" class="btn btn-secondary btn-sm" (click)="addProject()"><app-icon name="plus" [size]="16"></app-icon> Tambah proyek</button>
            </div>
          }
          @for (p of projects; track p; let i = $index) {
            <article class="repeat">
              <div class="repeat-head">
                <strong>Proyek {{ i + 1 }}</strong>
                <button type="button" class="btn btn-ghost btn-sm" (click)="removeProject(i)"><app-icon name="trash" [size]="16"></app-icon> Hapus</button>
              </div>
              <div class="form-grid">
                <label class="field span-2">Nama proyek *<input [(ngModel)]="p.name" maxlength="200" [name]="'pn' + i" placeholder="Contoh: Sistem Inventori Koperasi Kampus"></label>
                <label class="field">Kategori proyek *
                  <select [(ngModel)]="p.category" [name]="'pc' + i"><option value="">Pilih kategori</option>@for (c of options.projectCategories; track c) {
                  <option [value]="c">{{ c }}</option>
                }</select>
              </label>
              <label class="field">Peran / posisi<input [(ngModel)]="p.role" maxlength="200" [name]="'pr' + i" placeholder="Contoh: Ketua tim"></label>
              <label class="field span-2">Organisasi / institusi<input [(ngModel)]="p.organization" maxlength="200" [name]="'po' + i" placeholder="Contoh: Universitas Indonesia"></label>
              <label class="field">Tanggal mulai<input type="date" [(ngModel)]="p.startDate" [max]="today" [name]="'ps' + i"></label>
              <label class="field">Tanggal selesai<input type="date" [(ngModel)]="p.endDate" [min]="p.startDate || null" [name]="'pe' + i"></label>
              <label class="field span-2">Deskripsi proyek<textarea [(ngModel)]="p.description" [wordLimit]="80" rows="3" [name]="'pd' + i" placeholder="Apa yang Anda kerjakan dan hasilnya"></textarea></label>
              <label class="file-field span-2">Lampiran <span class="opt">(opsional)</span> <input type="file" accept=".pdf,application/pdf" [attr.aria-label]="'Lampiran proyek ' + (i + 1)" (change)="attach.emit({ event: $event, key: projectKey(p) })"><small class="field-hint">{{ docName(projectKey(p)) || 'PDF, maksimal 2 MB' }}</small></label>
            </div>
          </article>
        }
        @if (projects.length && projects.length < max) {
          <button type="button" class="btn btn-secondary add-row" (click)="addProject()"><app-icon name="plus" [size]="16"></app-icon> Tambah proyek</button>
        }
      </div>
    }
    
    @if (tab === 'awards') {
      <div role="tabpanel" aria-labelledby="ach-tab-awards">
        <p class="ach-sub"><strong>My Awards</strong><span class="ach-pill">{{ awards.length }} Awards</span></p>
        @if (!awards.length) {
          <div class="ach-empty">
            <app-icon name="award" [size]="26"></app-icon>
            <strong>Belum ada penghargaan</strong>
            <span>Tambahkan penghargaan dan pengakuan yang pernah Anda terima.</span>
            <button type="button" class="btn btn-secondary btn-sm" (click)="addAward()"><app-icon name="plus" [size]="16"></app-icon> Tambah penghargaan</button>
          </div>
        }
        @for (a of awards; track a; let i = $index) {
          <article class="repeat">
            <div class="repeat-head">
              <strong>Penghargaan {{ i + 1 }}</strong>
              <button type="button" class="btn btn-ghost btn-sm" (click)="removeAward(i)"><app-icon name="trash" [size]="16"></app-icon> Hapus</button>
            </div>
            <div class="form-grid">
              <label class="field span-2">Nama penghargaan *<input [(ngModel)]="a.name" maxlength="200" [name]="'an' + i" placeholder="Contoh: Juara 1 Lomba Business Case"></label>
              <label class="field">Kategori penghargaan *
                <select [(ngModel)]="a.category" [name]="'ac' + i"><option value="">Pilih kategori</option>@for (c of options.awardCategories; track c) {
                <option [value]="c">{{ c }}</option>
              }</select>
            </label>
            <label class="field">Tingkat pencapaian *
              <select [(ngModel)]="a.level" [name]="'al' + i"><option value="">Pilih tingkat</option>@for (l of options.awardLevels; track l) {
              <option [value]="l">{{ l }}</option>
            }</select>
          </label>
          <label class="field">Institusi pemberi penghargaan<input [(ngModel)]="a.institution" maxlength="200" [name]="'ai' + i" placeholder="Contoh: Kementerian Pendidikan"></label>
          <label class="field">Tanggal pencapaian<input type="date" [(ngModel)]="a.achievementDate" [max]="today" [name]="'ad' + i"></label>
          <label class="field span-2">Deskripsi penghargaan<textarea [(ngModel)]="a.description" [wordLimit]="80" rows="3" [name]="'ax' + i" placeholder="Ceritakan singkat pencapaian Anda"></textarea></label>
          <label class="file-field span-2">Sertifikat / bukti <span class="opt">(opsional)</span> <input type="file" accept=".pdf,application/pdf" [attr.aria-label]="'Bukti penghargaan ' + (i + 1)" (change)="attach.emit({ event: $event, key: awardKey(a) })"><small class="field-hint">{{ docName(awardKey(a)) || 'PDF, maksimal 2 MB' }}</small></label>
        </div>
      </article>
    }
    @if (awards.length && awards.length < max) {
      <button type="button" class="btn btn-secondary add-row" (click)="addAward()"><app-icon name="plus" [size]="16"></app-icon> Tambah penghargaan</button>
    }
    </div>
    }
    </section>
    `
})
export class AchievementsEditorComponent {
  @Input({ required: true }) details!: TalentProfileDetails;
  @Input() today = new Date().toLocaleDateString('en-CA');
  /** Nama file untuk sebuah kunci dokumen (yang baru dipilih atau yang sudah tersimpan). */
  @Input() docName: (key: string) => string = () => '';
  @Output() attach = new EventEmitter<{ event: Event; key: string }>();
  /** Item dihapus: awalan kunci dokumen yang perlu dibuang dari antrean unggahan. */
  @Output() dropDocs = new EventEmitter<string>();

  tab: 'projects' | 'awards' = 'projects';
  readonly options = TALENT_OPTIONS;
  readonly max = MAX_ITEMS;
  readonly projectKey = projectDocKey;
  readonly awardKey = awardDocKey;

  get projects(): ProjectItem[] { return this.details.projects ||= []; }
  get awards(): AwardItem[] { return this.details.awards ||= []; }

  addProject(): void { this.projects.push({ key: crypto.randomUUID(), name: '', description: '', category: '', role: '', organization: '', startDate: '', endDate: '' }); }
  addAward(): void { this.awards.push({ key: crypto.randomUUID(), name: '', description: '', category: '', level: '', institution: '', achievementDate: '' }); }
  removeProject(i: number): void { const [p] = this.projects.splice(i, 1); if (p?.key) this.dropDocs.emit(`project:${p.key}:`); }
  removeAward(i: number): void { const [a] = this.awards.splice(i, 1); if (a?.key) this.dropDocs.emit(`award:${a.key}:`); }
}

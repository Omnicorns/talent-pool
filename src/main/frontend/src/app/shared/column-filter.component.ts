import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from './icon.component';

export type SortDir = 'asc' | 'desc' | null;

/**
 * Filter kolom ala Excel pada header tabel: urutkan A-Z/Z-A, cari nilai, dan centang nilai yang ditampilkan.
 * `selected` null berarti semua nilai tampil.
 */
@Component({
  selector: 'app-column-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <button type="button" class="colfilter-btn" [class.active]="active" (click)="toggle($event)" aria-haspopup="dialog"
      [attr.aria-expanded]="open" [attr.aria-label]="'Filter dan urutkan kolom ' + label">
      <span>{{ label }}</span>
      <app-icon [name]="sort === 'asc' ? 'sort-asc' : sort === 'desc' ? 'sort-desc' : 'filter'" [size]="14"></app-icon>
    </button>

    <div class="colfilter-pop" *ngIf="open" [style.top.px]="top" [style.left.px]="left" [style.maxHeight.px]="maxHeight"
      role="dialog" [attr.aria-label]="'Filter ' + label" (keydown.escape)="close()">
      <button type="button" class="colfilter-item" [class.on]="sort === 'asc'" (click)="applySort('asc')"><app-icon name="sort-asc" [size]="16"></app-icon> Urutkan A ke Z</button>
      <button type="button" class="colfilter-item" [class.on]="sort === 'desc'" (click)="applySort('desc')"><app-icon name="sort-desc" [size]="16"></app-icon> Urutkan Z ke A</button>
      <button type="button" class="colfilter-item" *ngIf="sort" (click)="applySort(null)"><app-icon name="x" [size]="16"></app-icon> Hapus pengurutan</button>
      <hr>
      <label class="bo-search colfilter-search">
        <span class="sr-only">Cari nilai</span>
        <app-icon name="search" [size]="15"></app-icon>
        <input [ngModel]="term" (ngModelChange)="onSearch($event)" name="colTerm" placeholder="Cari" autocomplete="off">
      </label>
      <div class="colfilter-list" role="group" [attr.aria-label]="'Pilih nilai ' + label">
        <label class="check">
          <input type="checkbox" [checked]="allShownChecked" [indeterminate]="someShownChecked" (change)="toggleAll($any($event.target).checked)">
          <span>(Pilih semua)</span>
        </label>
        <label class="check" *ngFor="let option of shown">
          <input type="checkbox" [checked]="draft.has(option)" (change)="toggleOne(option, $any($event.target).checked)">
          <span>{{ option }}</span>
        </label>
        <p class="muted colfilter-empty" *ngIf="!shown.length">Tidak ada nilai yang cocok.</p>
      </div>
      <footer class="colfilter-foot">
        <button type="button" class="btn btn-ghost btn-sm" (click)="reset()" [disabled]="selected === null">Reset</button>
        <span class="spacer"></span>
        <button type="button" class="btn btn-secondary btn-sm" (click)="close()">Batal</button>
        <button type="button" class="btn btn-primary btn-sm" (click)="apply()" [disabled]="!draft.size">OK</button>
      </footer>
    </div>
  `,
  styles: [':host { display: inline-block; }'],
})
export class ColumnFilterComponent implements OnInit, OnDestroy {
  @Input() label = '';
  @Input() options: string[] = [];
  @Input() selected: string[] | null = null;
  @Input() sort: SortDir = null;
  @Output() selectedChange = new EventEmitter<string[] | null>();
  @Output() sortChange = new EventEmitter<SortDir>();

  open = false;
  term = '';
  draft = new Set<string>();
  top = 0;
  left = 0;
  maxHeight = 420;
  private readonly onScroll = (event: Event) => {
    if (this.open && !(event.target as HTMLElement)?.closest?.('.colfilter-pop')) this.close();
  };

  constructor(private host: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    document.addEventListener('scroll', this.onScroll, true);
  }

  ngOnDestroy(): void {
    document.removeEventListener('scroll', this.onScroll, true);
  }

  get active(): boolean {
    return this.selected !== null || this.sort !== null;
  }

  get shown(): string[] {
    const term = this.term.trim().toLowerCase();
    return term ? this.options.filter((o) => o.toLowerCase().includes(term)) : this.options;
  }

  get allShownChecked(): boolean {
    return this.shown.length > 0 && this.shown.every((o) => this.draft.has(o));
  }

  get someShownChecked(): boolean {
    return !this.allShownChecked && this.shown.some((o) => this.draft.has(o));
  }

  toggle(event: Event): void {
    event.stopPropagation();
    if (this.open) { this.close(); return; }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const width = 280;
    this.left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    this.top = rect.bottom + 6;
    this.maxHeight = Math.max(260, window.innerHeight - this.top - 12);
    this.term = '';
    this.draft = new Set(this.selected === null ? this.options : this.selected);
    this.open = true;
  }

  close(): void {
    this.open = false;
  }

  /** Seperti Excel: mengetik pencarian otomatis memilih hanya nilai yang cocok. */
  onSearch(value: string): void {
    this.term = value;
    this.draft = new Set(value.trim() ? this.shown : this.options);
  }

  toggleAll(checked: boolean): void {
    const next = new Set(this.draft);
    this.shown.forEach((o) => (checked ? next.add(o) : next.delete(o)));
    this.draft = next;
  }

  toggleOne(option: string, checked: boolean): void {
    const next = new Set(this.draft);
    if (checked) next.add(option); else next.delete(option);
    this.draft = next;
  }

  applySort(dir: SortDir): void {
    this.sortChange.emit(this.sort === dir ? null : dir);
    this.close();
  }

  apply(): void {
    const all = this.options.every((o) => this.draft.has(o));
    this.selectedChange.emit(all ? null : this.options.filter((o) => this.draft.has(o)));
    this.close();
  }

  reset(): void {
    this.selectedChange.emit(null);
    this.close();
  }

  @HostListener('document:click', ['$event'])
  outside(event: MouseEvent): void {
    if (this.open && !event.composedPath().includes(this.host.nativeElement)) this.close();
  }

  @HostListener('document:keydown.escape')
  escape(): void {
    this.close();
  }

  @HostListener('window:resize')
  resized(): void {
    this.close();
  }
}

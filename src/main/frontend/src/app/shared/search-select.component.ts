import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ReferenceDataService } from '../core/service/api/reference-data.service';

let nextId = 0;

/**
 * Kolom isian dengan saran pencarian (combobox) untuk daftar panjang, mis. ~4.700 perguruan tinggi.
 * Pengguna bebas mengetik nilai sendiri bila tidak ada di daftar.
 */
@Component({
  selector: 'app-search-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ss">
      <input type="text" role="combobox" autocomplete="off" [attr.aria-label]="label" [placeholder]="placeholder"
        [attr.aria-expanded]="open && shown.length > 0" [attr.aria-controls]="id" aria-autocomplete="list"
        [attr.aria-activedescendant]="active >= 0 ? id + '-' + active : null" [value]="value || ''" [attr.maxlength]="maxlength"
        (input)="typed($any($event.target).value)" (focus)="onFocus()" (blur)="close()" (keydown)="keys($event)">
      <ul class="ss-list" *ngIf="open && shown.length" [id]="id" role="listbox">
        <li *ngIf="!query" class="ss-hint" aria-hidden="true">Populer — ketik untuk mencari di {{ total | number }} pilihan</li>
        <li *ngFor="let item of shown; let i = index" role="option" [id]="id + '-' + i" [class.on]="i === active"
          [attr.aria-selected]="i === active" (mousedown)="$event.preventDefault(); pick(item)" (mousemove)="active = i">{{ item }}</li>
        <li *ngIf="query" class="ss-hint" aria-hidden="true">Tidak ada di daftar? Tetap gunakan tulisan Anda.</li>
      </ul>
    </div>
  `,
  styles: [`
    .ss { position: relative; }
    .ss-list { position: absolute; z-index: 30; left: 0; right: 0; top: calc(100% + 4px); margin: 0; padding: 4px; list-style: none; max-height: 280px; overflow-y: auto; background: var(--white, #fff); border: 1px solid var(--line, #e5e0db); border-radius: 12px; box-shadow: 0 14px 32px rgba(31, 27, 24, .14); }
    .ss-list li[role=option] { padding: 9px 12px; border-radius: 8px; font-size: 14.5px; cursor: pointer; line-height: 1.35; }
    .ss-list li.on { background: var(--surface, #f5f3f1); }
    .ss-hint { padding: 8px 12px 6px; font-size: 12.5px; color: var(--muted, #6b645e); }
  `],
})
export class SearchSelectComponent implements OnInit, OnChanges {
  /** Sumber daftar acuan. */
  @Input() source: 'campus' | 'major' = 'campus';
  /** Pilihan populer yang ditampilkan saat kolom kosong. */
  @Input() popular: string[] = [];
  @Input() value: string | null | undefined = '';
  @Input() label = 'Pilihan';
  @Input() placeholder = 'Ketik untuk mencari';
  @Input() maxlength: number | null = 150;
  @Output() valueChange = new EventEmitter<string>();

  readonly id = 'ss-' + nextId++;
  open = false;
  active = -1;
  shown: string[] = [];
  query = '';
  total = 0;
  private list: string[] = [];
  private top: string[] = [];

  constructor(private data: ReferenceDataService, private host: ElementRef<HTMLElement>, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.source === 'campus') {
      this.data.campuses().subscribe((list) => { this.list = list; this.total = list.length; this.refresh(); });
    } else {
      this.data.majors().subscribe((list) => { this.list = list; this.total = list.length; this.refresh(); });
      this.data.topMajors().subscribe((top) => { this.top = top; this.refresh(); });
    }
  }

  ngOnChanges(): void { this.refresh(); }

  onFocus(): void { this.query = ''; this.open = true; this.refresh(); this.cdr.detectChanges(); }

  close(): void { this.open = false; this.active = -1; this.cdr.detectChanges(); }

  typed(text: string): void {
    this.valueChange.emit(text);
    this.query = text.trim();
    this.open = true;
    this.active = -1;
    this.refresh();
    this.cdr.detectChanges();
  }

  pick(item: string): void {
    this.valueChange.emit(item);
    this.query = '';
    this.close();
  }

  keys(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') { event.preventDefault(); this.open = true; this.active = Math.min(this.shown.length - 1, this.active + 1); this.scrollActive(); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); this.active = Math.max(-1, this.active - 1); this.scrollActive(); }
    else if (event.key === 'Enter' && this.open && this.active >= 0) { event.preventDefault(); this.pick(this.shown[this.active]); }
    else if (event.key === 'Escape' && this.open) { event.stopPropagation(); this.close(); }
    this.cdr.detectChanges();
  }

  @HostListener('window:resize') onResize(): void { /* daftar mengikuti lebar kolom; tidak ada yang perlu dihitung */ }

  private scrollActive(): void {
    setTimeout(() => this.host.nativeElement.querySelector('li.on')?.scrollIntoView({ block: 'nearest' }));
  }

  private refresh(): void {
    const q = this.query.toLowerCase();
    if (!q) {
      this.shown = (this.popular.length ? this.popular : this.top).slice(0, 8);
      return;
    }
    const tokens = q.split(/\s+/).filter(Boolean);
    const prefix: string[] = [], word: string[] = [], rest: string[] = [];
    for (const item of this.list) {
      const low = item.toLowerCase();
      if (!tokens.every((t) => low.includes(t))) continue;
      if (low.startsWith(q)) prefix.push(item);
      else if (low.split(/[\s(]+/).some((w) => w.startsWith(tokens[0]))) word.push(item);
      else rest.push(item);
    }
    this.shown = [...prefix, ...word, ...rest].slice(0, 8);
  }
}

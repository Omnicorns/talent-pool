import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from './icon.component';

/** Navigasi halaman untuk daftar back office. `page` berbasis 0 (sama dengan API). */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <nav class="pager" *ngIf="total > 0" aria-label="Navigasi halaman">
      <p class="pager-info">Menampilkan <strong>{{ from }}–{{ to }}</strong> dari <strong>{{ total }}</strong></p>

      <div class="pager-controls">
        <label class="pager-size">
          <span>Per halaman</span>
          <select class="select-inline" [ngModel]="size" (ngModelChange)="sizeChange.emit(+$event)" aria-label="Jumlah data per halaman">
            <option *ngFor="let option of sizes" [ngValue]="option">{{ option }}</option>
          </select>
        </label>

        <div class="pager-pages" *ngIf="pages > 1">
          <button type="button" class="pager-btn" (click)="go(page - 1)" [disabled]="page === 0" aria-label="Halaman sebelumnya">
            <app-icon name="chevron-left" [size]="16"></app-icon>
          </button>
          <ng-container *ngFor="let item of items">
            <span class="pager-gap" *ngIf="item === -1" aria-hidden="true">…</span>
            <button type="button" class="pager-btn" *ngIf="item !== -1" [class.active]="item === page"
              [attr.aria-current]="item === page ? 'page' : null" [attr.aria-label]="'Halaman ' + (item + 1)" (click)="go(item)">{{ item + 1 }}</button>
          </ng-container>
          <button type="button" class="pager-btn" (click)="go(page + 1)" [disabled]="page >= pages - 1" aria-label="Halaman berikutnya">
            <app-icon name="chevron-right" [size]="16"></app-icon>
          </button>
        </div>
      </div>
    </nav>
  `,
})
export class PaginationComponent {
  @Input() page = 0;
  @Input() size = 10;
  @Input() total = 0;
  @Input() sizes: number[] = [10, 20, 50];
  @Output() pageChange = new EventEmitter<number>();
  @Output() sizeChange = new EventEmitter<number>();

  get pages(): number {
    return Math.max(1, Math.ceil(this.total / Math.max(1, this.size)));
  }

  get from(): number {
    return this.total ? this.page * this.size + 1 : 0;
  }

  get to(): number {
    return Math.min(this.total, (this.page + 1) * this.size);
  }

  /** Nomor halaman yang ditampilkan; -1 berarti titik-titik. */
  get items(): number[] {
    const last = this.pages - 1;
    const keep = new Set<number>([0, last, this.page - 1, this.page, this.page + 1]);
    const sorted = [...keep].filter((n) => n >= 0 && n <= last).sort((a, b) => a - b);
    const result: number[] = [];
    sorted.forEach((n, i) => {
      if (i && n - sorted[i - 1] > 1) result.push(-1);
      result.push(n);
    });
    return result;
  }

  go(target: number): void {
    if (target < 0 || target >= this.pages || target === this.page) return;
    this.pageChange.emit(target);
  }
}

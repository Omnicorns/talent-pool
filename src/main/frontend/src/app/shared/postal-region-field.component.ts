import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TalentPortalService } from '../core/service/api/talent-portal.service';

/** Pasangan kode pos + pilihan wilayah (kelurahan, kecamatan, kota) yang diisi dari data kode pos. */
@Component({
  selector: 'app-postal-region-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-grid">
      <label class="field">{{ codeLabel }}
        <input [ngModel]="postalCode || ''" (ngModelChange)="onCode($event)" inputmode="numeric" maxlength="5" placeholder="5 digit" [attr.aria-label]="codeLabel">
        <small [class.field-error]="!!error">{{ loading ? 'Mencari wilayah…' : error }}</small>
      </label>
      <label class="field">{{ regionLabel }}
        <select [ngModel]="region || ''" (ngModelChange)="regionChange.emit($event)" [disabled]="loading || !regions.length" [attr.aria-label]="regionLabel">
          <option value="">{{ regions.length ? 'Pilih wilayah' : 'Isi kode pos terlebih dahulu' }}</option>
          <option *ngFor="let item of regions" [value]="item">{{ item }}</option>
        </select>
      </label>
    </div>
  `,
})
export class PostalRegionFieldComponent implements OnChanges {
  @Input() postalCode: string | null | undefined = '';
  @Input() region: string | null | undefined = '';
  @Input() codeLabel = 'Kode pos';
  @Input() regionLabel = 'Kelurahan, kecamatan, kota';
  @Output() postalCodeChange = new EventEmitter<string>();
  @Output() regionChange = new EventEmitter<string>();
  regions: string[] = [];
  loading = false;
  error = '';
  private loadedFor = '';

  constructor(private portal: TalentPortalService) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Muat daftar wilayah untuk kode pos yang sudah tersimpan (mis. saat form dibuka).
    const code = this.postalCode || '';
    if (changes['postalCode'] && /^\d{5}$/.test(code) && this.loadedFor !== code) this.load(code, false);
  }

  onCode(code: string): void {
    this.postalCodeChange.emit(code);
    this.regionChange.emit('');
    this.regions = [];
    this.error = '';
    this.loadedFor = '';
    if (/^\d{5}$/.test(code)) this.load(code, true);
    else this.loading = false;
  }

  private load(code: string, changed: boolean): void {
    this.loadedFor = code;
    this.loading = true;
    this.portal.postalCodes(code).subscribe({
      next: (regions) => {
        if (this.loadedFor !== code) return;
        this.loading = false;
        this.regions = regions;
        this.error = regions.length ? '' : 'Kode pos tidak ditemukan. Periksa kembali kode pos Anda.';
        const current = this.region || '';
        if (!changed && current && !regions.includes(current)) this.regionChange.emit('');
        if (regions.length === 1) this.regionChange.emit(regions[0]);
      },
      error: () => {
        if (this.loadedFor !== code) return;
        this.loading = false;
        this.error = 'Wilayah gagal dimuat. Ketik kembali kode pos untuk mencoba lagi.';
      },
    });
  }
}

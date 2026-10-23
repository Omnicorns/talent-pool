import { SortDir } from './column-filter.component';

export interface ColDef<T> {
  key: string;
  label: string;
  /** Teks yang tampil dan dipakai sebagai nilai filter. */
  value: (row: T) => string;
  /** Nilai pengurutan bila berbeda dari teks (mis. tanggal). */
  sortValue?: (row: T) => string | number;
}

/** Filter kolom ala Excel (centang + urutkan) untuk tabel yang datanya sudah dimuat di klien. */
export class TableFilters<T> {
  filters: Record<string, string[] | null> = {};
  sort: { key: string; dir: 'asc' | 'desc' } | null = null;
  private cache = new Map<string, { sig: string; list: string[] }>();

  constructor(public cols: ColDef<T>[]) {}

  options(rows: T[], key: string): string[] {
    const col = this.cols.find((c) => c.key === key)!;
    const list = [...new Set(rows.map((r) => col.value(r)).filter((v) => v !== ''))].sort((a, b) => a.localeCompare(b, 'id'));
    const sig = list.join('\u0001');
    const hit = this.cache.get(key);
    if (hit && hit.sig === sig) return hit.list;
    this.cache.set(key, { sig, list });
    return list;
  }

  apply(rows: T[]): T[] {
    let out = rows.filter((r) => this.cols.every((c) => {
      const sel = this.filters[c.key];
      return !sel || sel.includes(c.value(r));
    }));
    if (this.sort) {
      const col = this.cols.find((c) => c.key === this.sort!.key)!;
      const pick = col.sortValue || col.value;
      const dir = this.sort.dir === 'asc' ? 1 : -1;
      out = [...out].sort((a, b) => {
        const x = pick(a), y = pick(b);
        return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'id')) * dir;
      });
    }
    return out;
  }

  setFilter(key: string, selected: string[] | null): void { this.filters[key] = selected; }

  setSort(key: string, dir: SortDir): void { this.sort = dir ? { key, dir } : null; }

  sortFor(key: string): SortDir { return this.sort?.key === key ? this.sort.dir : null; }

  get active(): boolean { return Object.values(this.filters).some((v) => !!v); }

  clear(): void { this.filters = {}; }
}

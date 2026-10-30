import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, shareReplay, catchError, map } from 'rxjs';

/**
 * Daftar acuan statis: perguruan tinggi (PDDikti, nama asli) dan program studi (bahasa Inggris).
 * Tiap entri berupa pasangan [nama tampil, nama asli Indonesia]; nama asli ikut dicari agar pencarian tetap menemukan.
 * Dimuat sekali, saat pertama dibutuhkan.
 */
export type RefEntry = [string, string];

@Injectable({ providedIn: 'root' })
export class ReferenceDataService {
  private campuses$?: Observable<RefEntry[]>;
  private majors$?: Observable<{ all: RefEntry[]; top: string[] }>;

  constructor(private http: HttpClient) {}

  campuses(): Observable<RefEntry[]> {
    return this.campuses$ ||= this.http.get<string[]>('data/kampus.json').pipe(map((l) => l.map((n): RefEntry => [n, n])), catchError(() => of([] as RefEntry[])), shareReplay(1));
  }

  majors(): Observable<RefEntry[]> {
    return this.majorData().pipe(map((d) => d.all));
  }

  topMajors(): Observable<string[]> {
    return this.majorData().pipe(map((d) => d.top));
  }

  private majorData() {
    return this.majors$ ||= this.http.get<{ all: RefEntry[]; top: string[] }>('data/prodi.json').pipe(catchError(() => of({ all: [], top: [] })), shareReplay(1));
  }
}
